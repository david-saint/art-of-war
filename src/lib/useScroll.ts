'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  registerBeat,
  getDiscrete,
  getServerDiscrete,
  measure,
  registerSection,
  startScrollEngine,
  subscribeDiscrete,
  type DiscreteScroll,
} from './scroll'

/** Mount once, at the root. Idempotent under StrictMode double-invocation. */
export function useScrollEngine(): void {
  useEffect(() => startScrollEngine(), [])
}

/**
 * Re-renders only when a quantised scroll field changes — chapter, beat,
 * direction, rest, lock. Safe in the HUD. Never use this to drive an animation.
 *
 * Prefer `useScrollSignal` with a selector: a component that reads the whole
 * snapshot re-renders when ANY field changes, and `atRest` flips on every
 * scroll start and stop. With ninety-odd beats and nodes on the page, that is
 * ninety reconciliations per flick of the wheel for a value none of them read.
 */
export function useDiscreteScroll(): DiscreteScroll {
  return useSyncExternalStore(subscribeDiscrete, getDiscrete, getServerDiscrete)
}

/**
 * Subscribes to one derived value of the quantised snapshot. The selector must
 * return a primitive (or a stable reference): React compares snapshots by
 * identity, and a fresh object every call would re-render for ever.
 */
export function useScrollSignal<T extends string | number | boolean | null>(selector: (d: DiscreteScroll) => T): T {
  return useSyncExternalStore(
    subscribeDiscrete,
    () => selector(getDiscrete()),
    () => selector(getServerDiscrete()),
  )
}

/** The active chapter, and nothing else. */
export function useChapterIndex(): number {
  return useScrollSignal((d) => d.chapterIndex)
}

/** Ref callback that registers a DOM section with the scroll engine. */
export function useSectionRef(id: string, chapter: number) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      const off = registerSection(id, el, chapter)
      // React 19 calls the cleanup returned from a ref callback on detach.
      return off
    },
    [id, chapter],
  )
}

/** Ref callback that registers a beat block with the scroll engine. */
export function useBeatRef(chapter: number, index: number) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      return registerBeat(`beat-${chapter}-${index}`, el, chapter, index)
    },
    [chapter, index],
  )
}

/** Force a re-measure after content that changes layout has settled. */
export function useRemeasure(deps: unknown[]): void {
  useEffect(() => {
    const id = requestAnimationFrame(() => measure())
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
