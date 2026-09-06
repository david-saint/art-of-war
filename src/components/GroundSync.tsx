'use client'

import { useEffect } from 'react'
import { useDiscreteScroll } from '@/lib/useScroll'
import { groundFor, GROUND_HEX } from '@/lib/ground'

/**
 * Publishes the active chapter's ground to the document element so the token
 * layer can flip. Runs off the quantised scroll signal, so it fires on chapter
 * boundaries and nowhere near the render loop.
 */
export function GroundSync() {
  const { chapterIndex } = useDiscreteScroll()
  const ground = chapterIndex >= 1 ? groundFor(chapterIndex) : 'paper'

  useEffect(() => {
    document.documentElement.setAttribute('data-ground', ground)
    // Keeps the browser UI (address bar, overscroll gutter) in the same world.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', GROUND_HEX[ground])
  }, [ground])

  return null
}
