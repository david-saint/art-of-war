'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { groundFor, GROUND_HEX } from '@/lib/ground'
import { InkPlane } from '../InkPlane'
import { ParallaxPlate } from '../ParallaxPlate'
import { MistMotes } from '../MistMotes'
import { scroll } from '@/lib/scroll'
import { glyphAsset, keyArtAsset } from '@/data/chapters'

/**
 * The default chapter set.
 *
 * Chapters with bespoke physics (6's fluid ink, 10's topography, 12's fire)
 * replace this entirely. Everything else is staged the same way — key art held
 * at depth, air in front of it, and the chapter's glyph soaking in over the
 * first third of the scroll — so that a bespoke chapter reads as a deliberate
 * escalation rather than as an inconsistency.
 */
export function ChapterScene({ chapter, seed = 0 }: { chapter: number; seed?: number }) {
  const scene = useThree((s) => s.scene)
  const ground = groundFor(chapter)

  useEffect(() => {
    scene.background = new THREE.Color(GROUND_HEX[ground])
  }, [scene, ground])

  // The glyph is laid in the first 34% of the chapter and then holds. It never
  // un-inks: Ink Law §2 is enforced by `monotonic` on the plane itself.
  const glyphProgress = () => THREE.MathUtils.clamp(scroll.chapterSmooth / 0.34, 0, 1)

  return (
    <group>
      {/* Night chapters get their plate graded down hard. The key art is painted
          for daylight; dropping paper-white type onto it unmodified is how a
          beautiful frame becomes an unreadable one. */}
      <ParallaxPlate
        url={keyArtAsset(chapter)}
        depth={18}
        opacity={1}
        transparent={false}
        tint={ground === 'ink' ? '#3E362E' : '#DED7C8'}
        pointerParallax={0.4}
      />
      <MistMotes count={280} depth={10} spread={20} />
      <ParallaxPlate
        url="/assets/generated/img/sil/ridge-01.webp"
        depth={5.5}
        y={-1.8}
        opacity={ground === 'ink' ? 0.98 : 0.9}
        sway={0.015}
      />
      <InkPlane
        map={glyphAsset(chapter)}
        progress={glyphProgress}
        monotonic
        fullscreen
        distance={2.6}
        seed={seed + chapter * 7.3}
        ink={ground === 'ink' ? '#D5DAD6' : '#1B2321'}
        rimColor={ground === 'ink' ? '#F4F0E6' : '#0B0F0E'}
        mapScale={[0.34, 0.34]}
        mapOffset={[0.5, 0.12]}
        uniforms={{ uNoiseScale: 2.4, uOpacity: 0.92 }}
      />
    </group>
  )
}
