'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { EmberField } from '../EmberField'
import { InkPlane } from '../InkPlane'
import { ParallaxPlate } from '../ParallaxPlate'
import { scroll } from '@/lib/scroll'
import { decision } from '@/lib/decision'

/**
 * 火攻 — The Attack by Fire.
 *
 * The one chapter with real colour, and the only one that ends cold.
 *
 * Structure of the burn: nothing for the first fifth (the wind is being read,
 * the moon's mansion checked, the means made ready), then ignition, then a full
 * burn through the middle of the chapter, and then — critically — the fire goes
 * OUT before the chapter does. The last beats play over a black river and ash,
 * with no ember left on screen, because the closing lines of this chapter are
 * not about fire at all. They are the sober warning that a destroyed state
 * cannot be restored and the dead cannot be brought back to life, and putting
 * them over a beautiful burn would be a lie about what the text says.
 */
export function Chapter12Scene() {
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    scene.background = new THREE.Color('#0B0F0E')
  }, [scene])

  // Ignition at 0.2, full burn 0.35 → 0.72, then dying to nothing by 0.92.
  const intensity = () => {
    const p = scroll.chapterSmooth
    // A decision node freezes the fire at whatever it was: the reader is looking
    // at the consequence of their own order, not at a scripted animation.
    if (decision.phase === 'simulating' || decision.phase === 'consequence') {
      return decision.chosen === 'a' ? 1 : 0.22
    }
    const up = THREE.MathUtils.smoothstep(p, 0.2, 0.38)
    const down = 1 - THREE.MathUtils.smoothstep(p, 0.74, 0.92)
    return Math.min(up, down)
  }

  const glyphProgress = () => THREE.MathUtils.clamp(scroll.chapterSmooth / 0.3, 0, 1)

  return (
    <group>
      {/* Night. The plate is painted for daylight, so it is tinted down hard —
          the fire is the only light source in this chapter and the plate must
          not compete with it. */}
      <ParallaxPlate
        url="/assets/generated/img/chapter/12.webp"
        depth={20}
        opacity={1}
        transparent={false}
        tint="#4A4038"
        pointerParallax={0.35}
      />
      <ParallaxPlate
        url="/assets/generated/img/plate/burnt-01.webp"
        depth={11}
        opacity={0.45}
        tint="#6B5C4E"
        pointerParallax={0.6}
      />

      {/* Two fields at different depths so the plume has front-to-back
          separation. A single field always reads as a flat sheet of sparks. */}
      {/* The burn is a PLUME rising out of the bottom of frame, not a field
          filling it. Both sources sit below the lower letterbox line so the
          reader sees smoke and sparks arriving from a fire they never quite
          see — which is also what the chapter is about. */}
      <EmberField
        count={5200}
        smokeCount={1600}
        source={[7, 2]}
        origin={[-2.4, -5.4, -9]}
        rise={2.4}
        wind={[0.75, 0, -0.1]}
        turbulence={1.2}
        spread={1.5}
        intensity={intensity}
      />
      <EmberField
        count={1400}
        smokeCount={260}
        source={[2.4, 1]}
        origin={[4.2, -4.6, -4.5]}
        rise={3.0}
        wind={[0.5, 0, 0.05]}
        turbulence={0.8}
        spread={0.9}
        intensity={intensity}
      />

      <ParallaxPlate url="/assets/generated/img/sil/army-01.webp" depth={4.2} y={-2.1} opacity={0.95} />

      <InkPlane
        map="/assets/generated/img/glyph/ch12.webp"
        progress={glyphProgress}
        monotonic
        fullscreen
        distance={2.6}
        seed={12 * 7.3}
        ink="#E8E2D4"
        rimColor="#F4F0E6"
        mapScale={[0.3, 0.3]}
        mapOffset={[-0.56, 0.14]}
        uniforms={{ uNoiseScale: 2.4, uOpacity: 0.9 }}
      />
    </group>
  )
}
