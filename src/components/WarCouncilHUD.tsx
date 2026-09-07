'use client'

import { useEffect } from 'react'
import { useChapterIndex } from '@/lib/useScroll'
import { useExperience } from '@/store/experience'
import { ACTS, CHAPTER_IDENTITY } from '@/data/chapters'

/**
 * The War Council HUD.
 *
 * A 竹簡 — a bound bamboo book — unwinding down the left edge. Thirteen slips,
 * one per chapter, in reading order. State is carried by ink density, not by
 * colour or by a fill bar: a chapter you have not reached is bare bamboo, a
 * chapter you have read is written on, and the chapter you are in is the one
 * currently under the brush. Gold marks the current slip because gold is
 * sovereignty — this is where the reader's attention is commissioned.
 *
 * This component subscribes to the QUANTISED scroll signal, so it re-renders on
 * chapter change and at no other time. It must never subscribe to continuous
 * progress: it sits in the same tree as the canvas.
 */
export function WarCouncilHUD() {
  const chapterIndex = useChapterIndex()
  const entered = useExperience((s) => s.entered)
  const mode = useExperience((s) => s.mode)
  const toggleMode = useExperience((s) => s.toggleMode)
  const audioEnabled = useExperience((s) => s.audioEnabled)
  const setAudioEnabled = useExperience((s) => s.setAudioEnabled)
  const visited = useExperience((s) => s.visited)
  const markVisited = useExperience((s) => s.markVisited)
  const autoplay = useExperience((s) => s.autoplay)
  const toggleAutoplay = useExperience((s) => s.toggleAutoplay)

  useEffect(() => {
    if (chapterIndex > 0) markVisited(chapterIndex)
  }, [chapterIndex, markVisited])

  if (!entered) return null

  const current = CHAPTER_IDENTITY.find((c) => c.n === chapterIndex)
  const act = current ? ACTS[current.act] : null

  return (
    <>
      {/* The bound slips. Hidden below lg, where the bottom rail takes over. */}
      <nav
        aria-label="Chapter progress"
        className="pointer-events-none fixed left-0 top-1/2 hidden -translate-y-1/2 pl-[var(--hud-inset)] lg:block"
        style={{ zIndex: 'var(--z-hud)' }}
      >
        <ol className="flex flex-col gap-[3px]">
          {CHAPTER_IDENTITY.map((c) => {
            const isCurrent = c.n === chapterIndex
            const isRead = visited.includes(c.n)
            return (
              <li key={c.n} className="pointer-events-auto">
                <a
                  href={`#chapter-${c.n}`}
                  className="group flex items-center gap-3 outline-offset-4"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span
                    aria-hidden="true"
                    className="block transition-all duration-500"
                    style={{
                      width: isCurrent ? '26px' : '14px',
                      height: '2px',
                      background: isCurrent
                        ? 'var(--color-gold-500)'
                        : isRead
                          ? 'var(--fg)'
                          : 'var(--fg-faint)',
                      opacity: isCurrent ? 1 : isRead ? 0.75 : 0.35,
                      transitionTimingFunction: 'var(--ease-brush)',
                    }}
                  />
                  <span
                    className="han text-caption opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: isCurrent ? 'var(--accent-quiet)' : 'var(--fg-muted)' }}
                  >
                    {c.han}
                  </span>
                  <span className="sr-only">
                    Chapter {c.n}: {c.titleEn}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Chapter identification, set on the lower letterbox bar. */}
      <div
        className="pointer-events-none fixed inset-x-0 flex items-end justify-between px-[var(--hud-inset)] pb-4 font-mono text-micro uppercase tracking-[0.3em]"
        style={{ zIndex: 'var(--z-hud)', bottom: 'var(--letterbox-bar)' }}
      >
        <div className="t-faint">
          {current ? (
            <>
              <span className="t-gold">{String(current.n).padStart(2, '0')}</span>
              <span className="mx-2 t-faint opacity-60">/</span>
              <span className="han not-italic t-fg">{current.han}</span>
              <span className="ml-3 t-muted">{current.titleAlt}</span>
            </>
          ) : (
            <span className="t-faint">兵法</span>
          )}
        </div>
        <div className="hidden text-right t-faint sm:block">
          {act ? `${act.han} · ${act.title}` : 'Before the count'}
        </div>
      </div>

      {/* Controls, set on the upper bar. */}
      <div
        className="fixed inset-x-0 flex items-start justify-end gap-6 px-[var(--hud-inset)] pt-4"
        style={{ zIndex: 'var(--z-hud)', top: 'var(--letterbox-bar)' }}
      >
        {/* The projector. Hidden in the Codex, which is a document, not a film. */}
        {mode === 'story' ? (
          <button
            type="button"
            onClick={toggleAutoplay}
            className={`font-mono text-micro uppercase tracking-[0.3em] transition-colors hover:opacity-100 hover:[color:var(--fg)] ${autoplay ? 't-gold' : 't-muted'}`}
            aria-pressed={autoplay}
            title={autoplay ? 'Pause (space)' : 'Let it play (space)'}
          >
            {autoplay ? 'Pause' : 'Play'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleMode}
          className="font-mono text-micro uppercase tracking-[0.3em] t-muted transition-colors hover:opacity-100 hover:[color:var(--fg)]"
          aria-pressed={mode === 'codex'}
        >
          {mode === 'story' ? 'Codex' : 'Story'}
        </button>
        <button
          type="button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="font-mono text-micro uppercase tracking-[0.3em] t-muted transition-colors hover:opacity-100 hover:[color:var(--fg)]"
          aria-pressed={audioEnabled}
        >
          {audioEnabled ? 'Sound on' : 'Sound off'}
        </button>
      </div>
    </>
  )
}
