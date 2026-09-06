import * as THREE from 'three'

/**
 * A camera track is the chapter's shot list expressed as data.
 *
 * `at` is normalised progress through the chapter, so a track is resolution and
 * scroll-length independent: change the section's height in CSS and the same
 * shots simply take longer to play.
 */
export type CameraKey = {
  at: number
  position: [number, number, number]
  target: [number, number, number]
  /** Focal length in mm. Converted to a vertical FOV against a 36mm gate. */
  lens?: number
  /** Camera roll in degrees. Use sparingly; a rolled horizon is a statement. */
  roll?: number
  /** Cut INTO this key instead of moving to it. */
  cut?: boolean
}

export type CameraTrack = {
  keys: CameraKey[]
  /**
   * When true the camera refuses to retrace its path on an upward scroll and
   * instead holds its furthest position. The doctrine reason: a shot that
   * rewinds tells the reader the world is a timeline they can scrub. It is not.
   * Chapters where re-reading matters (the Codex-adjacent ones) set this false.
   */
  monotonic?: boolean
}

const SENSOR_HEIGHT_MM = 24 // Super-35 gate height; 2.39 comes from the crop, not the sensor.

export function lensToFov(lensMm: number): number {
  return 2 * Math.atan(SENSOR_HEIGHT_MM / (2 * lensMm)) * THREE.MathUtils.RAD2DEG
}

/** Centripetal-ish Catmull-Rom on a scalar. Keeps the path smooth across keys
 *  without the overshoot a uniform spline produces on uneven spacing. */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5
  const v1 = (p3 - p1) * 0.5
  const t2 = t * t
  const t3 = t2 * t
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}

const clampIndex = (i: number, n: number) => Math.min(n - 1, Math.max(0, i))

export type SampledCamera = {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  roll: number
  /** True when this sample crossed a hard cut and must not be blended. */
  cut: boolean
}

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()

/**
 * Samples a track at normalised progress `t`, writing into `out` to keep this
 * allocation-free on the render path.
 */
export function sampleTrack(track: CameraTrack, t: number, out: SampledCamera): SampledCamera {
  const keys = track.keys
  const n = keys.length
  if (n === 0) return out
  if (n === 1) {
    out.position.fromArray(keys[0].position)
    out.target.fromArray(keys[0].target)
    out.fov = lensToFov(keys[0].lens ?? 50)
    out.roll = keys[0].roll ?? 0
    out.cut = false
    return out
  }

  const p = THREE.MathUtils.clamp(t, 0, 1)

  let i = 0
  while (i < n - 2 && p >= keys[i + 1].at) i++

  const k1 = keys[i]
  const k2 = keys[i + 1]
  const span = Math.max(k2.at - k1.at, 1e-5)
  const u = THREE.MathUtils.clamp((p - k1.at) / span, 0, 1)

  // A cut is not a fast move. It resolves instantly at the segment boundary.
  if (k2.cut) {
    const src = u > 0 ? k2 : k1
    out.position.fromArray(src.position)
    out.target.fromArray(src.target)
    out.fov = lensToFov(src.lens ?? 50)
    out.roll = src.roll ?? 0
    out.cut = true
    return out
  }

  const k0 = keys[clampIndex(i - 1, n)]
  const k3 = keys[clampIndex(i + 2, n)]

  // Ease inside the segment so each shot arrives and settles rather than
  // sliding at constant speed between marks.
  const e = u * u * (3 - 2 * u)

  for (let a = 0; a < 3; a++) {
    _pos.setComponent(a, catmullRom(k0.position[a], k1.position[a], k2.position[a], k3.position[a], e))
    _tgt.setComponent(a, catmullRom(k0.target[a], k1.target[a], k2.target[a], k3.target[a], e))
  }

  out.position.copy(_pos)
  out.target.copy(_tgt)
  out.fov = THREE.MathUtils.lerp(lensToFov(k1.lens ?? 50), lensToFov(k2.lens ?? 50), e)
  out.roll = THREE.MathUtils.lerp(k1.roll ?? 0, k2.roll ?? 0, e)
  out.cut = false
  return out
}

export function createSample(): SampledCamera {
  return { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 40, roll: 0, cut: false }
}

/**
 * The four lenses. Nothing in this project is shot on a focal length that is
 * not on this list — the constraint is what makes thirteen scenes feel like one
 * film rather than thirteen demos.
 */
export const LENS = {
  /** The world without people: terrain, weather, the shape of ground. */
  wide: 24,
  /** The standard. Command distance — close enough to read, far enough to judge. */
  standard: 50,
  /** The decision. Compresses the ground so choices look as narrow as they are. */
  long: 85,
  /** The evidence: a hand, a seal, a signal fire. Used at most once per chapter. */
  detail: 135,
} as const
