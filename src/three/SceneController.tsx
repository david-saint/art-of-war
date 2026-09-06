'use client'

import { useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { useDiscreteScroll } from '@/lib/useScroll'
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

type Phase = 'idle' | 'covering' | 'swapping'

export type SceneControllerProps = {
  scenes: SceneDefinition[]
  /** Reports 0..1 cover opacity so the DOM transition can stay in step. */
  onCoverChange?: (cover: number) => void
  coverMs?: number
}

export function SceneController({ scenes, onCoverChange, coverMs = 900 }: SceneControllerProps) {
  const { chapterIndex } = useDiscreteScroll()
  const reduced = useExperience((s) => s.reducedMotion)
  const [active, setActive] = useState(chapterIndex)
  const phase = useRef<Phase>('idle')
  const timers = useRef<number[]>([])

  const byChapter = useMemo(() => new Map(scenes.map((s) => [s.chapter, s])), [scenes])

  useEffect(() => {
    if (chapterIndex === active) return

    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
    clear()

    if (reduced) {
      // No ritual for readers who asked for no motion: cut straight to the
      // dried state, which is what the transition was going to arrive at anyway.
      setActive(chapterIndex)
      onCoverChange?.(0)
      return
    }

    phase.current = 'covering'
    onCoverChange?.(1)
    timers.current.push(
      window.setTimeout(() => {
        phase.current = 'swapping'
        setActive(chapterIndex)
      }, coverMs * 0.55),
    )
    timers.current.push(
      window.setTimeout(() => {
        phase.current = 'idle'
        onCoverChange?.(0)
      }, coverMs),
    )

    return clear
  }, [chapterIndex, active, coverMs, onCoverChange, reduced])

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
