'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { InkFlow } from '../InkFlow'
import { InkPlane } from '../InkPlane'
import { MistMotes } from '../MistMotes'
import { scroll } from '@/lib/scroll'

/**
 * 虛實 — Emptiness and Fullness.
 *
 * The whole chapter is one live fluid. Ink is poured at the top of a terrain
 * field and left to find its own way down; the enemy's dispositions are a
 * resistance map the reader cannot see directly and must infer from where the
 * ink stops. The chapter's argument — be formless, arrive where he is not,
 * divide his ten into ones — is not narrated over an animation. It is the rule
 * the simulation is already obeying.
 *
 * The reader's cursor is a second, weaker source, so they can pour a little ink
 * themselves and watch it get turned aside. That is the entire lesson, and it
 * takes about four seconds to learn by hand.
 *
 * The camera starts almost overhead (the commander's map) and descends toward
 * the surface as the chapter proceeds, so the reader ends inside the terrain
 * they were reading from above.
 */
export function Chapter06Scene() {
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    scene.background = new THREE.Color('#E8E2D4')
  }, [scene])

  // Fullness is withheld until the reader has watched the ink fail. Revealing
  // the enemy's dispositions before that would answer the question the scene
  // exists to ask.
  // The pour is a burst near the top of the chapter and then stops. From there
  // on the reader is watching ink that is on its own.
  const pour = () => {
    const p = scroll.chapterSmooth
    return THREE.MathUtils.clamp(p / 0.06, 0, 1) * (1 - THREE.MathUtils.smoothstep(p, 0.24, 0.34))
  }
  const reveal = () => THREE.MathUtils.clamp((scroll.chapterSmooth - 0.55) / 0.25, 0, 1)
  const glyphProgress = () => THREE.MathUtils.clamp(scroll.chapterSmooth / 0.28, 0, 1)

  return (
    <group>
      <InkFlow
        size={[24, 24]}
        position={[0, -1.4, -5]}
        rotation={[-Math.PI / 2.9, 0, 0]}
        source={[0.5, 0.42]}
        sourceRate={1.6}
        sourceRadius={0.05}
        pointerSource
        sourceGate={pour}
        reveal={reveal}
      />
      <MistMotes count={220} depth={7} spread={16} color="#7C8985" size={1.2} opacity={0.16} />
      <InkPlane
        map="/assets/generated/img/glyph/ch06.webp"
        progress={glyphProgress}
        monotonic
        fullscreen
        distance={2.6}
        seed={6 * 7.3}
        mapScale={[0.3, 0.3]}
        mapOffset={[0.52, 0.14]}
        uniforms={{ uNoiseScale: 2.2, uOpacity: 0.9, uTurbulence: 0.85 }}
      />
    </group>
  )
}
