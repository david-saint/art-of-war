'use client'

import { forwardRef } from 'react'

/**
 * The chapter-boundary wash, as DOM.
 *
 * The scene controller swaps a chapter's 3D content under a full-frame cover
 * so that only one chapter is ever resident and the swap frame is never seen.
 * This is that cover. It sits above the page's copy and below the silk and the
 * HUD, so the outgoing beat fades and the incoming one lights under the wash
 * rather than in the open.
 *
 * It is driven by a ref, not by state: the controller writes `data-cover`
 * straight onto the element, so a chapter boundary re-renders nothing above
 * the <Canvas>. The CSS owns the easing; the durations here keep it in step
 * with the controller's clock.
 */
export type InkWashProps = {
  /** The controller's `coverMs`. The cover rises over 55% of it. */
  coverMs: number
  /** How long the sheet takes to clear once the incoming chapter is resident. */
  clearMs?: number
}

export const InkWash = forwardRef<HTMLDivElement, InkWashProps>(function InkWash(
  { coverMs, clearMs = 900 },
  ref,
) {
  return (
    <div
      ref={ref}
      className="ink-wash"
      aria-hidden="true"
      data-cover="0"
      style={
        {
          '--wash-in': `${Math.round(coverMs * 0.55)}ms`,
          '--wash-out': `${clearMs}ms`,
        } as React.CSSProperties
      }
    />
  )
})
