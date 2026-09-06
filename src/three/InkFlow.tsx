'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FLOW_RENDER_FRAG, FLOW_SIM_FRAG, FULLSCREEN_VERT } from '@/shaders/inkFlow'
import { useExperience } from '@/store/experience'
import { useSceneTextures } from './textures'
import { CH06, sim as simTexture } from './assets'

/**
 * Ping-pong GPGPU ink flow.
 *
 * The simulation runs at a fixed grid resolution independent of the viewport,
 * because a fluid that changes resolution when you resize the window changes
 * BEHAVIOUR — cell size is baked into the flux term, so a wider window would
 * literally make the ink run faster. Tier drops the grid, not the display.
 *
 * Disposal here is the real thing, not a formality: two render targets at
 * 512², RGBA16F, is about 8MB of GPU memory that R3F will never reclaim on its
 * own because these were created imperatively. On iOS that is the difference
 * between finishing the treatise and losing the context at chapter 9.
 */

export type InkFlowProps = {
  /** Terrain height field. Bright = high ground. */
  height?: string
  /** Resistance map: bright = fortified, ink cannot enter. */
  sizing?: string
  /** Where the ink is poured from, in 0..1 field space. */
  source?: [number, number]
  sourceRate?: number
  sourceRadius?: number
  /**
   * 0..1 multiplier on the source, read every frame. The pour is a BURST, not a
   * tap: ink that is continuously fed just makes a disc, because the source
   * dominates every gradient in the field. Shut it off and the same field
   * immediately becomes interesting — the ink has to run, thin, find the low
   * ground, and stall against the fortified regions.
   */
  sourceGate?: () => number
  /** Reader's cursor becomes a second, weaker source. */
  pointerSource?: boolean
  /** 0..1 — how much of the enemy's fullness has been earned. Read per frame. */
  reveal?: () => number
  /** World size of the displayed plane. */
  size?: [number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const GRID: Record<'high' | 'medium' | 'low', number> = { high: 512, medium: 320, low: 192 }
// Sub-steps per frame. The step count, not the conductivity, is what actually
// sets how far the front travels per second — the Courant cap inside the shader
// bounds any single step, so the only way to move ink faster is to take more of
// them. Eight passes at 512² is about two million fragment invocations, which
// is nothing next to the main scene.
const STEPS: Record<'high' | 'medium' | 'low', number> = { high: 12, medium: 7, low: 4 }

/** Reduced-motion settle, amortised over frames rather than blocking on one. */
const SETTLE_TOTAL = 260
const SETTLE_PER_FRAME = 20

export function InkFlow({
  height = '/assets/generated/img/field/terrain-01.webp',
  sizing = '/assets/generated/img/field/sizing-01.webp',
  source = [0.5, 0.94],
  sourceRate = 1.8,
  sourceRadius = 0.05,
  pointerSource = true,
  sourceGate,
  reveal,
  size = [16, 16],
  position = [0, 0, -6],
  rotation = [-Math.PI / 2.6, 0, 0],
}: InkFlowProps) {
  const gl = useThree((s) => s.gl)
  const tier = useExperience((s) => s.quality)
  const reduced = useExperience((s) => s.reducedMotion)

  const specs = useMemo(() => [simTexture(height), simTexture(sizing), CH06.paper], [height, sizing])
  const [heightTex, sizingTex, paperTex] = useSceneTextures(specs)

  const res = GRID[tier]

  // Simulation rig: its own scene and ortho camera, rendered to a target.
  const sim = useMemo(() => {
    const type = gl.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType
    const options: THREE.RenderTargetOptions = {
      type,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }
    const a = new THREE.WebGLRenderTarget(res, res, options)
    const b = new THREE.WebGLRenderTarget(res, res, options)

    const uniforms: Record<string, THREE.IUniform> = {
      uPrev: { value: a.texture },
      uHeight: { value: heightTex },
      uSizing: { value: sizingTex },
      uTexel: { value: new THREE.Vector2(1 / res, 1 / res) },
      uDt: { value: 1 / 60 },
      uFlow: { value: 22 },
      uEvap: { value: 0.018 },
      uSource: { value: new THREE.Vector4(source[0], source[1], sourceRadius, sourceRate) },
      uPointer: { value: new THREE.Vector2(-2, -2) },
      uPointerRate: { value: pointerSource ? 1.1 : 0 },
      uHeightScale: { value: 6.0 },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: FLOW_SIM_FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    quad.frustumCulled = false
    scene.add(quad)

    return { a, b, material, scene, camera, quad, uniforms }
    // Rebuilt only when the grid resolution changes; textures are swapped in below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, gl])

  useEffect(() => {
    sim.uniforms.uHeight.value = heightTex
    sim.uniforms.uSizing.value = sizingTex
  }, [sim, heightTex, sizingTex])

  // The one disposal that actually matters in this project.
  useEffect(
    () => () => {
      sim.a.dispose()
      sim.b.dispose()
      sim.material.dispose()
      sim.quad.geometry.dispose()
    },
    [sim],
  )

  const displayRef = useRef<THREE.ShaderMaterial>(null)
  const front = useRef(sim.a)
  const back = useRef(sim.b)
  const seeded = useRef(false)
  const settleBudget = useRef(SETTLE_TOTAL)
  const diagged = useRef(false)
  const pointer = useRef(new THREE.Vector2(-2, -2))
  const pointerLive = useRef(false)

  const displayUniforms = useMemo(
    () => ({
      uField: { value: sim.a.texture },
      uHeight: { value: heightTex },
      uSizing: { value: sizingTex },
      uPaper: { value: paperTex },
      uTexel: { value: new THREE.Vector2(1 / res, 1 / res) },
      uInk: { value: new THREE.Color('#1B2321') },
      uTide: { value: new THREE.Color('#0B0F0E') },
      uPaperTint: { value: new THREE.Color('#E8E2D4') },
      uJade: { value: new THREE.Color('#2F6B5A') },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uDebug: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim, res],
  )

  // ?field=1 shows the raw simulation channels. Shader work without a way to
  // look at the buffer is guesswork.
  useEffect(() => {
    const on = new URLSearchParams(window.location.search).has('field')
    if (displayRef.current) displayRef.current.uniforms.uDebug.value = on ? 1 : 0
    displayUniforms.uDebug.value = on ? 1 : 0
  }, [displayUniforms])

  useFrame((state, dt) => {
    // Clear both targets once so the field starts genuinely empty; an
    // uninitialised target on some drivers contains the previous frame's
    // colour buffer and the ink appears to start half-poured.
    if (!seeded.current) {
      const prevTarget = gl.getRenderTarget()
      for (const rt of [sim.a, sim.b]) {
        gl.setRenderTarget(rt)
        gl.setClearColor(0x000000, 1)
        gl.clear(true, false, false)
      }
      gl.setRenderTarget(prevTarget)
      seeded.current = true
    }

    // Reduced motion gets the DRIED state, not an empty sheet. The reader sees
    // where the ink ended up, which is the information; what they are spared is
    // watching it get there.
    //
    // The settle is SPREAD ACROSS FRAMES, not run in one burst. Two hundred and
    // sixty 512² passes inside a single frame is roughly a second of blocked
    // main thread — long enough to trip the browser's unresponsive-page
    // heuristics, and a hostile thing to do to precisely the readers who asked
    // for less motion. Twenty passes a frame settles in about a fifth of a
    // second of wall clock and never blocks.
    let steps = reduced ? 0 : STEPS[tier]
    let step = Math.min(dt, 1 / 30)
    if (reduced && settleBudget.current > 0) {
      steps = Math.min(SETTLE_PER_FRAME, settleBudget.current)
      settleBudget.current -= steps
      step = 1 / 60
    }

    sim.uniforms.uDt.value = step
    const gate = sourceGate ? THREE.MathUtils.clamp(sourceGate(), 0, 1) : 1
    ;(sim.uniforms.uSource.value as THREE.Vector4).w = sourceRate * gate
    if (pointerSource) {
      // state.pointer sits at NDC (0,0) until the reader moves, so pouring from
      // it unconditionally puts a permanent blot in the middle of the field on
      // every load. Wait for real movement.
      if (!pointerLive.current && (state.pointer.x !== 0 || state.pointer.y !== 0)) {
        pointerLive.current = true
      }
      if (pointerLive.current) {
        pointer.current.set((state.pointer.x + 1) * 0.5, (state.pointer.y + 1) * 0.5)
        ;(sim.uniforms.uPointer.value as THREE.Vector2).copy(pointer.current)
      } else {
        ;(sim.uniforms.uPointer.value as THREE.Vector2).set(-2, -2)
      }
    }

    if (!diagged.current) {
      diagged.current = true
      // eslint-disable-next-line no-console
      console.log('[diag] inkflow', JSON.stringify({ reduced, tier, steps, step, res, src: [sim.uniforms.uSource.value.x, sim.uniforms.uSource.value.y, sim.uniforms.uSource.value.z, sim.uniforms.uSource.value.w], flow: sim.uniforms.uFlow.value }))
    }

    const prevTarget = gl.getRenderTarget()
    for (let i = 0; i < steps; i++) {
      sim.uniforms.uPrev.value = front.current.texture
      gl.setRenderTarget(back.current)
      gl.render(sim.scene, sim.camera)
      const swap = front.current
      front.current = back.current
      back.current = swap
    }
    gl.setRenderTarget(prevTarget)

    if (displayRef.current) {
      displayRef.current.uniforms.uField.value = front.current.texture
      displayRef.current.uniforms.uTime.value += dt
      displayRef.current.uniforms.uReveal.value = reveal ? THREE.MathUtils.clamp(reveal(), 0, 1) : 0
    }
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size[0], size[1], 1, 1]} />
      <shaderMaterial
        ref={displayRef}
        dispose={null}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={FLOW_RENDER_FRAG}
        uniforms={displayUniforms}
        toneMapped={false}
      />
    </mesh>
  )
}
