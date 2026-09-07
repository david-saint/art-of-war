'use client'

import { useDecisionSignal } from '@/lib/useDecision'
import { useScrollSignal } from '@/lib/useScroll'

/**
 * The diluted ground under the chapter's copy. See `.frame-scrim` in
 * globals.css for why it is one fixed sheet rather than a gradient per beat.
 *
 * It is on for the whole of every chapter and off in two places: outside the
 * chapters (the hero and the ending are the plate alone), and while a decision
 * node owns the frame, because the node brings its own ground and the
 * consequence plays on a completely clear picture.
 *
 * Both subscriptions are booleans, so this renders on a chapter boundary and
 * on a node taking or releasing the frame, and at no other time.
 */
export function FrameScrim() {
  const inChapter = useScrollSignal((d) => d.chapterIndex >= 1)
  const nodeHasFrame = useDecisionSignal((n) => n.phase !== 'dormant' && n.phase !== 'resolved')

  return (
    <div
      className="frame-scrim"
      aria-hidden="true"
      data-on={inChapter && !nodeHasFrame ? '1' : '0'}
      // Rendered after the canvas and before the page's sections at the same
      // stacking level, so it paints between them in tree order. It must NOT
      // be given a z-index above 0: the sections are positioned with z-index
      // auto, and anything higher would sit on top of the copy it is there to
      // support.
      style={{ zIndex: 'var(--z-canvas)' }}
    />
  )
}
