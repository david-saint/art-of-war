'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scroll, damp } from '@/lib/scroll'
import { useExperience } from '@/store/experience'
import { createSample, sampleTrack, type CameraTrack, type SampledCamera } from './cameraTrack'

/**
 * The scroll-linked camera.
 *
 * Note what is NOT here: no props carrying scroll position, no useState, no
 * effect that runs on scroll. The rig reads the mutable `scroll` snapshot
 * directly inside useFrame. React renders this component once per chapter
 * change and then stays out of the way for the next several thousand frames.
 *
 * Everything the camera does on top of the authored track is a small
 * physical lie in service of the shot:
 *   - a critically damped follower, so a violent flick of the wheel becomes a
 *     move rather than a teleport;
 *   - a low-amplitude drift on two incommensurable frequencies, so a held shot
 *     breathes instead of freezing into a screenshot;
 *   - an optional monotonic ratchet, so scrolling back up does not rewind the
 *     camera and turn the film into a scrub bar.
 */

export type CameraRigProps = {
  track: CameraTrack
  /** Overrides the scroll signal — used by the hero and by decision nodes. */
  progressOverride?: () => number
  /** Extra damping when a decision node has taken the frame. */
  locked?: boolean
}

const DRIFT_A = 0.11
const DRIFT_B = 0.077

export function CameraRig({ track, progressOverride, locked = false }: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const reduced = useExperience((s) => s.reducedMotion)

  const sample = useMemo<SampledCamera>(() => createSample(), [])
  const current = useRef({
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 40,
    roll: 0,
    seeded: false,
    furthest: 0,
  })

  useFrame((_, dt) => {
    const raw = progressOverride ? progressOverride() : scroll.chapterSmooth
    let t = THREE.MathUtils.clamp(raw, 0, 1)

    if (track.monotonic) {
      current.current.furthest = Math.max(current.current.furthest, t)
      t = current.current.furthest
    }

    sampleTrack(track, t, sample)

    const c = current.current
    // First frame of a chapter, and every hard cut, snap instead of easing.
    const snap = !c.seeded || sample.cut
    const lambda = locked ? 3.2 : 6.5

    if (snap) {
      c.position.copy(sample.position)
      c.target.copy(sample.target)
      c.fov = sample.fov
      c.roll = sample.roll
      c.seeded = true
    } else {
      c.position.set(
        damp(c.position.x, sample.position.x, lambda, dt),
        damp(c.position.y, sample.position.y, lambda, dt),
        damp(c.position.z, sample.position.z, lambda, dt),
      )
      c.target.set(
        damp(c.target.x, sample.target.x, lambda, dt),
        damp(c.target.y, sample.target.y, lambda, dt),
        damp(c.target.z, sample.target.z, lambda, dt),
      )
      c.fov = damp(c.fov, sample.fov, lambda, dt)
      c.roll = damp(c.roll, sample.roll, lambda, dt)
    }

    camera.position.copy(c.position)

    if (!reduced) {
      // Two frequencies that never line up, so the drift never develops a
      // detectable period. Amplitude scales with distance so a wide shot
      // breathes more than a detail shot.
      const time = performance.now() / 1000
      const dist = camera.position.distanceTo(c.target)
      const amp = Math.min(0.02 * dist, 0.09)
      camera.position.x += Math.sin(time * DRIFT_A) * amp
      camera.position.y += Math.cos(time * DRIFT_B) * amp * 0.6
    }

    camera.lookAt(c.target)
    if (c.roll !== 0) camera.rotateZ(c.roll * THREE.MathUtils.DEG2RAD)

    if (Math.abs(camera.fov - c.fov) > 1e-3) {
      camera.fov = c.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
