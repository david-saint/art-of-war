import { ExperienceRoot } from '@/components/ExperienceRoot'
import { ChapterSection, Dictum } from '@/components/ChapterSection'
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
      {CHAPTERS.map((c) => {
        const key = c.lines[0]
        return (
          <ChapterSection key={c.n} chapter={c.n} vh={c.scrollVh}>
            <Dictum
              chapter={c.n}
              dictum={c.dictum}
              han={key?.han}
              pinyin={key?.pinyin}
            />
          </ChapterSection>
        )
      })}
      <footer className="relative flex min-h-screen items-center justify-center px-[var(--hud-inset)]">
        <p className="max-w-xl text-center font-serif text-lead text-ink-300">
          A kingdom that has once been destroyed can never come again into being; nor can the
          dead ever be brought back to life.
        </p>
      </footer>
    </main>
  )
}
