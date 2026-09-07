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
 * Re-renders only when a quantised scroll field changes — chapter, direction,
 * rest, lock. Safe in the HUD. Never use this to drive an animation.
 */
export function useDiscreteScroll(): DiscreteScroll {
  return useSyncExternalStore(subscribeDiscrete, getDiscrete, getServerDiscrete)
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
