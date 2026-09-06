'use client'

import { useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import * as THREE from 'three'
import { useDiscreteScroll } from '@/lib/useScroll'
import { useExperience } from '@/store/experience'
import { AssetBoundary } from './AssetBoundary'
import { CameraRig } from './CameraRig'
import type { CameraTrack } from './cameraTrack'

export type SceneDefinition = {
  chapter: number
  title: string
  track: CameraTrack
  Component: ComponentType
  /** Texture URLs to warm before this chapter becomes active. */
  preload?: string[]
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

  // Warm the next chapter's textures while the reader is still in this one.
  useEffect(() => {
    const next = byChapter.get(active + 1)
    if (!next?.preload?.length) return
    const loader = new THREE.TextureLoader()
    const loaded: THREE.Texture[] = []
    let cancelled = false
    next.preload.forEach((url) => {
      loader.load(url, (tex) => {
        if (cancelled) { tex.dispose(); return }
        loaded.push(tex)
      })
    })
    return () => {
      cancelled = true
      loaded.forEach((t) => t.dispose())
    }
  }, [active, byChapter])

  const scene = byChapter.get(active)
  if (!scene) return null

  return (
    <group key={scene.chapter}>
      <CameraRig track={scene.track} />
      <AssetBoundary urls={scene.preload}>
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
      // Drops shader programs whose materials are gone. Without this the
      // program cache grows monotonically across thirteen chapters.
      gl.renderLists.dispose()
    }
  }, [bucket, gl])

  return <>{children}</>
}
