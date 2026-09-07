'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experience'
import { FrameWatchdog, PROFILES } from './quality'
import { prewarmTextures, setTextureRenderer } from './textures'
import { sceneAssets } from './assets'

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

/** Frames the canvas is allowed to draw behind the gate once the hero is resident. */
const WARM_FRAMES = 12

/**
 * Decides whether the render loop runs at all. It stops for three reasons,
 * none of which a reader can see:
 *
 *   - the tab is hidden. Saves battery, and stops a backgrounded tab from
 *     accumulating a huge first delta on return;
 *   - Codex Mode. The design says the camera stops, and the canvas sits behind
 *     a 22px blur and a scrim — every frame drawn there is drawn for nobody,
 *     and each one makes the compositor redo the blur;
 *   - the enter gate, once the hero has been drawn. The canvas is mounted
 *     behind the gate on purpose, so that the render layer's code, the hero's
 *     textures and every shader are ready while the reader is still reading
 *     the threshold, and Enter reveals a running scene rather than starting
 *     one. But an opaque sheet does not need sixty frames a second behind it:
 *     after the hero has drawn a dozen frames the loop waits for the click.
 */
function FrameloopDirector() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  const mode = useExperience((s) => s.mode)
  const entered = useExperience((s) => s.entered)
  const entering = useExperience((s) => s.entering)
  const [hidden, setHidden] = useState(false)
  const [warm, setWarm] = useState(false)
  const heroReady = useRef(false)
  const warmFrames = useRef(0)

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    let cancelled = false
    void prewarmTextures(sceneAssets(-1)).then(() => {
      if (!cancelled) heroReady.current = true
    })
    return () => {
      cancelled = true
    }
  }, [])

  useFrame(() => {
    if (warm || !heroReady.current) return
    if (++warmFrames.current >= WARM_FRAMES) setWarm(true)
  })

  useEffect(() => {
    const behindGate = !entered && !entering && warm
    setFrameloop(hidden || mode === 'codex' || behindGate ? 'never' : 'always')
  }, [setFrameloop, hidden, mode, entered, entering, warm])

  return null
}

function Post() {
  const tier = useExperience((s) => s.quality)
  const reduced = useExperience((s) => s.reducedMotion)
  const p = PROFILES[tier]

  // Pass order is not cosmetic. Depth of field, when a tier enables it, must
  // run on the raw beauty pass before anything additive, or bloom bleeds
  // across the focal plane and the whole frame goes soft. Grain and vignette
  // come last so they sit on the finished image the way they would on a print.
  // (No tier enables depth of field today; see PROFILES.high in quality.ts.)
  //
  // No multisampling. MSAA resolves the edges of GEOMETRY, and nothing in this
  // project has a geometric edge in frame: every plate covers the frame, the
  // ink and the particles are textured quads and points whose visible edges
  // are alpha, and alpha is per-pixel coverage that MSAA does not touch. At
  // 4× on a Retina frame it was a fifth of the render for no pixels changed.
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
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
          // The scene is composited through the effect composer, so the
          // default framebuffer is only ever written by a full-frame quad;
          // see the note on multisampling in Post.
          antialias: false,
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
          // Lets textures upload the moment they decode instead of on first draw.
          setTextureRenderer(gl)
        }}
      >
        <QualityGovernor />
        <FrameloopDirector />
        {children}
        <Post />
      </Canvas>
    </div>
  )
}
