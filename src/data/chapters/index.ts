import type { Chapter } from '../chapters'

/**
 * The chapter payload, one code-split point per chapter.
 *
 * Each chapter carries a vignette that runs to a couple of thousand words, so
 * thirteen of them statically imported would put the entire treatise in the
 * first byte a reader downloads to see the hero. The thunks below are written
 * as literal `import('./chNN')` calls on purpose: a template-literal path
 * (`import(`./ch${n}`)`) is opaque to the bundler's static analysis and the
 * split silently collapses back into one chunk.
 */
export const CHAPTERS: Record<number, () => Promise<Chapter>> = {
  1: () => import('./ch01').then((m) => m.chapter),
  2: () => import('./ch02').then((m) => m.chapter),
  3: () => import('./ch03').then((m) => m.chapter),
  4: () => import('./ch04').then((m) => m.chapter),
  5: () => import('./ch05').then((m) => m.chapter),
  6: () => import('./ch06').then((m) => m.chapter),
  7: () => import('./ch07').then((m) => m.chapter),
  8: () => import('./ch08').then((m) => m.chapter),
  9: () => import('./ch09').then((m) => m.chapter),
  10: () => import('./ch10').then((m) => m.chapter),
  11: () => import('./ch11').then((m) => m.chapter),
  12: () => import('./ch12').then((m) => m.chapter),
  13: () => import('./ch13').then((m) => m.chapter),
}

/**
 * Load one chapter, or null if the number is not one of the thirteen. Callers
 * get a resolved value rather than a rejected promise for an out-of-range
 * request, because a bad chapter number is a routing question, not a failure.
 */
export async function loadChapter(n: number): Promise<Chapter | null> {
  const load = CHAPTERS[n]
  if (!load) return null
  return load()
}
