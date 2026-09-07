/**
 * The HUD's marks.
 *
 * Drawn, not fetched. Every one of these is 16px of chrome that has to take
 * the ground's colour — the whole HUD re-tints when the treatise moves from
 * paper to ink, and again on hover, on gold when a control is live — so they
 * are stroked in `currentColor` and inherit from the button. An image could do
 * none of that without one file per state per ground.
 *
 * The geometry is the HUD's own: hairlines at 1.25, square caps, and the
 * bamboo-slip vocabulary the chapter rail already speaks. Pause is two slips.
 * The Codex is 冊 — slips bound by two cords. Story is the frame, letterboxed
 * top and bottom, which is what the reader is being handed back.
 */

const box = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  focusable: false,
} as const

export function PlayIcon() {
  return (
    <svg {...box}>
      <path d="M5.5 3.25 12.5 8 5.5 12.75Z" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    // Two slips, at the rail's weight rather than the hairline's.
    <svg {...box} fill="currentColor" stroke="none">
      <path d="M5.5 3.25h1.75v9.5H5.5zM8.75 3.25h1.75v9.5H8.75z" />
    </svg>
  )
}

export function CodexIcon() {
  // Bound slips seen face on: the spine at the left, and the treatise set in
  // columns that run down them. Unbounded verticals crossed by cords draw a
  // hash at this size, so the cords became a binding edge instead.
  return (
    <svg {...box}>
      <path d="M2.5 2.5h11v11h-11z" />
      <path d="M5.25 2.5v11" />
      <path d="M8 5.25v5.5M10.75 5.25v5.5" />
    </svg>
  )
}

export function StoryIcon() {
  return (
    <svg {...box}>
      <path d="M2 3.5h12v9H2z" />
      <path d="M2 3.5h12v1.5H2zM2 11h12v1.5H2z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SoundOnIcon() {
  return (
    <svg {...box}>
      <path d="M2.5 6.25h2.25L8 3.5v9L4.75 9.75H2.5Z" />
      <path d="M10.5 6A2.75 2.75 0 0 1 10.5 10" strokeLinecap="round" />
      <path d="M12.75 4.25A5.5 5.5 0 0 1 12.75 11.75" strokeLinecap="round" />
    </svg>
  )
}

export function SoundOffIcon() {
  return (
    <svg {...box}>
      <path d="M2.5 6.25h2.25L8 3.5v9L4.75 9.75H2.5Z" />
      <path d="M10.75 6 13.75 10M13.75 6 10.75 10" />
    </svg>
  )
}
