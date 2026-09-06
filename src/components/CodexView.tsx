'use client'

import { useEffect } from 'react'
import { useExperience } from '@/store/experience'
import { ACTS, CHAPTER_IDENTITY, glyphAsset } from '@/data/chapters'
import { CHAPTER_CODEX } from '@/data/codex'

/**
 * Codex Mode.
 *
 * Story Mode is a film you fall through. Codex Mode is the thing you come back
 * to at 11pm to check what chapter 8 actually said. They are the same content
 * at two densities, and the switch between them is one continuous idea rather
 * than a page swap: the letterbox OPENS OUT (the scroll is unrolled and laid
 * flat on a table), the camera stops, and the treatise becomes a document.
 *
 * Three rules keep this from being a table of contents with extra steps:
 *   - Every entry carries the reader's own decision if they made one. The codex
 *     is a record of THEIR campaign, not a reference edition.
 *   - Chinese first, then the literal, then the modern reading. In Story Mode
 *     the order is reversed. Which one leads tells you what the mode is for.
 *   - No imagery. The canvas is dimmed almost to nothing behind a paper scrim,
 *     because a reference view that is still trying to be cinematic is neither.
 */
export function CodexView() {
  const mode = useExperience((s) => s.mode)
  const setMode = useExperience((s) => s.setMode)
  const decisions = useExperience((s) => s.decisions)
  const visited = useExperience((s) => s.visited)

  useEffect(() => {
    if (mode !== 'codex') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('story')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, setMode])

  if (mode !== 'codex') return null

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        zIndex: 'var(--z-node)',
        background: 'var(--scrim)',
        backdropFilter: 'blur(22px) saturate(0.4)',
      }}
      role="region"
      aria-label="Codex — analytical reference"
    >
      <div className="mx-auto max-w-5xl px-[var(--hud-inset)] py-24">
        <header className="mb-20 flex items-baseline justify-between gap-8 border-b pb-6"
                style={{ borderColor: 'var(--fg-faint)' }}>
          <div>
            <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">Codex</p>
            <h2 className="mt-3 font-serif text-title leading-none t-fg">十三篇</h2>
            <p className="mt-3 font-serif text-body t-muted">
              Thirteen chapters, laid flat. {visited.length} of 13 read
              {Object.keys(decisions).length > 0
                ? `, ${Object.keys(decisions).length} decided`
                : ''}
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode('story')}
            className="shrink-0 border px-6 py-3 font-mono text-micro uppercase tracking-[0.3em] t-muted transition-colors hover:[color:var(--fg)]"
            style={{ borderColor: 'var(--fg-faint)' }}
          >
            Back to the film
          </button>
        </header>

        {(Object.keys(ACTS) as unknown as (keyof typeof ACTS)[]).map((key) => {
          const act = ACTS[key]
          return (
            <section key={String(key)} className="mb-20">
              <h3 className="mb-8 flex items-baseline gap-4">
                <span className="han text-lead t-gold">{act.han}</span>
                <span className="font-mono text-micro uppercase tracking-[0.42em] t-faint">
                  {act.title}
                </span>
              </h3>

              <ol className="space-y-px">
                {act.chapters.map((n) => {
                  const c = CHAPTER_IDENTITY.find((x) => x.n === n)!
                  const entry = CHAPTER_CODEX[n]
                  const decided = decisions[n]
                  const read = visited.includes(n)
                  return (
                    <li key={n}>
                      <a
                        href={`#chapter-${n}`}
                        onClick={() => setMode('story')}
                        className="group grid gap-x-8 gap-y-4 border-t py-8 transition-colors md:grid-cols-[5rem_1fr_14rem]"
                        style={{ borderColor: 'var(--fg-faint)' }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-micro tabular-nums t-faint">
                            {String(n).padStart(2, '0')}
                          </span>
                          <img
                            src={glyphAsset(n)}
                            alt=""
                            aria-hidden="true"
                            width={48}
                            height={48}
                            loading="lazy"
                            className="h-12 w-12 object-contain opacity-80 transition-opacity group-hover:opacity-100"
                            style={{ filter: 'var(--glyph-filter, none)' }}
                          />
                        </div>

                        <div>
                          <p className="han text-lead t-fg">
                            {c.han}
                            <span className="ml-3 font-mono text-micro uppercase tracking-[0.3em] t-faint">
                              {c.pinyin}
                            </span>
                          </p>
                          <p className="mt-2 font-serif text-body leading-snug t-fg">
                            {entry?.dictum ?? c.titleAlt}
                          </p>
                          {entry?.bullets?.length ? (
                            <ul className="mt-4 space-y-1.5">
                              {entry.bullets.map((b, i) => (
                                <li key={i} className="font-sans text-caption leading-relaxed t-muted">
                                  — {b}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        <div className="font-mono text-micro uppercase tracking-[0.24em]">
                          {decided ? (
                            <p className="t-gold">
                              You chose {decided.option === 'a' ? '甲' : '乙'}
                            </p>
                          ) : read ? (
                            <p className="t-faint">Read · not decided</p>
                          ) : (
                            <p className="t-faint opacity-50">Unread</p>
                          )}
                          {entry?.apply ? (
                            <p className="mt-3 font-sans text-caption normal-case tracking-normal t-muted">
                              {entry.apply}
                            </p>
                          ) : null}
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}

        <footer className="border-t pt-10 font-mono text-micro uppercase tracking-[0.3em] t-faint"
                style={{ borderColor: 'var(--fg-faint)' }}>
          Translations after Lionel Giles, 1910 (public domain), revised against the received text.
        </footer>
      </div>
    </div>
  )
}
