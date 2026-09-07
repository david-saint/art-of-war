/**
 * The scroll engine.
 *
 * ARCHITECTURAL RULE: continuous scroll values never enter React state.
 *
 * A scroll-driven WebGL page has two consumers of scroll with incompatible
 * needs. The render loop wants a fresh value every frame and must never cause a
 * React render. The HUD wants to re-render — but only when something discrete
 * changes, like the chapter you are in. Wiring both to `useState` is the single
 * most common way these builds end up at 20fps: every scroll event re-renders
 * the tree that owns the <Canvas>, React reconciles, and the frame budget is
 * gone before three.js has drawn anything.
 *
 * So there are two tiers here:
 *
 *   1. `scroll` — a mutable module-scope object. Written once per rAF, read
 *      directly inside useFrame. Zero React involvement.
 *   2. `useDiscreteScroll()` — a useSyncExternalStore subscription that only
 *      notifies when a QUANTISED field changes (chapter index, beat index,
 *      direction, atRest). A few renders per minute, not per frame.
 *
 * GSAP ScrollTrigger is still used in this project — for DOM-side timelines,
 * pinning and typography reveals — but the 3D progress signal deliberately does
 * not depend on it. A native listener is trivially idempotent, which sidesteps
 * the StrictMode double-invocation trap that bites ScrollTrigger instances.
 */

export type ScrollSection = {
  id: string
  /** Index into the chapter list; -1 for non-chapter sections such as the hero. */
  chapter: number
  top: number
  height: number
}

export type ScrollSnapshot = {
  /** window.scrollY, unsmoothed. */
  raw: number
  /** Document progress, 0..1. */
  progress: number
  /** Critically damped follower of `progress`. Use this to drive cameras. */
  smooth: number
  /** Progress units per second, signed. */
  velocity: number
  direction: 1 | -1
  /** Index of the active chapter, or -1 when outside every chapter section. */
  chapterIndex: number
  /** Progress through the active chapter, 0..1. */
  chapterProgress: number
  /** Smoothed `chapterProgress`. */
  chapterSmooth: number
  /**
   * Which authored beat of the active chapter the reader is in.
   *
   * A chapter is not one held frame — it is a sequence of beats, each with its
   * own copy, camera mark and interaction. This is the quantised signal that
   * lets the DOM swap text blocks without touching the render loop.
   */
  beatIndex: number
  /** True when the reader has stopped moving. */
  atRest: boolean
  /** Set while a decision node has taken control of the page. */
  locked: boolean
  viewportHeight: number
  documentHeight: number
}

export const scroll: ScrollSnapshot = {
  raw: 0,
  progress: 0,
  smooth: 0,
  velocity: 0,
  direction: 1,
  chapterIndex: -1,
  chapterProgress: 0,
  chapterSmooth: 0,
  beatIndex: 0,
  atRest: true,
  locked: false,
  viewportHeight: 0,
  documentHeight: 0,
}

/** The quantised view. Object identity changes only when a field changes. */
export type DiscreteScroll = {
  chapterIndex: number
  beatIndex: number
  direction: 1 | -1
  atRest: boolean
  locked: boolean
}

let discrete: DiscreteScroll = { chapterIndex: -1, beatIndex: 0, direction: 1, atRest: true, locked: false }
const listeners = new Set<() => void>()

const SERVER_SNAPSHOT: DiscreteScroll = { chapterIndex: -1, beatIndex: 0, direction: 1, atRest: true, locked: false }

/**
 * Beats are measured from the DOM, not declared as fractions of the chapter.
 *
 * The alternative — a table of normalised progress edges per chapter — has to
 * be retuned by hand every time a vignette gets longer or a beat gains a
 * paragraph, and it silently desynchronises from the layout the moment anyone
 * edits copy. Registering the actual elements means a beat lasts exactly as
 * long as it occupies, and a longer story simply takes more scroll.
 */
type BeatRecord = { chapter: number; index: number; el: HTMLElement; top: number; height: number }
const beats = new Map<string, BeatRecord>()
let measuredBeats: BeatRecord[] = []

export function registerBeat(id: string, el: HTMLElement, chapter: number, index: number): () => void {
  beats.set(id, { chapter, index, el, top: 0, height: 0 })
  queueMeasure()
  return () => {
    beats.delete(id)
    queueMeasure()
  }
}

export function subscribeDiscrete(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function getDiscrete(): DiscreteScroll {
  return discrete
}
export function getServerDiscrete(): DiscreteScroll {
  return SERVER_SNAPSHOT
}

function publishDiscrete(next: DiscreteScroll) {
  if (
    next.chapterIndex === discrete.chapterIndex &&
    next.beatIndex === discrete.beatIndex &&
    next.direction === discrete.direction &&
    next.atRest === discrete.atRest &&
    next.locked === discrete.locked
  ) {
    return
  }
  discrete = next
  for (const fn of listeners) fn()
}

// ---------------------------------------------------------------- sections

const sections = new Map<string, { el: HTMLElement; chapter: number }>()
let measured: ScrollSection[] = []
let measureQueued = false

export function registerSection(id: string, el: HTMLElement, chapter: number): () => void {
  sections.set(id, { el, chapter })
  queueMeasure()
  return () => {
    sections.delete(id)
    queueMeasure()
  }
}

function queueMeasure() {
  if (measureQueued) return
  measureQueued = true
  requestAnimationFrame(() => {
    measureQueued = false
    measure()
  })
}

/**
 * Reads layout once, off the scroll path. Never call this from a scroll handler.
 *
 * Refuses to run while the page is locked. The scroll lock takes the body out of
 * flow, which collapses the document to viewport height — so every section's
 * measured top becomes garbage, and the ResizeObserver watching the document
 * fires the moment the lock is taken. The symptom is subtle and total: the
 * reader commits to a decision and the scene behind them silently jumps to the
 * next chapter's environment while they read the verdict.
 */
export function measure() {
  if (scroll.locked) return
  const out: ScrollSection[] = []
  for (const [id, { el, chapter }] of sections) {
    const rect = el.getBoundingClientRect()
    out.push({ id, chapter, top: rect.top + window.scrollY, height: rect.height })
  }
  out.sort((a, b) => a.top - b.top)
  measured = out

  const beatOut: BeatRecord[] = []
  for (const rec of beats.values()) {
    const r = rec.el.getBoundingClientRect()
    beatOut.push({ ...rec, top: r.top + window.scrollY, height: r.height })
  }
  beatOut.sort((a, b) => a.top - b.top)
  measuredBeats = beatOut
  scroll.viewportHeight = window.innerHeight
  scroll.documentHeight = document.documentElement.scrollHeight
}

export function getSections(): readonly ScrollSection[] {
  return measured
}

// ---------------------------------------------------------------- the loop

/**
 * Critically damped exponential follower. Frame-rate independent: `lambda` is
 * the rate in 1/seconds, so the result is identical at 60fps and 144fps.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt)
}

let running = false
let rafId = 0
let lastTime = 0
let lastProgress = 0
let restTimer = 0

const SMOOTH_LAMBDA = 7
const REST_EPSILON = 0.00015

/**
 * Which beat of `chapter` holds the focus line. Linear scan: a chapter has
 * single digits of beats and only one chapter is ever resident, so this is
 * cheaper than keeping a sorted index in step with layout.
 */
function resolveBeat(chapter: number, focus: number): number {
  let beat = 0
  for (const b of measuredBeats) {
    if (b.chapter !== chapter) continue
    if (focus >= b.top && focus < b.top + b.height) return b.index
    if (focus >= b.top) beat = b.index
  }
  return beat
}

function frame(now: number) {
  const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 15) : 1 / 60
  lastTime = now

  // While the page is locked the body is out of flow at a negative offset, so
  // window.scrollY reads 0 — which would drive the camera, the chapter index
  // and the audio all the way back to the top of the document for the duration
  // of every decision node. Hold the position the lock was taken at instead.
  //
  // That scrollY is the one layout read this loop makes. Document and viewport
  // height come from measure(), which the resize signals drive (and which
  // refuses to run while locked, so they hold their pre-lock values too):
  // reading scrollHeight here would make the browser flush any pending layout
  // on every frame, and this loop runs on every frame for forty minutes.
  const y = scroll.locked ? lockedScrollY : window.scrollY
  const max = Math.max(1, scroll.documentHeight - scroll.viewportHeight)
  const progress = Math.min(1, Math.max(0, y / max))

  scroll.raw = y
  scroll.progress = progress
  scroll.velocity = (progress - lastProgress) / Math.max(dt, 1e-4)
  if (Math.abs(progress - lastProgress) > REST_EPSILON) {
    scroll.direction = progress > lastProgress ? 1 : -1
    restTimer = 0
  } else {
    restTimer += dt
  }
  lastProgress = progress

  scroll.smooth = damp(scroll.smooth, progress, SMOOTH_LAMBDA, dt)

  // Which chapter section contains the viewport centre line?
  const focus = y + scroll.viewportHeight * 0.5
  let chapterIndex = -1
  let chapterProgress = 0
  for (const s of measured) {
    if (focus >= s.top && focus < s.top + s.height) {
      chapterIndex = s.chapter
      chapterProgress = s.height > 0 ? (focus - s.top) / s.height : 0
      break
    }
  }
  scroll.chapterIndex = chapterIndex
  scroll.chapterProgress = chapterProgress

  const beat = resolveBeat(chapterIndex, focus)
  scroll.beatIndex = beat
  scroll.chapterSmooth = damp(scroll.chapterSmooth, chapterProgress, SMOOTH_LAMBDA, dt)

  const atRest = restTimer > 0.12
  scroll.atRest = atRest

  publishDiscrete({
    chapterIndex,
    beatIndex: beat,
    direction: scroll.direction,
    atRest,
    locked: scroll.locked,
  })

  rafId = requestAnimationFrame(frame)
}

export function startScrollEngine(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (running) return () => {}
  running = true

  measure()
  const onResize = () => measure()
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('orientationchange', onResize, { passive: true })

  // Fonts and lazily-loaded media change section heights after first paint.
  const ro = new ResizeObserver(() => queueMeasure())
  ro.observe(document.documentElement)
  document.fonts?.ready.then(() => measure()).catch(() => {})

  lastTime = 0
  lastProgress = window.scrollY / Math.max(1, scroll.documentHeight - scroll.viewportHeight)
  scroll.smooth = lastProgress
  rafId = requestAnimationFrame(frame)

  return () => {
    running = false
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    ro.disconnect()
  }
}

// ---------------------------------------------------------------- scroll lock

let lockCount = 0
let lockedScrollY = 0

/**
 * Locks the page during a decision node without the classic
 * `overflow:hidden` jump. The body is taken out of flow at a negative offset,
 * so the visual position is preserved, and restored exactly on release.
 * Reference counted, so nested locks are safe.
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (lockCount === 0) {
    lockedScrollY = window.scrollY
    const bar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.position = 'fixed'
    document.body.style.top = `${-lockedScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.paddingRight = bar > 0 ? `${bar}px` : ''
    scroll.locked = true
  }
  lockCount++

  let released = false
  return () => {
    if (released) return
    released = true
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.paddingRight = ''
      window.scrollTo(0, lockedScrollY)
      scroll.locked = false
    }
  }
}
