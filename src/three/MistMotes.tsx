'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PROFILES } from './quality'
import { useExperience } from '@/store/experience'
import { scroll } from '@/lib/scroll'

/**
 * Airborne particulate: dust, spore, the suggestion of moisture.
 *
 * Points, not instanced meshes. The crossover is roughly a thousand particles:
 * below it an InstancedMesh costs more in per-instance matrix updates than it
 * saves, and above roughly fifty thousand a CPU-updated attribute becomes the
 * bottleneck and the simulation belongs in an FBO. This sits in the first band,
 * so a single BufferGeometry with a custom point shader is the cheap answer.
 *
 * Motion is evaluated in the shader from a per-particle phase, so nothing is
 * written back to the attribute buffer after upload — the CPU cost per frame is
 * one uniform.
 */
export type MistMotesProps = {
  count?: number
  depth?: number
  spread?: number
  color?: string
  size?: number
  opacity?: number
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uScrollDrift;
  attribute float aPhase;
  attribute float aScale;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Two incommensurable frequencies per axis: no visible period, no shimmer.
    p.x += sin(uTime * 0.11 + aPhase * 6.283) * 1.4;
    p.y += cos(uTime * 0.083 + aPhase * 4.712) * 0.9 + uScrollDrift;
    p.z += sin(uTime * 0.061 + aPhase * 2.718) * 0.7;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Perspective-correct size with a hard ceiling. Without the clamp a mote
    // that drifts close to the near plane fills a quarter of the screen.
    gl_PointSize = clamp(uSize * aScale * (60.0 / max(-mv.z, 0.001)), 1.0, 26.0);

    // Fade at both ends of the depth range so motes are never seen to pop.
    float d = -mv.z;
    vAlpha = smoothstep(0.5, 4.0, d) * (1.0 - smoothstep(28.0, 44.0, d));
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // Soft-shouldered disc. A hard circle reads as a bokeh sprite, not as air.
    // 1.0 - ascending, never a descending smoothstep: GLSL leaves
    // smoothstep undefined when edge0 >= edge1 and drivers genuinely differ.
    float a = 1.0 - smoothstep(0.06, 0.5, d);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
    if (gl_FragColor.a < 0.004) discard;
  }
`

export function MistMotes({
  count = 400,
  depth = 12,
  spread = 20,
  color = '#5A6764',
  size = 1.5,
  opacity = 0.28,
}: MistMotesProps) {
  const tier = useExperience((s) => s.quality)
  const reduced = useExperience((s) => s.reducedMotion)
  const material = useRef<THREE.ShaderMaterial>(null)

  const n = Math.max(24, Math.round(count * PROFILES[tier].particleScale))

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(n * 3)
    const phase = new Float32Array(n)
    const scale = new Float32Array(n)
    // Deterministic scatter: a seeded LCG, so the same frame renders the same
    // way on every reload and across SSR/CSR. Math.random() here would make
    // the hero flicker differently on every visit for no benefit.
    let seed = 0x2f6b5a
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff)
    for (let i = 0; i < n; i++) {
      pos[i * 3 + 0] = (rnd() - 0.5) * spread * 1.9
      pos[i * 3 + 1] = (rnd() - 0.5) * spread * 0.85
      pos[i * 3 + 2] = -rnd() * depth * 2.4
      phase[i] = rnd()
      scale[i] = 0.4 + rnd() * rnd() * 2.2
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    return g
  }, [n, depth, spread])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uScrollDrift: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [size, color, opacity],
  )

  // Geometry built imperatively in a useMemo is exactly the resource R3F will
  // not clean up for us.
  useMemo(() => geometry, [geometry])
  useFrame((_, dt) => {
    if (!material.current) return
    if (!reduced) material.current.uniforms.uTime.value += dt
    material.current.uniforms.uScrollDrift.value = -scroll.smooth * 6
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-50}>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
        toneMapped={false}
      />
    </points>
  )
}
