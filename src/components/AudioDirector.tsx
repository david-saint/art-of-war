'use client'

import { useEffect, useRef } from 'react'
import { useChapterIndex } from '@/lib/useScroll'
import { useExperience } from '@/store/experience'
import { getAudioEngine } from '@/lib/audio'
import { CHAPTER_IDENTITY } from '@/data/chapters'

/**
 * Maps where the reader is to what they hear.
 *
 * Beds are per ACT, not per chapter: a bed that changed every chapter would
 * make the site feel like thirteen separate pieces, and the four-act structure
 * is the thing that should be audible. Textures are per chapter and carry the
 * weather. Chapter 12 breaks the act rule because fire is its own world.
 */
const ACT_BED: Record<number, string> = {
  1: 'bed/act1-calculation',
  2: 'bed/act2-form',
  3: 'bed/act3-motion',
  4: 'bed/act4-ground',
}

const CHAPTER_BED: Record<number, string> = {
  12: 'bed/fire',
  13: 'bed/spies',
}

const CHAPTER_TEXTURE: Record<number, string> = {
  2: 'tex/wind-plain',
  7: 'tex/wind-plain',
  9: 'tex/rain',
  10: 'tex/wind-plain',
  11: 'tex/camp-night',
  13: 'tex/camp-night',
}

export function AudioDirector() {
  const chapterIndex = useChapterIndex()
  const audioEnabled = useExperience((s) => s.audioEnabled)
  const masterVolume = useExperience((s) => s.masterVolume)
  const entered = useExperience((s) => s.entered)
  const lastChapter = useRef<number | null>(null)

  useEffect(() => {
    const engine = getAudioEngine()
    if (!entered || !audioEnabled) {
      engine.suspend()
      return
    }
    let cancelled = false
    void (async () => {
      await engine.unlock()
      if (cancelled) return
      engine.setVolume(masterVolume)
    })()
    return () => {
      cancelled = true
    }
  }, [entered, audioEnabled, masterVolume])

  useEffect(() => {
    if (!entered || !audioEnabled) return
    const engine = getAudioEngine()
    if (!engine.unlocked) return

    const identity = CHAPTER_IDENTITY.find((c) => c.n === chapterIndex)
    const bed =
      chapterIndex < 1
        ? 'bed/overture'
        : (CHAPTER_BED[chapterIndex] ?? (identity ? ACT_BED[identity.act] : 'bed/overture'))

    void engine.play('bed', bed, 0.55)
    void engine.play('texture', CHAPTER_TEXTURE[chapterIndex] ?? null, 0.32)

    // The impact fires on a chapter BOUNDARY, not on first mount — otherwise
    // the reader is hit in the chest for arriving at the page.
    if (lastChapter.current !== null && lastChapter.current !== chapterIndex && chapterIndex >= 1) {
      engine.hit({ gain: 0.75 })
    }
    lastChapter.current = chapterIndex
  }, [chapterIndex, entered, audioEnabled])

  // Silence when the tab is not in front. A site that keeps playing drums in a
  // background tab is a site people close.
  useEffect(() => {
    const onVisibility = () => {
      const engine = getAudioEngine()
      if (document.hidden) engine.suspend()
      else if (audioEnabled && entered) engine.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [audioEnabled, entered])

  return null
}
