'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { Preload } from '@react-three/drei'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experience'
import { FrameWatchdog, PROFILES } from './quality'

/**
 * One canvas, one WebGLRenderer, for the entire site.
 *
 * The alternative — a canvas per chapter — is tempting because it makes each
 * scene independent, and it is wrong here. Every WebGL context costs GPU memory
 * and browsers cap how many you may hold at once (Safari on iOS is the tightest
 * and will silently drop your oldest context, which presents as chapter 3
 * turning black once you reach chapter 9). Thirteen contexts also means
 * thirteen shader-compile stalls and no way to cross-dissolve between chapters.
 *
 * So: one context, one camera rig, and a scene registry that swaps content
 * underneath it. The cost of that decision is that disposal becomes our job —
 * see SceneController.
 */

function QualityGovernor() {
  const gl = useThree((s) => s.gl)
  const autoQuality = useExperience((s) => s.autoQuality)
  const setQuality = useExperience((s) => s.setQuality)
  const tier = useExperience((s) => s.quality)

  const watchdog = useMemo(
    () => new FrameWatchdog(tier, (next) => setQuality(next)),
    // Deliberately constructed once: re-creating it on every tier change would
    // reset its sample window and let quality flap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    const profile = PROFILES[tier]
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.dpr[1]))
  }, [gl, tier])

  useFrame((state, dt) => {
    if (autoQuality) watchdog.sample(dt, state.clock.elapsedTime * 1000)
  })

  return null
}

/** Suspends the render loop while the tab is hidden. Saves battery, and stops
 *  a backgrounded tab from accumulating a huge first delta on return. */
function VisibilityGate() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [setFrameloop])
  return null
}

function Post() {
  const tier = useExperience((s) => s.quality)
  const reduced = useExperience((s) => s.reducedMotion)
  const p = PROFILES[tier]

  // Pass order is not cosmetic. Depth of field must run on the raw beauty pass
  // before anything additive, or bloom bleeds across the focal plane and the
  // whole frame goes soft. Grain and vignette come last so they sit on the
  // finished image the way they would on a print.
  return (
    <EffectComposer enableNormalPass={false} multisampling={tier === 'high' ? 4 : 0}>
      <>
        {p.depthOfField && !reduced ? (
          <DepthOfField focusDistance={0.012} focalLength={0.05} bokehScale={3.2} height={480} />
        ) : (
          <></>
        )}
        {p.bloom ? (
          // Threshold sits above paper white (#F4F0E6 ≈ 0.94 luma) on purpose.
          // A lower value blooms the entire sheet and the page glows like a
          // lightbox. Only genuinely emissive things — embers, a signal fire,
          // the lamp in chapter 1 — are allowed past it.
          <Bloom intensity={0.55} luminanceThreshold={0.96} luminanceSmoothing={0.12} mipmapBlur radius={0.62} />
        ) : (
          <></>
        )}
        {p.grain ? <Noise opacity={0.045} premultiply /> : <></>}
        {/* Not a cinematic vignette — the darkening at the edge of an aged
            sheet, which is why it is this shallow. */}
        <Vignette offset={0.42} darkness={0.34} eskil={false} />
      </>
    </EffectComposer>
  )
}

export type StageProps = {
  children: ReactNode
  /** Rendered outside the composer, e.g. a loading indicator. */
  overlay?: ReactNode
}

export function Stage({ children }: StageProps) {
  const tier = useExperience((s) => s.quality)
  const profile = PROFILES[tier]
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{ zIndex: 'var(--z-canvas)' }}
      aria-hidden="true"
    >
      <Canvas
        dpr={profile.dpr}
        gl={{
          antialias: tier === 'high',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          // Required so a lost context can be recovered rather than ending the session.
          preserveDrawingBuffer: false,
        }}
        camera={{ fov: 35, near: 0.1, far: 400, position: [0, 0, 8] }}
        onCreated={({ gl, scene }) => {
          // No tone mapping. Every material here is toneMapped={false} because
          // ink values are authored, not simulated — running a filmic curve over
          // them lifts the blacks and desaturates the paper, and the whole point
          // of the palette is that those two values are exact.
          gl.toneMapping = THREE.NoToneMapping
          // Scenes set their own ground. Paper for most of the treatise; ink for
          // the night chapters. This is only the fallback for the first frame.
          scene.background = new THREE.Color('#E8E2D4')
        }}
      >
        <QualityGovernor />
        <VisibilityGate />
        {children}
        <Post />
        <Preload all />
      </Canvas>
    </div>
  )
}
