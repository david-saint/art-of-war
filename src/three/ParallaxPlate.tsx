'use client'

import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { damp, scroll } from '@/lib/scroll'
import { useExperience } from '@/store/experience'

/**
 * A painted depth layer.
 *
 * Parallax Law: the layers are placed in real Z and the perspective camera does
 * the work. The thing that makes a parallax site look like 2010 is offsetting
 * 2D layers by a hand-tuned coefficient — the layers then slide against each
 * other with no consistent vanishing point and the eye reads them as stickers.
 * Here, `depth` is a genuine distance and every layer is scaled to subtend the
 * same angle, so the relative motion falls out of the projection for free.
 *
 * The only hand-authored terms are `sway` (weather, not parallax) and a small
 * pointer offset that is deliberately capped below the threshold where it stops
 * reading as air and starts reading as a gimmick.
 */

export type ParallaxPlateProps = {
  url: string
  /** Distance in front of the origin. Larger is further away. */
  depth: number
  /** Vertical placement in world units at that depth. */
  y?: number
  /** Scales the plate relative to the frustum width at `depth`. 1 = exact fit. */
  fit?: number
  opacity?: number
  /** Wind. Amplitude in world units; 0 for anything meant to feel like rock. */
  sway?: number
  tint?: string
  /** Alpha-keyed silhouettes need this; opaque matte paintings do not. */
  transparent?: boolean
  pointerParallax?: number
}

export function ParallaxPlate({
  url,
  depth,
  y = 0,
  fit = 1.08,
  opacity = 1,
  sway = 0,
  tint,
  transparent = true,
  pointerParallax = 1,
}: ParallaxPlateProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const reduced = useExperience((s) => s.reducedMotion)
  const offset = useRef({ x: 0, y: 0 })
  const pointer = useRef({ x: 0, y: 0 })

  const texture = useTexture(url)
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    texture.anisotropy = 4
  }, [texture])

  const color = useMemo(() => (tint ? new THREE.Color(tint) : new THREE.Color('#ffffff')), [tint])

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return

    // Frustum height must be measured at the plate's distance FROM THE CAMERA,
    // not at its world Z. The camera sits several units back and moves during
    // the shot, so using `depth` directly under-scales every plate and lets the
    // page background show at the edges of frame.
    const distance = Math.max(0.1, camera.position.z + depth)
    const fovRad = camera.fov * THREE.MathUtils.DEG2RAD
    const h = 2 * Math.tan(fovRad / 2) * distance
    const w = h * (size.width / Math.max(size.height, 1))
    const img = texture.image as { width?: number; height?: number } | undefined
    const aspect = img?.width && img?.height ? img.width / img.height : 16 / 9
    // Cover: never let a plate's edge enter frame.
    const scaleY = Math.max(h, w / aspect) * fit
    m.scale.set(scaleY * aspect, scaleY, 1)

    pointer.current.x = state.pointer.x
    pointer.current.y = state.pointer.y

    const targetX = reduced ? 0 : pointer.current.x * 0.055 * depth * pointerParallax
    const targetY = reduced ? 0 : pointer.current.y * 0.03 * depth * pointerParallax
    offset.current.x = damp(offset.current.x, targetX, 3.4, dt)
    offset.current.y = damp(offset.current.y, targetY, 3.4, dt)

    const t = state.clock.elapsedTime
    const wind = reduced || sway === 0 ? 0 : Math.sin(t * 0.23 + depth) * sway

    m.position.set(offset.current.x + wind, y + offset.current.y - scroll.smooth * 0.4 * depth * 0.06, -depth)
  })

  return (
    <mesh ref={mesh} renderOrder={-Math.round(depth * 10)}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={transparent}
        opacity={opacity}
        color={color}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}
