'use client'

import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  INK_DISSOLVE_DEFAULTS,
  INK_DISSOLVE_FRAG,
  INK_DISSOLVE_VERT,
} from '@/shaders/inkDissolve'
import { useExperience } from '@/store/experience'
import { damp } from '@/lib/scroll'

export type InkPlaneProps = {
  /** Artwork whose alpha channel is ink coverage. Omit for a pure ink field. */
  map?: string
  /** Paper fibre / grain map. Its red channel modulates the wet front. */
  fibre?: string
  /** Read once per frame. Keep this pointed at a ref or the scroll snapshot —
   *  never at React state. */
  progress: () => number
  /**
   * Ink Law §2: density is monotonic, it only ever increases. With this on, a
   * reader who scrolls back up does not un-ink the page. Leave it on for
   * anything that represents a commitment; turn it off for a preview.
   */
  monotonic?: boolean
  /** Fills the camera frustum at `distance` in front of it. */
  fullscreen?: boolean
  distance?: number
  width?: number
  height?: number
  seed?: number
  opaque?: boolean
  useMapColor?: boolean
  /** The cursor wets the paper ahead of the front. Hero and decision nodes only. */
  pointerBrush?: boolean
  /** Ink colour as an sRGB hex string. Converted to linear at upload. */
  ink?: string
  rimColor?: string
  /** Artwork size in plane units. [1,1] fills the frame; [0.42,0.42] composes it. */
  mapScale?: [number, number]
  /** Artwork centre in aspect-corrected plane space; x is scaled by aspect. */
  mapOffset?: [number, number]
  uniforms?: Partial<Record<string, number | string | [number, number] | [number, number, number]>>
  renderOrder?: number
}

const hexToRgb = (hex: string): [number, number, number] => {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

export function InkPlane({
  map,
  fibre = '/assets/generated/img/ink/paper-fibre-01.webp',
  progress,
  monotonic = true,
  fullscreen = true,
  distance = 4,
  width = 10,
  height = 6,
  seed = 0,
  opaque = false,
  useMapColor = false,
  pointerBrush = false,
  ink,
  rimColor,
  mapScale,
  mapOffset,
  uniforms: overrides,
  renderOrder = 0,
}: InkPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const reduced = useExperience((s) => s.reducedMotion)
  const highWater = useRef(0)
  const pointer = useRef(new THREE.Vector2(-99, -99))
  const pointerTarget = useRef(new THREE.Vector2(-99, -99))

  const urls = useMemo(() => (map ? [fibre, map] : [fibre]), [fibre, map])
  const textures = useTexture(urls)
  const [fibreTex, mapTex] = Array.isArray(textures) ? textures : [textures, undefined]

  useMemo(() => {
    if (fibreTex) {
      fibreTex.wrapS = fibreTex.wrapT = THREE.RepeatWrapping
      fibreTex.colorSpace = THREE.NoColorSpace // data, not colour
    }
    if (mapTex) {
      mapTex.colorSpace = THREE.SRGBColorSpace
      mapTex.wrapS = mapTex.wrapT = THREE.ClampToEdgeWrapping
    }
  }, [fibreTex, mapTex])

  const uniforms = useMemo(() => {
    const d = INK_DISSOLVE_DEFAULTS
    const u: Record<string, THREE.IUniform> = {
      uMap: { value: mapTex ?? null },
      uFibre: { value: fibreTex ?? null },
      uHasMap: { value: mapTex ? 1 : 0 },
      uUseMapColor: { value: useMapColor ? 1 : 0 },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uAspect: { value: 1 },
      // THREE.Color converts an sRGB hex into the renderer's linear working
      // space, which is what the shader must receive.
      uInk: { value: new THREE.Color(ink ?? d.uInk) },
      uRimColor: { value: new THREE.Color(rimColor ?? d.uRimColor) },
      uPaper: { value: new THREE.Color(d.uPaper) },
      uOpaque: { value: opaque ? 1 : 0 },
      uNoiseScale: { value: d.uNoiseScale },
      uFibreScale: { value: d.uFibreScale },
      uFibreInfluence: { value: d.uFibreInfluence },
      uEdgeSoftness: { value: d.uEdgeSoftness },
      uTurbulence: { value: d.uTurbulence },
      uFlowSpeed: { value: d.uFlowSpeed },
      uCurlScale: { value: d.uCurlScale },
      uRimWidth: { value: d.uRimWidth },
      uRimStrength: { value: d.uRimStrength },
      uFlyingWhite: { value: d.uFlyingWhite },
      uGranulation: { value: d.uGranulation },
      uCoverageBias: { value: d.uCoverageBias },
      uOpacity: { value: d.uOpacity },
      uPointer: { value: new THREE.Vector2(-99, -99) },
      uPointerRadius: { value: d.uPointerRadius },
      uPointerInfluence: { value: pointerBrush ? d.uPointerInfluence : 0 },
      uMapScale: { value: new THREE.Vector2(...(mapScale ?? d.uMapScale)) },
      uMapOffset: { value: new THREE.Vector2(...(mapOffset ?? d.uMapOffset)) },
    }
    for (const [k, v] of Object.entries(overrides ?? {})) {
      if (!(k in u)) continue
      if (typeof v === 'string') {
        u[k].value = new THREE.Color(v)
      } else if (!Array.isArray(v)) {
        u[k].value = v
      } else if (v.length === 2) {
        u[k].value = new THREE.Vector2(v[0], v[1])
      } else {
        u[k].value = new THREE.Vector3(v[0], v[1], v[2])
      }
    }
    return u
    // Textures are swapped in imperatively below rather than rebuilding the
    // uniform block, which would force a shader recompile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMemo(() => {
    uniforms.uMap.value = mapTex ?? null
    uniforms.uFibre.value = fibreTex ?? null
    uniforms.uHasMap.value = mapTex ? 1 : 0
  }, [uniforms, mapTex, fibreTex])

  // Pointer is tracked on the window, not on the mesh: the plane sits behind
  // the DOM content, so raycasting it would be blocked by every overlay.
  useEffect(() => {
    if (!pointerBrush) return
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointerTarget.current.set((x * 0.5) * (window.innerWidth / window.innerHeight), y * 0.5)
    }
    const onLeave = () => pointerTarget.current.set(-99, -99)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [pointerBrush])

  useFrame((state, dt) => {
    const m = materialRef.current
    if (!m) return

    if (pointerBrush) {
      const t = pointerTarget.current
      const c = pointer.current
      if (t.x < -50) {
        c.set(-99, -99)
      } else {
        if (c.x < -50) c.copy(t)
        else c.set(damp(c.x, t.x, 9, dt), damp(c.y, t.y, 9, dt))
      }
      ;(m.uniforms.uPointer.value as THREE.Vector2).copy(c)
    }

    let p = THREE.MathUtils.clamp(progress(), 0, 1)
    if (monotonic) {
      highWater.current = Math.max(highWater.current, p)
      p = highWater.current
    }
    m.uniforms.uProgress.value = p
    // Reduced motion still shows ink — it just does not see it move.
    if (!reduced) m.uniforms.uTime.value += dt

    if (fullscreen && meshRef.current) {
      const fovRad = camera.fov * THREE.MathUtils.DEG2RAD
      const h = 2 * Math.tan(fovRad / 2) * distance
      const w = h * (size.width / Math.max(size.height, 1))
      meshRef.current.scale.set(w, h, 1)
      meshRef.current.position.set(0, 0, -distance)
      meshRef.current.quaternion.identity()
      camera.localToWorld(meshRef.current.position)
      meshRef.current.quaternion.copy(camera.quaternion)
      m.uniforms.uAspect.value = w / h
    } else {
      m.uniforms.uAspect.value = width / height
    }
  })

  return (
    <mesh ref={meshRef} renderOrder={renderOrder} frustumCulled={!fullscreen}>
      <planeGeometry args={fullscreen ? [1, 1] : [width, height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={INK_DISSOLVE_VERT}
        fragmentShader={INK_DISSOLVE_FRAG}
        uniforms={uniforms}
        transparent={!opaque}
        depthWrite={opaque}
        depthTest={!fullscreen}
        toneMapped={false}
      />
    </mesh>
  )
}

export const INK_PALETTE = {
  ink: hexToRgb('#1B2321'),
  inkDeep: hexToRgb('#0B0F0E'),
  paper: hexToRgb('#F4F0E6'),
  jade: hexToRgb('#2F6B5A'),
  gold: hexToRgb('#C9A227'),
  vermilion: hexToRgb('#C1352B'),
} as const
