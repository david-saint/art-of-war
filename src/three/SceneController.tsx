'use client'

import { useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { useChapterIndex } from '@/lib/useScroll'
import { useExperience } from '@/store/experience'
import { AssetBoundary } from './AssetBoundary'
import { CameraRig } from './CameraRig'
import type { CameraTrack } from './cameraTrack'
import { evictTextures, prewarmTextures, textureKey, type TextureSpec } from './textures'

export type SceneDefinition = {
  chapter: number
  title: string
  track: CameraTrack
  Component: ComponentType
  /** Every texture the scene draws. Warmed one chapter early, evicted two chapters late. */
  assets?: readonly TextureSpec[]
}

/**
 * Owns which chapter's 3D content exists, and when it is allowed to change.
 *
 * The swap is deliberately NOT a cross-dissolve between two live scenes. Two
 * chapters resident at once doubles peak GPU memory precisely at the moment the
 * new chapter is uploading its textures, which is exactly when a mid-tier
 * device is most likely to fall over. Instead the swap happens under cover of
 * the full-frame ink transition: the DOM ritual goes opaque, the old scene
 * unmounts, the new one mounts, the ritual clears. The reader sees a designed
 * transition, and only one chapter is ever resident.
 *
 * What IS allowed to be resident early is the next chapter's textures. They
 * are decoded and uploaded while the reader is still in this chapter, so the
 * swap frame has nothing to load, nothing to upload and nothing to compile —
 * the new scene mounts in the same frame the old one leaves. The chapter
 * before last is evicted at the same moment, which is what keeps GPU memory
 * flat across thirteen chapters instead of climbing to half a gigabyte.
 */

export type SceneControllerProps = {
  scenes: SceneDefinition[]
  /**
   * Reports the cover the DOM wash should be at, 1 or 0. Called on chapter
   * boundaries only, never per frame, and safe to route straight to a DOM
   * attribute so nothing above the <Canvas> re-renders.
   */
  onCoverChange?: (cover: number) => void
  /**
   * Authored length of the wash, in milliseconds: the cover goes up over the
   * first 55% and the swap happens under it; the clear begins at the end.
   */
  coverMs?: number
  /**
   * Longest the wash will hold at full cover waiting for the incoming
   * chapter's textures. The bible allows the middle of the wash to stretch to
   * about four seconds without reading as a wait, because it is ink doing what
   * ink does; past that the chapter is shown with whatever has arrived.
   */
  maxHoldMs?: number
}

/** A chapter boundary in flight. One at a time; a newer boundary replaces it. */
type Ritual = { timers: number[]; swapped: boolean; cancelled: boolean }

export function SceneController({
  scenes,
  onCoverChange,
  coverMs = 1100,
  maxHoldMs = 3500,
}: SceneControllerProps) {
  const chapterIndex = useChapterIndex()
  const reduced = useExperience((s) => s.reducedMotion)
  const [active, setActive] = useState(chapterIndex)
  const ritual = useRef<Ritual | null>(null)

  const byChapter = useMemo(() => new Map(scenes.map((s) => [s.chapter, s])), [scenes])

  const cancelRitual = () => {
    const r = ritual.current
    if (!r) return
    r.cancelled = true
    r.timers.forEach((t) => window.clearTimeout(t))
    ritual.current = null
  }

  useEffect(() => {
    if (chapterIndex === active) {
      // The reader crossed a boundary and came straight back before the swap
      // fired. Nothing is going to change under the wash, so it comes off now
      // rather than after a swap that no longer needs to happen. A ritual that
      // has already swapped is left alone: its clear is pending and this
      // render is the one its own setActive caused.
      if (ritual.current && !ritual.current.swapped) {
        cancelRitual()
        onCoverChange?.(0)
      }
      return
    }

    cancelRitual()

    if (reduced) {
      // No ritual for readers who asked for no motion: cut straight to the
      // dried state, which is what the transition was going to arrive at anyway.
      setActive(chapterIndex)
      onCoverChange?.(0)
      return
    }

    const r: Ritual = { timers: [], swapped: false, cancelled: false }
    ritual.current = r
    onCoverChange?.(1)

    r.timers.push(
      window.setTimeout(() => {
        r.swapped = true
        setActive(chapterIndex)
      }, coverMs * 0.55),
    )
    r.timers.push(
      window.setTimeout(() => {
        // The wash is the load cover. Its middle holds until the incoming
        // scene's textures are resident, bounded, so the reader never watches
        // a chapter assemble itself plate by plate as the wash lifts.
        const incoming = byChapter.get(chapterIndex)?.assets ?? []
        const warm = incoming.length ? prewarmTextures(incoming) : Promise.resolve()
        const patience = new Promise<void>((resolve) => {
          r.timers.push(window.setTimeout(resolve, Math.max(0, maxHoldMs - coverMs)))
        })
        void Promise.race([warm, patience]).then(() => {
          if (r.cancelled) return
          ritual.current = null
          onCoverChange?.(0)
        })
      }, coverMs),
    )
    // Deliberately no cleanup here: the swap timer changes `active`, which
    // re-runs this effect, and a cleanup would cancel the clear timer in the
    // same breath — leaving the wash up for good. Cancellation is explicit,
    // above, and on unmount below.
  }, [chapterIndex, active, byChapter, coverMs, maxHoldMs, onCoverChange, reduced])

  useEffect(
    () => () => {
      cancelRitual()
      onCoverChange?.(0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Texture residency: the neighbours of the active scene stay warm — the
  // next so the swap into it is free, the previous so scrolling back is too —
  // and everything else is released.
  useEffect(() => {
    const i = scenes.findIndex((s) => s.chapter === active)
    const neighbours = i < 0 ? [] : [scenes[i - 1], scenes[i], scenes[i + 1]]
    const keep = new Set<string>()
    for (const s of neighbours) for (const spec of s?.assets ?? []) keep.add(textureKey(spec))
    evictTextures(keep)
    const next = i < 0 ? undefined : scenes[i + 1]
    if (next?.assets?.length) void prewarmTextures(next.assets)
  }, [active, scenes])

  const scene = byChapter.get(active)
  if (!scene) return null

  return (
    <group key={scene.chapter}>
      <CameraRig track={scene.track} />
      <AssetBoundary specs={scene.assets}>
        <Suspense fallback={null}>
          <SceneBoundary>
            <scene.Component />
          </SceneBoundary>
        </Suspense>
      </AssetBoundary>
    </group>
  )
}

/**
 * Disposal boundary.
 *
 * R3F disposes what it created from JSX. What it does NOT dispose, and what
 * therefore leaks in every scroll-driven three.js site that has ever shipped:
 *
 *   - WebGLRenderTargets created imperatively for an FBO particle sim;
 *   - DataTextures built in a useMemo;
 *   - geometries and materials constructed outside JSX and attached by ref;
 *   - anything held in a module-scope cache that outlives the component.
 *
 * The leak is invisible on desktop and fatal on iOS, where the first symptom is
 * a lost context around chapter seven. Scenes register those resources here.
 */
const DisposeBucket = { current: null as Set<{ dispose: () => void }> | null }

export function useDisposable<T extends { dispose: () => void }>(resource: T): T {
  const bucket = DisposeBucket.current
  useEffect(() => {
    bucket?.add(resource)
    return () => {
      bucket?.delete(resource)
      resource.dispose()
    }
  }, [bucket, resource])
  return resource
}

function SceneBoundary({ children }: { children: React.ReactNode }) {
  const gl = useThree((s) => s.gl)
  const bucket = useMemo(() => new Set<{ dispose: () => void }>(), [])

  DisposeBucket.current = bucket

  useEffect(() => {
    return () => {
      for (const r of bucket) {
        try {
          r.dispose()
        } catch {
          /* a double dispose is not worth taking the page down for */
        }
      }
      bucket.clear()
      // Drops render lists that referenced the departed scene's objects.
      gl.renderLists.dispose()
    }
  }, [bucket, gl])

  return <>{children}</>
}
