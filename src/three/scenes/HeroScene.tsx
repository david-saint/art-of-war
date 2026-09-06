'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { InkPlane } from '../InkPlane'
import { ParallaxPlate } from '../ParallaxPlate'
import { MistMotes } from '../MistMotes'
import { scroll } from '@/lib/scroll'
import { useExperience } from '@/store/experience'

/**
 * The opening frame.
 *
 * The ground is PAPER, not black. That is the whole conceit: the site is a
 * sheet of xuan paper and ink is the cost of being wrong, so the reader's first
 * sight of it has to be an almost-empty sheet. Nothing here is lit — every
 * plate is unlit basic material and all of the "lighting" is tonal, exactly as
 * it is in a real 水墨畫.
 *
 * The title is composed where a hanging scroll would carry it — upper right,
 * reading down, with the seal below it — rather than centred like a poster.
 *
 * The dissolve has two drivers summed rather than switched: a one-shot entrance
 * that starts on enter, and scroll. A reader who scrolls immediately should
 * accelerate the stroke, not interrupt it.
 */
export function HeroScene() {
  const entered = useExperience((s) => s.entered)
  const reduced = useExperience((s) => s.reducedMotion)
  const scene = useThree((s) => s.scene)
  const entrance = useRef(0)

  useEffect(() => {
    const previous = scene.background
    scene.background = new THREE.Color('#E8E2D4')
    return () => {
      scene.background = previous
    }
  }, [scene])

  useFrame((_, dt) => {
    if (!entered) return
    entrance.current = Math.min(1, entrance.current + dt / (reduced ? 0.001 : 2.6))
  })

  // The title inks first and fastest; scroll then finishes the last of it.
  const titleProgress = () => {
    const scrolled = THREE.MathUtils.clamp(scroll.progress * 7, 0, 1)
    return Math.min(1, entrance.current * 0.9 + scrolled * 0.35)
  }
  // The seal is pressed only once the title has dried. A seal on wet ink smears.
  const sealProgress = () => THREE.MathUtils.clamp((entrance.current - 0.72) / 0.2, 0, 1)

  return (
    <group>
      {/* Atmospheric perspective is done with opacity, not fog: fog on an unlit
          plate flattens the ink to one value and kills the tonal range that is
          doing all of the work. */}
      <ParallaxPlate url="/assets/generated/img/plate/range-far-01.webp" depth={22} opacity={1} transparent={false} pointerParallax={0.3} />
      <ParallaxPlate url="/assets/generated/img/plate/range-mid-01.webp" depth={13} opacity={0.5} pointerParallax={0.65} />
      <MistMotes count={340} depth={9} spread={18} color="#7C8985" size={1.4} opacity={0.22} />
      <ParallaxPlate url="/assets/generated/img/sil/ridge-01.webp" depth={6} y={-1.2} opacity={0.94} sway={0.02} />
      <ParallaxPlate url="/assets/generated/img/sil/bamboo-01.webp" depth={3.4} opacity={0.85} sway={0.05} pointerParallax={1.4} />

      <InkPlane
        map="/assets/generated/img/glyph/bingfa.webp"
        progress={titleProgress}
        monotonic
        pointerBrush
        fullscreen
        distance={2.4}
        seed={3.1}
        mapScale={[0.4, 0.4]}
        mapOffset={[-0.44, 0.06]}
        uniforms={{
          uNoiseScale: 2.8,
          uEdgeSoftness: 0.05,
          uRimWidth: 0.058,
          uRimStrength: 1,
          uFlyingWhite: 0.4,
          uTurbulence: 0.6,
          uCoverageBias: 0.3,
        }}
      />

      <InkPlane
        map="/assets/generated/img/seal/square-01.webp"
        progress={sealProgress}
        monotonic
        useMapColor
        fullscreen
        distance={2.35}
        seed={12.7}
        mapScale={[0.105, 0.105]}
        mapOffset={[-0.44, -0.26]}
        renderOrder={2}
        uniforms={{
          // Cinnabar is a different medium: thicker, slower to bloom, and it
          // never feathers the way carbon does. So: a hard front, almost no
          // turbulence, no flying white.
          uNoiseScale: 5.5,
          uEdgeSoftness: 0.02,
          uRimWidth: 0.02,
          uRimStrength: 0.3,
          uRimColor: '#8A1F17',
          uFlyingWhite: 0.05,
          uTurbulence: 0.12,
          uGranulation: 0.12,
        }}
      />
    </group>
  )
}
