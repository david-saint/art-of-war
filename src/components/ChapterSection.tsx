'use client'

import { useEffect, useRef } from 'react'
import { registerSection } from '@/lib/scroll'
import { CHAPTER_IDENTITY } from '@/data/chapters'

/**
 * A chapter's DOM half.
 *
 * The section is a tall empty column whose only job is to give the scroll
 * engine a measurable range and to hold the typography. All imagery lives in
 * the canvas behind it. Text blocks are `position: sticky` inside the column so
 * they hold in the frame while the camera moves, which is what makes the type
 * feel composited into the shot rather than scrolled over it.
 */
export type ChapterSectionProps = {
  chapter: number
  children?: React.ReactNode
  /** Scroll length in viewport heights. */
  vh?: number
}

export function ChapterSection({ chapter, children, vh = 320 }: ChapterSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const identity = CHAPTER_IDENTITY.find((c) => c.n === chapter)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerSection(`chapter-${chapter}`, el, chapter)
  }, [chapter])

  if (!identity) return null

  return (
    <section
      ref={ref}
      id={`chapter-${chapter}`}
      aria-labelledby={`chapter-${chapter}-title`}
      style={{ minHeight: `${vh}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-screen items-center">
        {/* Reading scrim. Type sits in the left third of the 2.39 frame, so the
            ground is lifted only there — a full-frame scrim would flatten the
            painting, and no scrim at all leaves the copy at the mercy of
            whatever the plate happens to be doing behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, var(--scrim) 0%, transparent 52%)',
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-[var(--hud-inset)]">{children}</div>
      </div>
      <h2 id={`chapter-${chapter}-title`} className="sr-only">
        Chapter {identity.n}: {identity.titleEn} ({identity.han})
      </h2>
    </section>
  )
}

/** The chapter's opening statement: the dictum, in The Text's voice. */
export function Dictum({
  chapter,
  dictum,
  han,
  pinyin,
}: {
  chapter: number
  dictum: string
  han?: string
  pinyin?: string
}) {
  const identity = CHAPTER_IDENTITY.find((c) => c.n === chapter)
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">
        {String(chapter).padStart(2, '0')} · {identity?.han} {identity?.pinyin}
      </p>
      <p className="mt-8 font-serif text-dictum leading-[1.18] t-fg">{dictum}</p>
      {han ? (
        <p className="han mt-8 text-lead leading-relaxed t-muted">{han}</p>
      ) : null}
      {pinyin ? (
        <p className="mt-2 font-mono text-caption tracking-wide t-faint">{pinyin}</p>
      ) : null}
    </div>
  )
}
