'use client'

import { useEffect, useRef } from 'react'
import { damp, paceAt, scroll } from '@/lib/scroll'
import { useExperience } from '@/store/experience'

/**
 * Autoplay: the page walks itself down the treatise at a reading pace.
 *
 * The site is a film the reader falls through, and a film should be able to
 * run without a hand on the wheel. This is the projector. It drives
 * `window.scrollTo` from its own animation frame, so everything downstream —
 * the scroll engine, the camera, the beats, the audio — sees ordinary scroll
 * and needs no second code path.
 *
 * Three rules make it feel like a projector rather than a runaway page:
 *
 *   - It yields to the reader instantly. Any manual input that means "I am
 *     scrolling" — the wheel, a touch, the keyboard, a hand on the scrollbar —
 *     pauses it. A jump the page made for itself (a chapter link in the ledger,
 *     the scroll lock handing the position back) is not a pause: it resyncs
 *     and keeps going from wherever the reader now is.
 *   - It holds for the decision. While a node has the frame the page is locked
 *     and the projector waits; when the reader commits and the lock lifts it
 *     resumes on its own, which is what a film would do.
 *   - It ramps. Speed eases in from rest, so pressing play is a scene starting
 *     to move, not a page being yanked.
 *
 * Pace is in viewport heights per second because the beats are measured in
 * viewport heights, so a held frame lasts the same number of seconds on every
 * screen. A beat may slow the walk with `data-autoplay-pace`.
 */

/** Base pace, in viewport heights per second. */
const PACE_VH = 4
/** How quickly the pace eases in from rest (1/seconds). */
const RAMP_LAMBDA = 2.2

const NAV_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
])

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  if (t.isContentEditable) return true
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON'
}

export function AutoplayDirector() {
  const autoplay = useExperience((s) => s.autoplay)
  const setAutoplay = useExperience((s) => s.setAutoplay)
  const toggleAutoplay = useExperience((s) => s.toggleAutoplay)
  const entered = useExperience((s) => s.entered)
  const mode = useExperience((s) => s.mode)
  const running = autoplay && entered && mode === 'story'

  // Position is carried as a float between frames: scrollY is integral and
  // at reading pace the page moves a fraction of a pixel a frame, so reading
  // it back each frame would round the motion to a standstill.
  const pos = useRef<number | null>(null)
  const speed = useRef(0)

  // The projector.
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = 0
    let lastMismatch = -Infinity
    pos.current = null
    speed.current = 0

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = last ? Math.min((now - last) / 1000, 1 / 15) : 0
      last = now

      // A node has the frame: the body is out of flow and scrollY is a lie.
      // Hold, and take the position fresh when the lock hands it back.
      if (scroll.locked) {
        pos.current = null
        speed.current = 0
        return
      }

      const y = window.scrollY
      // The page moved for a reason that was not us. Once is a jump — a link
      // in the ledger, the lock handing the position back — and the projector
      // continues from there. Twice in quick succession is a hand on the
      // page: an overlay scrollbar being dragged sends no pointer event the
      // document can see, and fighting it frame by frame is the one thing
      // this must never do.
      if (pos.current !== null && Math.abs(y - pos.current) > 2) {
        if (now - lastMismatch < 250) {
          setAutoplay(false)
          return
        }
        lastMismatch = now
        pos.current = y
      }
      if (pos.current === null) pos.current = y

      const max = Math.max(0, scroll.documentHeight - scroll.viewportHeight)
      if (pos.current >= max - 1) {
        // The document simply ends.
        setAutoplay(false)
        return
      }

      const target = PACE_VH * (scroll.viewportHeight / 100) * paceAt(y + scroll.viewportHeight * 0.5)
      speed.current = damp(speed.current, target, RAMP_LAMBDA, dt)
      pos.current = Math.min(max, pos.current + speed.current * dt)
      window.scrollTo(0, pos.current)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, setAutoplay])

  // The reader's hand on the page pauses it.
  useEffect(() => {
    if (!running) return
    const pause = () => setAutoplay(false)
    const onKey = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key)) pause()
    }
    // A press on the vertical scrollbar lands outside the document's client
    // width. Nothing else on the page is there.
    const onPointerDown = (e: PointerEvent) => {
      if (e.clientX >= document.documentElement.clientWidth) pause()
    }
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('touchmove', pause, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('wheel', pause)
      window.removeEventListener('touchmove', pause)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [running, setAutoplay])

  // Space is play/pause, as it is in every player. Not while the reader is on
  // a control — a focused button wants its own click — and not through the
  // gate or over the Codex, which are not the film.
  useEffect(() => {
    if (!entered) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.repeat) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (isTypingTarget(e.target)) return
      if (useExperience.getState().mode !== 'story') return
      e.preventDefault()
      toggleAutoplay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, toggleAutoplay])

  // Leaving the film stops the projector; it does not keep the page moving
  // under the Codex, and it does not restart by itself when the reader returns.
  useEffect(() => {
    if (mode !== 'story' && autoplay) setAutoplay(false)
  }, [mode, autoplay, setAutoplay])

  return null
}
