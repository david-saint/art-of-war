'use client'

import { useEffect, useState } from 'react'
import { useExperience } from '@/store/experience'
import { getAudioEngine } from '@/lib/audio'

/**
 * The threshold.
 *
 * It exists for one technical reason and one editorial one. Technically, no
 * browser will start audio without a user gesture, and a site whose sound
 * design is load-bearing needs that gesture before the first frame rather than
 * as a banner three chapters in. Editorially, this is a text about the moment
 * before commitment, and it would be incoherent to drop the reader into it
 * without one.
 *
 * The two buttons are not "sound on / sound off" — they are two readings of the
 * same treatise, and neither is presented as the lesser.
 */
export function EnterGate({ noWebGL = false }: { noWebGL?: boolean }) {
  const entered = useExperience((s) => s.entered)
  const enter = useExperience((s) => s.enter)
  const beginEnter = useExperience((s) => s.beginEnter)
  const setAudioEnabled = useExperience((s) => s.setAudioEnabled)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!entered) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [entered])

  if (entered) return null

  const go = (withAudio: boolean) => {
    setAudioEnabled(withAudio)
    beginEnter()
    setClosing(true)
    window.setTimeout(() => enter(), 520)
  }

  // A hand moving toward "Enter with sound" is a few hundred milliseconds of
  // warning. That is enough to have the overture's bytes on hand when the
  // click arrives, so the first bar plays as the gate lifts instead of after
  // a two-megabyte download. Readers who choose silence never fetch it.
  const warmAudio = () => getAudioEngine().prefetch(['bed/overture'])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-ink-950 transition-opacity duration-500"
      style={{ zIndex: 'var(--z-gate)', opacity: closing ? 0 : 1 }}
      role="dialog"
      aria-modal="true"
      aria-label="Enter the experience"
    >
      <div className="mx-auto max-w-2xl px-8 text-center">
        <p className="font-mono text-micro uppercase tracking-[0.42em] text-ink-400">
          孫子兵法 · Sūnzǐ Bīngfǎ
        </p>

        <h1 className="mt-8 font-serif text-title leading-[0.95] text-paper-050">
          The Art of War
        </h1>

        <p className="mx-auto mt-8 max-w-lg font-serif text-lead leading-relaxed text-ink-200">
          Thirteen chapters. No battles. By the time swords touch, the deciding part is
          three chapters behind you — this is an instrument for catching it there.
        </p>

        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => go(true)}
            onPointerEnter={warmAudio}
            onFocus={warmAudio}
            className="group relative w-full border border-gold-700/60 px-9 py-4 font-mono text-caption uppercase tracking-[0.3em] text-gold-300 transition-colors duration-200 hover:bg-gold-700/12 sm:w-auto"
          >
            Enter with sound
          </button>
          <button
            type="button"
            onClick={() => go(false)}
            className="w-full px-9 py-4 font-mono text-caption uppercase tracking-[0.3em] text-ink-400 transition-colors duration-200 hover:text-paper-100 sm:w-auto"
          >
            Enter in silence
          </button>
        </div>

        <p className="mt-10 font-mono text-micro leading-relaxed text-ink-500">
          Guzheng, war drums, wind and rain. Roughly 40 minutes at a reading pace.
          {noWebGL ? ' Your browser has no WebGL — you will get the illustrated edition.' : ''}
        </p>
      </div>
    </div>
  )
}
