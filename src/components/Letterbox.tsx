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
  const frame = useExperience((s) => s.frame)

  useEffect(() => {
    const apply = () => {
      // Codex and reading beats both hand the page back — a cinema crop over a
      // column of prose clips it a line at a time. Reading keeps a thin margin.
      const cinema = active && mode === 'story' && frame === 'cinema'
      const full = Math.max(0, (window.innerHeight - window.innerWidth / 2.39) / 2)
      const bar = cinema ? full : mode === 'story' ? Math.min(full, 28) : 0
      document.documentElement.style.setProperty('--letterbox-bar', `${Math.round(bar)}px`)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [active, mode, frame])

  return (
    <>
      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />
    </>
  )
}
