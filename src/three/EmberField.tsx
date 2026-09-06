'use client'

import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EMBER_FRAG, EMBER_VERT, SMOKE_FRAG, SMOKE_VERT } from '@/shaders/embers'
import { PROFILES } from './quality'
import { useExperience } from '@/store/experience'

export type EmberFieldProps = {
  count?: number
  smokeCount?: number
  /** Half-extent of the spawn area, in world units. */
  source?: [number, number]
  origin?: [number, number, number]
  rise?: number
  wind?: [number, number, number]
  turbulence?: number
  spread?: number
  /** Read every frame. 0 puts the fire out; 1 is full burn. */
  intensity?: () => number
}

/** Deterministic LCG — the fire must look the same on every load. */
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff)
}

function buildGeometry(n: number, source: [number, number], origin: [number, number, number], seed: number, lifeRange: [number, number]) {
  const g = new THREE.BufferGeometry()
  const pos = new Float32Array(n * 3)
  const orig = new Float32Array(n * 3)
  const birth = new Float32Array(n)
  const life = new Float32Array(n)
  const rand = new Float32Array(n)
  const scale = new Float32Array(n)
  const rng = makeRng(seed)
  for (let i = 0; i < n; i++) {
    const x = origin[0] + (rng() - 0.5) * source[0] * 2
    const z = origin[2] + (rng() - 0.5) * source[1] * 2
    const y = origin[1] + rng() * 0.4
    orig[i * 3] = x
    orig[i * 3 + 1] = y
    orig[i * 3 + 2] = z
    // `position` is unused by the shader but three requires it for the draw range.
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    birth[i] = rng()
    life[i] = lifeRange[0] + rng() * (lifeRange[1] - lifeRange[0])
    rand[i] = rng() * 100
    // Cubed so the distribution is dominated by very small sparks with a rare
    // large one, which is what a fire actually throws.
    const r = rng()
    scale[i] = 0.12 + r * r * r * 1.6
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aOrigin', new THREE.BufferAttribute(orig, 3))
  g.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1))
  g.setAttribute('aLife', new THREE.BufferAttribute(life, 1))
  g.setAttribute('aSeed', new THREE.BufferAttribute(rand, 1))
  g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
  // Point clouds have no meaningful bounding sphere here because the simulation
  // moves them in the shader; culling against the spawn box would pop the plume
  // out of existence the moment the camera looks up.
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...origin), 500)
  return g
}

/**
 * Chapter 12. Fire is the only thing in this project allowed to emit light, and
 * the only place the palette gets to run hot.
 */
export function EmberField({
  count = 4200,
  smokeCount = 1400,
  source = [7, 3],
  origin = [0, -2.2, -4],
  rise = 1.9,
  wind = [0.55, 0, -0.12],
  turbulence = 0.9,
  spread = 1.1,
  intensity,
}: EmberFieldProps) {
  const tier = useExperience((s) => s.quality)
  const reduced = useExperience((s) => s.reducedMotion)
  const scale = PROFILES[tier].particleScale

  const emberMat = useRef<THREE.ShaderMaterial>(null)
  const smokeMat = useRef<THREE.ShaderMaterial>(null)

  const [emberSprite, smokeSprite] = useTexture([
    '/assets/generated/img/sprite/ember-01.webp',
    '/assets/generated/img/ink/wash-cloud-01.webp',
  ])

  useMemo(() => {
    for (const t of [emberSprite, smokeSprite]) {
      if (!t) continue
      t.colorSpace = THREE.NoColorSpace
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    }
  }, [emberSprite, smokeSprite])

  const nEmbers = Math.max(400, Math.round(count * scale))
  const nSmoke = Math.max(80, Math.round(smokeCount * scale))

  const emberGeo = useMemo(
    () => buildGeometry(nEmbers, source, origin, 0xc1352b, [2.6, 7.5]),
    [nEmbers, source, origin],
  )
  const smokeGeo = useMemo(
    () => buildGeometry(nSmoke, [source[0] * 1.3, source[1] * 1.3], origin, 0x1b2321, [9, 20]),
    [nSmoke, source, origin],
  )

  // Geometry built in a useMemo is exactly what R3F will not dispose for us.
  useEffect(() => () => {
    emberGeo.dispose()
    smokeGeo.dispose()
  }, [emberGeo, smokeGeo])

  const emberUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1.15 },
      uRise: { value: rise },
      uWind: { value: new THREE.Vector3(...wind) },
      uTurbulence: { value: turbulence },
      uSpread: { value: spread },
      uIntensity: { value: 1 },
      uSprite: { value: emberSprite },
      // Doctrine: gold is expenditure, cinnabar is the bill. Fire spends, then bills.
      uHot: { value: new THREE.Color('#FFE6BC') },
      uWarm: { value: new THREE.Color('#C9A227') },
      uCool: { value: new THREE.Color('#C1352B') },
      uDead: { value: new THREE.Color('#3B0F09') },
    }),
    [rise, wind, turbulence, spread, emberSprite],
  )

  const smokeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 6.0 },
      uRise: { value: rise * 0.5 },
      uWind: { value: new THREE.Vector3(...wind) },
      uSpread: { value: spread * 2.2 },
      uIntensity: { value: 1 },
      uSprite: { value: smokeSprite },
      uSmoke: { value: new THREE.Color('#0E1211') },
    }),
    [rise, wind, spread, smokeSprite],
  )

  useFrame((_, dt) => {
    const step = reduced ? 0 : dt
    const i = intensity ? THREE.MathUtils.clamp(intensity(), 0, 1) : 1
    if (emberMat.current) {
      emberMat.current.uniforms.uTime.value += step
      emberMat.current.uniforms.uIntensity.value = i
    }
    if (smokeMat.current) {
      smokeMat.current.uniforms.uTime.value += step
      smokeMat.current.uniforms.uIntensity.value = i
    }
  })

  return (
    <group>
      {/* Smoke first and NORMAL blended: additive smoke lightens a night scene
          into grey fog, which is the single most common way a fire effect fails. */}
      <points geometry={smokeGeo} renderOrder={5}>
        <shaderMaterial
          ref={smokeMat}
          vertexShader={SMOKE_VERT}
          fragmentShader={SMOKE_FRAG}
          uniforms={smokeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
        />
      </points>
      <points geometry={emberGeo} renderOrder={6}>
        <shaderMaterial
          ref={emberMat}
          vertexShader={EMBER_VERT}
          fragmentShader={EMBER_FRAG}
          uniforms={emberUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
