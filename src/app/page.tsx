import { ExperienceRoot } from '@/components/ExperienceRoot'
import {
  Beat,
  ChapterSection,
  Close,
  Dictum,
  KeyLines,
  Reading,
  Vignette,
} from '@/components/ChapterSection'
import { DecisionNode, DecisionRecord } from '@/components/DecisionNode'
import type { Chapter } from '@/data/chapters'
import { chapter as ch01 } from '@/data/chapters/ch01'
import { chapter as ch02 } from '@/data/chapters/ch02'
import { chapter as ch03 } from '@/data/chapters/ch03'
import { chapter as ch04 } from '@/data/chapters/ch04'
import { chapter as ch05 } from '@/data/chapters/ch05'
import { chapter as ch06 } from '@/data/chapters/ch06'
import { chapter as ch07 } from '@/data/chapters/ch07'
import { chapter as ch08 } from '@/data/chapters/ch08'
import { chapter as ch09 } from '@/data/chapters/ch09'
import { chapter as ch10 } from '@/data/chapters/ch10'
import { chapter as ch11 } from '@/data/chapters/ch11'
import { chapter as ch12 } from '@/data/chapters/ch12'
import { chapter as ch13 } from '@/data/chapters/ch13'
import { HeroSection } from '@/components/HeroSection'

/**
 * The page is a server component and renders the entire text of the site as
 * real, crawlable, selectable HTML. The canvas is an enhancement layered over
 * it. A reader with no WebGL, a reader with JavaScript disabled, and a search
 * engine all get the treatise; what they lose is the film.
 *
 * The chapter modules are imported statically because this component runs on
 * the server: the prose is rendered into the HTML, and none of the module
 * payload reaches the browser as JavaScript.
 */
const CHAPTERS: Chapter[] = [
  ch01,
  ch02,
  ch03,
  ch04,
  ch05,
  ch06,
  ch07,
  ch08,
  ch09,
  ch10,
  ch11,
  ch12,
  ch13,
]

export default function Page() {
  return (
    <main>
      <ExperienceRoot />
      <HeroSection />

      {CHAPTERS.map((c) => (
        <ChapterSection key={c.n} chapter={c.n}>
          {/* 0 — the dictum, over the chapter's establishing shot */}
          <Beat chapter={c.n} index={0} vh={120}>
            <Dictum chapter={c.n} dictum={c.dictum} han={c.lines[0]?.han} pinyin={c.lines[0]?.pinyin} />
          </Beat>

          {/* 1 — the reading, including where the popular reading is wrong */}
          <Beat chapter={c.n} index={1} vh={140}>
            <Reading gloss={c.gloss} />
          </Beat>

          {/* 2 — the rest of the text, with its full apparatus */}
          <Beat chapter={c.n} index={2} vh={130}>
            <KeyLines lines={c.lines.slice(1)} />
          </Beat>

          {/* 3 — the historical episode. Flows; does not hold. */}
          <Beat chapter={c.n} index={3} hold={false}>
            <Vignette data={c.vignette} />
          </Beat>

          {/* 4 — the decision. Scroll locks here until the reader commits. The
              block itself never restates the situation: the node overlay owns
              that copy, and printing it twice reads as a bug. */}
          <Beat chapter={c.n} index={4} vh={150}>
            <DecisionRecord chapter={c.n} data={c.decision} />
          </Beat>

          {/* 5 — what the chapter is for */}
          <Beat chapter={c.n} index={5} vh={110}>
            <Close chapter={c.n} apply={c.codex.apply} />
          </Beat>

          <DecisionNode chapter={c.n} data={c.decision} at={0.74} />
        </ChapterSection>
      ))}

      <footer className="relative flex min-h-screen items-center justify-center px-[var(--hud-inset)]">
        <p className="max-w-xl text-center font-serif text-lead t-muted">
          A kingdom that has once been destroyed can never come again into being; nor can the
          dead ever be brought back to life.
        </p>
      </footer>
    </main>
  )
}
