'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { Letterbox } from './Letterbox'
import { WarCouncilHUD } from './WarCouncilHUD'
import { EnterGate } from './EnterGate'
import { GroundSync } from './GroundSync'
import { AudioDirector } from './AudioDirector'
import { CodexView } from './CodexView'
import { useScrollEngine } from '@/lib/useScroll'
import { useExperience } from '@/store/experience'
import { hasWebGL, probeQuality } from '@/three/quality'
import { CHAPTER_IDENTITY } from '@/data/chapters'
import { chapterTrack, heroTrack, mapDescentTrack } from '@/three/tracks'

/**
 * The 3D layer is loaded client-side only and after first paint.
 *
 * Two reasons, both non-negotiable. First, three.js touches `window` and
 * `document` at module scope in several of its loaders, so importing it into a
 * server component crashes the render. Second, and more important: the
 * letterboxed poster frame — real type, real composition — is the thing the
 * reader should be looking at while a 3D scene warms up. Shipping the canvas in
 * the initial bundle would delay that frame to make an empty canvas appear
 * sooner, which is the wrong trade.
 */
const Stage = dynamic(() => import('@/three/Stage').then((m) => m.Stage), { ssr: false })
const SceneController = dynamic(
  () => import('@/three/SceneController').then((m) => m.SceneController),
  { ssr: false },
)
const HeroScene = dynamic(() => import('@/three/scenes/HeroScene').then((m) => m.HeroScene), { ssr: false })
const ChapterScene = dynamic(() => import('@/three/scenes/ChapterScene').then((m) => m.ChapterScene), { ssr: false })
const Chapter06Scene = dynamic(() => import('@/three/scenes/Chapter06Scene').then((m) => m.Chapter06Scene), { ssr: false })
const Chapter12Scene = dynamic(() => import('@/three/scenes/Chapter12Scene').then((m) => m.Chapter12Scene), { ssr: false })

/** Chapters whose physics differ enough to warrant their own set. */
const BESPOKE: Record<number, React.ComponentType> = { 6: Chapter06Scene, 12: Chapter12Scene }

export function ExperienceRoot() {
  useScrollEngine()
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const setQuality = useExperience((s) => s.setQuality)
  const setReducedMotion = useExperience((s) => s.setReducedMotion)
  const entered = useExperience((s) => s.entered)

  useEffect(() => {
    setWebgl(hasWebGL())
    setQuality(probeQuality())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setQuality, setReducedMotion])

  const scenes = useMemo(
    () => [
      { chapter: -1, title: 'Hero', track: heroTrack, Component: HeroScene },
      ...CHAPTER_IDENTITY.map((c) => ({
        chapter: c.n,
        title: c.titleEn,
        track: c.n === 6 ? mapDescentTrack : chapterTrack(c.n),
        Component: BESPOKE[c.n] ?? (() => <ChapterScene chapter={c.n} seed={c.n * 3.7} />),
      })),
    ],
    [],
  )

  return (
    <>
      {webgl && entered ? (
        <Stage>
          <SceneController scenes={scenes} />
        </Stage>
      ) : null}
      <GroundSync />
      <AudioDirector />
      <Letterbox />
      <WarCouncilHUD />
      <CodexView />
      <EnterGate noWebGL={webgl === false} />
    </>
  )
}
