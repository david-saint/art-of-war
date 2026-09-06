'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { lockScroll, scroll } from '@/lib/scroll'
import {
  arm,
  commit,
  decision,
  getDecisionSnapshot,
  getServerDecisionSnapshot,
  hover,
  reset,
  setPhase,
  subscribeDecision,
  tickDecision,
  type DecisionOption,
} from '@/lib/decision'
import { useExperience } from '@/store/experience'
import type { DecisionNode as DecisionData } from '@/data/chapters'

/**
 * A Tactic Decision Node.
 *
 * The interaction is a nine-state machine, and its shape is the argument:
 * dormant → armed → presented → committed → simulating → consequence → verdict
 * → resolved. Two rules matter more than the rest.
 *
 * FIRST: the historical reading is illegal until the ink is dry. The reader
 * must watch the consequence of their own choice with no commentary, no score,
 * and no way to skip, and only then are they told what Sun Tzu says and what
 * happened when a real commander chose that way. Reversing that order turns the
 * node into a quiz, which is the failure mode of every "interactive history"
 * site ever built.
 *
 * SECOND: the mark is permanent. There is no "try the other one" button. On a
 * return visit the node shows what you chose the first time and moves on. A
 * decision you can retake is not a decision, and Ink Law §2 — density only
 * increases — is not decoration, it is the mechanic.
 *
 * Scroll is locked for the duration via the body-offset lock, which preserves
 * visual position (no jump) and is reference counted. The lock is released in
 * a cleanup that runs even if the component unmounts mid-node, so a reader who
 * navigates away with the browser's back button never lands on a dead page.
 */

export type DecisionNodeProps = {
  chapter: number
  data: DecisionData
  /** Point in the chapter's scroll where the node arms, 0..1. */
  at?: number
}

export function DecisionNode({ chapter, data, at = 0.62 }: DecisionNodeProps) {
  const snap = useSyncExternalStore(subscribeDecision, getDecisionSnapshot, getServerDecisionSnapshot)
  const stored = useExperience((s) => s.decisions[chapter])
  const commitDecision = useExperience((s) => s.commitDecision)
  const reduced = useExperience((s) => s.reducedMotion)
  const releaseRef = useRef<null | (() => void)>(null)
  const rafRef = useRef(0)

  const active = snap.chapter === chapter
  const alreadyResolved = Boolean(stored)

  // Arming watcher. Runs on rAF rather than on the scroll event so it reads the
  // same snapshot the renderer does, and it costs one comparison per frame.
  useEffect(() => {
    if (alreadyResolved) return
    let raf = 0
    const check = () => {
      raf = requestAnimationFrame(check)
      if (decision.phase !== 'dormant') return
      if (scroll.chapterIndex !== chapter) return
      if (scroll.chapterProgress < at) return
      arm(chapter)
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [chapter, at, alreadyResolved])

  // Phase clock and scroll lock.
  useEffect(() => {
    if (!active) return

    if (snap.phase === 'armed') {
      releaseRef.current = lockScroll()
      setPhase('presented')
    }

    let last = performance.now()
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      tickDecision(dt)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, snap.phase])

  // Always release the lock, including on unmount mid-node.
  useEffect(
    () => () => {
      releaseRef.current?.()
      releaseRef.current = null
    },
    [],
  )

  // Escape does not cancel a committed decision — it only dismisses the verdict,
  // which is the one part of the node that is purely informational.
  useEffect(() => {
    if (!active || snap.phase !== 'verdict') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') resolve()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, snap.phase])

  const choose = (option: DecisionOption) => {
    commit(option)
    commitDecision(chapter, option)
  }

  const resolve = () => {
    setPhase('resolved')
    releaseRef.current?.()
    releaseRef.current = null
    reset()
  }

  if (!active || snap.phase === 'dormant' || snap.phase === 'resolved') return null

  const chosen = snap.chosen
  const showOptions = snap.phase === 'presented'
  const showSituation = snap.phase === 'presented' || snap.phase === 'committed'
  const showVerdict = snap.phase === 'verdict'
  // The consequence plays with the frame completely clear. No HUD, no captions,
  // no progress bar — the reader watches what they did.
  const clearFrame = snap.phase === 'simulating' || snap.phase === 'consequence'

  return (
    <div
      className="fixed inset-x-0 flex flex-col items-center justify-end px-[var(--hud-inset)]"
      style={{
        zIndex: 'var(--z-node)',
        top: 'var(--letterbox-bar)',
        bottom: 'var(--letterbox-bar)',
        paddingBottom: 'clamp(2rem, 8vh, 6rem)',
        opacity: clearFrame ? 0 : 1,
        transition: `opacity ${reduced ? 0 : 700}ms var(--ease-soak)`,
        pointerEvents: clearFrame ? 'none' : 'auto',
      }}
      role="group"
      aria-label={`Chapter ${chapter} tactical decision`}
    >
      {showSituation ? (
        <p
          className="mb-10 max-w-2xl text-center font-serif text-lead leading-relaxed t-fg"
          aria-live="polite"
        >
          {data.situation}
        </p>
      ) : null}

      {showOptions ? (
        <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
          {(['a', 'b'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onPointerEnter={() => hover(key)}
              onPointerLeave={() => hover(null)}
              onFocus={() => hover(key)}
              onBlur={() => hover(null)}
              onClick={() => choose(key)}
              className="group border px-6 py-6 text-left transition-colors duration-200"
              style={{
                borderColor: snap.hovered === key ? 'var(--color-gold-500)' : 'var(--fg-faint)',
                background: snap.hovered === key ? 'rgb(201 162 39 / 0.07)' : 'transparent',
              }}
            >
              <span className="font-mono text-micro uppercase tracking-[0.32em] t-gold">
                {key === 'a' ? '甲' : '乙'}
              </span>
              <span className="mt-3 block font-serif text-lead leading-snug t-fg">
                {data.options[key].label}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {snap.phase === 'committed' ? (
        <p className="font-mono text-micro uppercase tracking-[0.42em] t-faint">
          The order is given
        </p>
      ) : null}

      {showVerdict && chosen ? (
        <div className="w-full max-w-3xl" aria-live="polite">
          <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">
            You chose {chosen === 'a' ? '甲' : '乙'} · {data.options[chosen].label}
          </p>
          <p className="mt-6 font-serif text-lead leading-relaxed t-fg">
            {data.verdict[chosen]}
          </p>
          <p className="mt-6 border-l pl-5 font-serif text-body italic leading-relaxed t-muted"
             style={{ borderColor: 'var(--color-vermilion-700)' }}>
            {data.verdict.sunzi}
          </p>
          <button
            type="button"
            onClick={resolve}
            className="mt-8 border px-7 py-3 font-mono text-micro uppercase tracking-[0.32em] t-muted transition-colors hover:[color:var(--fg)]"
            style={{ borderColor: 'var(--fg-faint)' }}
            autoFocus
          >
            Continue
          </button>
        </div>
      ) : null}
    </div>
  )
}
