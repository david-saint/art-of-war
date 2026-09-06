'use client'

import { useEffect, useRef } from 'react'
import { registerSection } from '@/lib/scroll'
import { useExperience } from '@/store/experience'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const entered = useExperience((s) => s.entered)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerSection('hero', el, -1)
  }, [])

  return (
    <section ref={ref} id="hero" className="relative min-h-[220vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-end pb-[calc(var(--letterbox-bar)+6rem)]">
        <h1 className="sr-only">The Art of War — 孫子兵法</h1>
        <p
          className="font-mono text-micro uppercase tracking-[0.42em] t-faint transition-opacity duration-1000"
          style={{ opacity: entered ? 1 : 0 }}
        >
          Scroll to begin the count
        </p>
      </div>
    </section>
  )
}
