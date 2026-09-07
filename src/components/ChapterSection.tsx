'use client'

import { useEffect, useRef } from 'react'
import { registerSection } from '@/lib/scroll'
import { useDecisionSignal } from '@/lib/useDecision'
import { useBeatRef, useScrollSignal } from '@/lib/useScroll'
import { CHAPTER_IDENTITY } from '@/data/chapters'
import { useExperience } from '@/store/experience'

/**
 * A chapter's DOM half.
 *
 * A chapter is a SEQUENCE OF BEATS, not one held frame. The first version of
 * this file pinned a single text block across three or four screens of scroll,
 * which meant the reader scrolled for twenty seconds and nothing changed — the
 * site read as a list of titles with a nice background. Everything the canon
 * packets carry (the reading, the key lines, the vignette, the decision) was in
 * the data and reached nobody.
 *
 * Each beat is now its own scroll range. Sticky beats hold in frame while the
 * camera moves past them and then hand off; the vignette deliberately does NOT
 * hold, because it is eight hundred words of prose and prose wants to scroll.
 */
export type ChapterSectionProps = {
  chapter: number
  children?: React.ReactNode
}

export function ChapterSection({ chapter, children }: ChapterSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const identity = CHAPTER_IDENTITY.find((c) => c.n === chapter)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerSection(`chapter-${chapter}`, el, chapter)
  }, [chapter])

  if (!identity) return null

  return (
    <section ref={ref} id={`chapter-${chapter}`} aria-labelledby={`chapter-${chapter}-title`} className="relative">
      <h2 id={`chapter-${chapter}-title`} className="sr-only">
        Chapter {identity.n}: {identity.titleEn} ({identity.han})
      </h2>
      {children}
    </section>
  )
}

/**
 * One beat.
 *
 * `hold` pins the block for the length of its own scroll range. A held beat
 * fades out as the next one takes over rather than sliding away under it —
 * two blocks visible at once during a handoff reads as a layout bug, not as a
 * dissolve.
 */
export function Beat({
  chapter,
  index,
  hold = true,
  vh = 110,
  children,
}: {
  chapter: number
  index: number
  hold?: boolean
  vh?: number
  children: React.ReactNode
}) {
  const beatRef = useBeatRef(chapter, index)
  // Both subscriptions are booleans about THIS beat, so the component renders
  // when its own state flips and at no other time — not on rest, direction, a
  // beat change three chapters away, or a hover over a node's options.
  const here = useScrollSignal((d) => d.chapterIndex === chapter && d.beatIndex === index)

  // A decision node owns the frame for as long as it is up. Leaving the beat
  // behind it lit means the reader reads the chapter's copy and the Commander's
  // at the same time, which is the one moment in the site where that is wrong.
  const nodeHasFrame = useDecisionSignal(
    (n) => n.chapter === chapter && n.phase !== 'dormant' && n.phase !== 'resolved',
  )

  const active = here && !nodeHasFrame

  if (!hold) {
    return (
      <FlowBeat beatRef={beatRef} chapter={chapter} index={index}>
        {children}
      </FlowBeat>
    )
  }

  return (
    <div ref={beatRef} className="relative" style={{ height: `${vh}vh` }}>
      <div
        className="sticky top-0 flex h-screen items-center"
        style={{
          opacity: active ? 1 : 0,
          transition: 'opacity 620ms var(--ease-soak)',
          pointerEvents: active ? 'auto' : 'none',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(100deg, var(--scrim) 0%, var(--scrim) 46%, transparent 72%)' }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-[var(--hud-inset)]">{children}</div>
      </div>
    </div>
  )
}

/**
 * A beat that flows instead of holding. While it has the frame, the letterbox
 * opens: the reader is reading, not watching.
 */
function FlowBeat({
  beatRef,
  chapter,
  index,
  children,
}: {
  beatRef: (el: HTMLElement | null) => (() => void) | void
  chapter: number
  index: number
  children: React.ReactNode
}) {
  const setFrame = useExperience((s) => s.setFrame)
  const reading = useScrollSignal((d) => d.chapterIndex === chapter && d.beatIndex === index)

  useEffect(() => {
    if (!reading) return
    setFrame('reading')
    return () => setFrame('cinema')
  }, [reading, setFrame])

  return (
    <div ref={beatRef} className="relative">
      {children}
    </div>
  )
}

/** The chapter's opening statement, in The Text's voice. */
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
      {han ? <p className="han mt-8 text-lead leading-relaxed t-muted">{han}</p> : null}
      {pinyin ? (
        <p className="mt-2 font-mono text-caption tracking-wide t-faint">{pinyin}</p>
      ) : null}
    </div>
  )
}

/** The Historian unpacking the chapter — including where the popular reading is wrong. */
export function Reading({ gloss }: { gloss: string }) {
  return (
    <div className="max-w-[52ch]">
      <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">The reading</p>
      <p className="mt-7 font-serif text-body leading-[1.78] t-fg">{gloss}</p>
    </div>
  )
}

export type KeyLine = { han: string; pinyin: string; literal: string; modern: string }

/** Two more lines of the text, given the full apparatus. */
export function KeyLines({ lines }: { lines: KeyLine[] }) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-micro uppercase tracking-[0.42em] t-faint">The text</p>
      <div className="mt-8 space-y-10">
        {lines.map((l, i) => (
          <div key={i}>
            <p className="han text-lead leading-relaxed t-fg">{l.han}</p>
            <p className="mt-1.5 font-mono text-micro tracking-wide t-faint">{l.pinyin}</p>
            <p className="mt-3 max-w-xl font-serif text-body italic leading-snug t-muted">
              {l.literal}
            </p>
            <p className="mt-1.5 max-w-xl font-serif text-body leading-snug t-fg">{l.modern}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export type VignetteData = {
  title: string
  place: string
  when: string
  source: string
  historicity: string
  body: string
}

/**
 * The historical episode.
 *
 * This one does not hold. It is a reading column set over a held shot, because
 * eight hundred words pinned to the viewport is not a cinematic beat — it is an
 * unreadable wall. The camera keeps moving underneath it.
 */
export function Vignette({ data }: { data: VignetteData }) {
  const paragraphs = data.body.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  return (
    <div className="relative py-[18vh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent, var(--scrim) 12%, var(--scrim) 88%, transparent)' }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-[var(--hud-inset)]">
        <div className="max-w-[62ch]">
          <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">The record</p>
          <h3 className="mt-6 font-serif text-dictum leading-[1.1] t-fg">{data.title}</h3>
          <p className="mt-4 font-mono text-micro uppercase tracking-[0.22em] t-faint">
            {data.when} · {data.place}
          </p>

          <div className="mt-12 space-y-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-serif text-lead leading-[1.72] t-fg">
                {p.trim()}
              </p>
            ))}
          </div>

          <div
            className="mt-14 border-l pl-6"
            style={{ borderColor: 'var(--color-gold-700)' }}
          >
            <p className="font-mono text-micro uppercase tracking-[0.3em] t-gold">
              Record and legend
            </p>
            <p className="mt-3 font-sans text-caption leading-relaxed t-muted">
              {data.historicity}
            </p>
            <p className="mt-3 font-mono text-micro tracking-wide t-faint">{data.source}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The chapter's last word: what it is for, and where to go and check it. */
export function Close({ chapter, apply }: { chapter: number; apply: string }) {
  const identity = CHAPTER_IDENTITY.find((c) => c.n === chapter)
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-micro uppercase tracking-[0.42em] t-gold">
        {identity?.han} · apply it
      </p>
      <p className="mt-7 font-serif text-lead leading-relaxed t-fg">{apply}</p>
    </div>
  )
}
