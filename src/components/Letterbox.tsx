'use client'

import { useEffect } from 'react'
import { useExperience } from '@/store/experience'

/**
 * The 2.39:1 bars.
 *
 * They are the mounting silk of a hanging scroll, and they are an instrument:
 * they close in to take the frame down to cinema before a beat lands, and open
 * out to hand the page back for reading. Height is published as a CSS variable
 * so HUD elements can sit ON the bar rather than guessing at an inset.
 *
 * Implemented as two fixed divs rather than a post-processing pass: bars drawn
 * in WebGL are resolution-dependent and get soft edges after DPR clamping,
 * where DOM bars are always pixel-crisp and cost nothing.
 */
export function Letterbox({ active = true }: { active?: boolean }) {
  const mode = useExperience((s) => s.mode)

  useEffect(() => {
    const apply = () => {
      // Codex Mode hands the full page back: the reader is here to look things
      // up, and a cinema crop on a reference table is an affectation.
      const cinema = active && mode === 'story'
      const bar = cinema
        ? Math.max(0, (window.innerHeight - window.innerWidth / 2.39) / 2)
        : 0
      document.documentElement.style.setProperty('--letterbox-bar', `${Math.round(bar)}px`)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [active, mode])

  return (
    <>
      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />
    </>
  )
}
