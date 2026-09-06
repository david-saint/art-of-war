'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { preload } from 'react-dom'
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
import { HERO_URLS, sceneAssets } from '@/three/assets'

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
 *
 * "After first paint" is not "after Enter", though. The gate is opaque, and
 * the seconds a reader spends on it are exactly the seconds the render layer
 * needs: the canvas mounts behind the gate as soon as the page is interactive,
 * so its code, the hero's plates and every shader are resident before the
 * click, and the hero's plates are requested before even the render layer's
 * code has arrived. Enter lifts a sheet off a scene that is already running.
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

  // Emitted as <link rel="preload"> in the server HTML, at low priority so the
  // gate's own type and fonts are never behind a plate.
  for (const url of HERO_URLS) preload(url, { as: 'fetch', fetchPriority: 'low' })
  const setQuality = useExperience((s) => s.setQuality)
  const setReducedMotion = useExperience((s) => s.setReducedMotion)

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
      { chapter: -1, title: 'Hero', track: heroTrack, Component: HeroScene, assets: sceneAssets(-1) },
      ...CHAPTER_IDENTITY.map((c) => ({
        chapter: c.n,
        title: c.titleEn,
        track: c.n === 6 ? mapDescentTrack : chapterTrack(c.n),
        Component: BESPOKE[c.n] ?? (() => <ChapterScene chapter={c.n} seed={c.n * 3.7} />),
        assets: sceneAssets(c.n),
      })),
    ],
    [],
  )

  return (
    <>
      {webgl ? (
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
