'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Mode = 'story' | 'codex'
/**
 * Cinema crops the frame to 2.39 and puts the silk bars up. Reading opens them
 * out, because a fixed bar over a flowing column of prose does not frame the
 * text — it clips it, one line at a time, all the way down.
 */
export type FrameMode = 'cinema' | 'reading'
export type QualityTier = 'high' | 'medium' | 'low'
export type Decision = { option: 'a' | 'b'; at: number }

export type ExperienceState = {
  /** Which of the two reading modes is active. */
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void

  /** The reader has passed the enter gate and granted the first audio gesture. */
  entered: boolean
  enter: () => void

  frame: FrameMode
  setFrame: (frame: FrameMode) => void

  audioEnabled: boolean
  masterVolume: number
  setAudioEnabled: (on: boolean) => void
  setMasterVolume: (v: number) => void

  /** Resolved at runtime by the capability probe; never persisted. */
  quality: QualityTier
  autoQuality: boolean
  setQuality: (q: QualityTier) => void
  setAutoQuality: (on: boolean) => void

  reducedMotion: boolean
  setReducedMotion: (on: boolean) => void
  captions: boolean
  setCaptions: (on: boolean) => void

  /** Chapter number (1-13) -> the branch the reader committed to. */
  decisions: Record<number, Decision>
  commitDecision: (chapter: number, option: 'a' | 'b') => void
  clearDecision: (chapter: number) => void

  /** Chapters the reader has reached, in order of first arrival. */
  visited: number[]
  markVisited: (chapter: number) => void

  hudVisible: boolean
  setHudVisible: (on: boolean) => void
  menuOpen: boolean
  setMenuOpen: (on: boolean) => void
}

export const useExperience = create<ExperienceState>()(
  persist(
    (set, get) => ({
      mode: 'story',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'story' ? 'codex' : 'story' }),

      entered: false,
      enter: () => set({ entered: true }),

      frame: 'cinema',
      setFrame: (frame) => set({ frame }),

      audioEnabled: false,
      masterVolume: 0.7,
      setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
      setMasterVolume: (masterVolume) => set({ masterVolume }),

      quality: 'high',
      autoQuality: true,
      setQuality: (quality) => set({ quality }),
      setAutoQuality: (autoQuality) => set({ autoQuality }),

      reducedMotion: false,
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      captions: true,
      setCaptions: (captions) => set({ captions }),

      decisions: {},
      commitDecision: (chapter, option) =>
        set({ decisions: { ...get().decisions, [chapter]: { option, at: Date.now() } } }),
      clearDecision: (chapter) => {
        const next = { ...get().decisions }
        delete next[chapter]
        set({ decisions: next })
      },

      visited: [],
      markVisited: (chapter) => {
        const { visited } = get()
        if (chapter < 1 || visited.includes(chapter)) return
        set({ visited: [...visited, chapter] })
      },

      hudVisible: true,
      setHudVisible: (hudVisible) => set({ hudVisible }),
      menuOpen: false,
      setMenuOpen: (menuOpen) => set({ menuOpen }),
    }),
    {
      name: 'bingfa.v1',
      storage: createJSONStorage(() => localStorage),
      // Quality is re-probed per device and reduced-motion comes from the OS,
      // so neither is restored from a previous visit.
      partialize: (s) => ({
        mode: s.mode,
        entered: s.entered,
        audioEnabled: s.audioEnabled,
        masterVolume: s.masterVolume,
        captions: s.captions,
        decisions: s.decisions,
        visited: s.visited,
      }),
      version: 1,
    },
  ),
)

/** Stable selectors — keeps components off unrelated slice updates. */
export const selectMode = (s: ExperienceState) => s.mode
export const selectQuality = (s: ExperienceState) => s.quality
export const selectReducedMotion = (s: ExperienceState) => s.reducedMotion
export const selectDecision = (chapter: number) => (s: ExperienceState) => s.decisions[chapter]
