import type { QualityTier } from '@/store/experience'

export type QualityProfile = {
  tier: QualityTier
  /** Clamp for the renderer's device pixel ratio. */
  dpr: [number, number]
  /** Particle counts are expressed as a multiplier so each scene scales itself. */
  particleScale: number
  shadows: boolean
  bloom: boolean
  depthOfField: boolean
  grain: boolean
  /** Steps in the volumetric/god-ray march, 0 disables it. */
  volumetricSteps: number
  /** Anisotropy requested for ground and map textures. */
  anisotropy: number
}

export const PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    tier: 'high',
    dpr: [1, 2],
    particleScale: 1,
    shadows: true,
    bloom: true,
    depthOfField: true,
    grain: true,
    volumetricSteps: 48,
    anisotropy: 8,
  },
  medium: {
    tier: 'medium',
    dpr: [1, 1.5],
    particleScale: 0.5,
    shadows: false,
    bloom: true,
    depthOfField: false,
    grain: true,
    volumetricSteps: 20,
    anisotropy: 4,
  },
  low: {
    tier: 'low',
    dpr: [1, 1],
    particleScale: 0.22,
    shadows: false,
    bloom: false,
    depthOfField: false,
    grain: true,
    volumetricSteps: 0,
    anisotropy: 1,
  },
}

/**
 * Capability probe.
 *
 * Deliberately not user-agent sniffing: the UA string tells you what a browser
 * wants you to believe, not what the GPU can do, and it is wrong in both
 * directions (a high-end iPad reports as a Mac, a cheap Android reports as
 * Chrome on Linux). What follows are the signals that actually correlate:
 * whether WebGL2 exists at all, the texture ceiling, memory and core hints, and
 * the raw pixel count the device is asking us to fill.
 *
 * The probe only sets the STARTING tier. `FrameWatchdog` has the final say.
 */
export function probeQuality(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  const canvas = document.createElement('canvas')
  const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
  if (!gl) return 'low'

  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext
  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const dpr = window.devicePixelRatio || 1
  const pixels = window.screen.width * window.screen.height * dpr * dpr

  // Release the probe context immediately; browsers cap concurrent contexts and
  // a leaked one here can cost the real canvas its context on iOS.
  gl.getExtension('WEBGL_lose_context')?.loseContext()

  let score = 0
  if (isWebGL2) score += 2
  if (maxTexture >= 8192) score += 1
  if (memory >= 8) score += 2
  else if (memory >= 4) score += 1
  if (cores >= 8) score += 2
  else if (cores >= 6) score += 1
  if (pixels > 6_000_000) score -= 1 // asking us to fill a lot of pixels

  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * Runtime frame-time watchdog.
 *
 * Demotes on a sustained bad median rather than on a spike — a single 40ms
 * frame is a texture upload, not a slow device, and demoting on it would make
 * quality flap every time a chapter loads. Promotion is deliberately harder
 * than demotion and happens at most once, so a device can never oscillate.
 */
export class FrameWatchdog {
  private samples: number[] = []
  private lastChange = 0
  private promotions = 0

  constructor(
    private tier: QualityTier,
    private readonly onChange: (tier: QualityTier) => void,
    private readonly windowSize = 90,
    private readonly demoteMs = 22,   // ~45fps sustained
    private readonly promoteMs = 12.5, // ~80fps sustained
    private readonly settleMs = 4000,
  ) {}

  /** Call once per frame with the frame delta in seconds. */
  sample(dt: number, now: number): void {
    const ms = dt * 1000
    if (ms > 250) return // tab was backgrounded; not a signal
    this.samples.push(ms)
    if (this.samples.length < this.windowSize) return
    if (this.samples.length > this.windowSize) this.samples.shift()
    if (now - this.lastChange < this.settleMs) return

    const sorted = [...this.samples].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]

    if (median > this.demoteMs && this.tier !== 'low') {
      this.set(this.tier === 'high' ? 'medium' : 'low', now)
    } else if (median < this.promoteMs && this.tier !== 'high' && this.promotions < 1) {
      this.promotions++
      this.set(this.tier === 'low' ? 'medium' : 'high', now)
    }
  }

  private set(tier: QualityTier, now: number) {
    this.tier = tier
    this.lastChange = now
    this.samples.length = 0
    this.onChange(tier)
  }
}
