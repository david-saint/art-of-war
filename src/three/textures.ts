'use client'

import { use, useEffect } from 'react'
import * as THREE from 'three'
import { PROFILES } from './quality'
import { useExperience } from '@/store/experience'

/**
 * The texture cache. One entry per (url, sampling recipe); explicit lifetime.
 *
 * Three things the stock `useTexture` path did that this replaces, and why:
 *
 * 1. It decoded on the main thread at upload time. An HTMLImageElement handed
 *    to texImage2D is re-decoded and re-laid-out by the browser inside the
 *    call, which for a 3168×1344 plate is a ~100ms stall in the frame that
 *    mounts a chapter — exactly the frame the reader is looking at. Here the
 *    bytes go through `createImageBitmap`, which decodes on a worker and hands
 *    the GPU a ready bitmap; the upload itself is then a copy.
 *
 * 2. It cached by the *combination* of URLs a component asked for, so the
 *    paper-fibre map shared by every chapter was fetched, decoded and uploaded
 *    thirteen times over. Entries here are per asset.
 *
 * 3. It never let go. Every chapter's plates stayed resident on the GPU for
 *    the life of the session — half a gigabyte by chapter thirteen, which is
 *    the difference between finishing the treatise on a phone and losing the
 *    context at chapter nine. `evictTextures` is called by the scene
 *    controller with the set it wants kept; nothing outside that set survives.
 *
 * The sampling recipe is part of the entry because it has to be applied BEFORE
 * the first upload: colour space selects the GPU's internal format, and wrap
 * and filter modes are written when the texture is created. A texture that was
 * warmed with the wrong recipe would be silently wrong for ever.
 */

export type TextureKind =
  /** Artwork: sRGB, clamped, mipmapped. Plates, glyphs, the seal. */
  | 'art'
  /** Sampled data, clamped: sprites. */
  | 'data'
  /** Sampled data, repeating: the paper fibre under the ink dissolve. */
  | 'data-repeat'
  /** Simulation inputs: linear filtering, no mipmaps, repeating. */
  | 'sim'

export type TextureSpec = {
  url: string
  kind: TextureKind
  /** Anisotropic filtering level; 'tier' resolves against the quality profile at load time. */
  anisotropy?: number | 'tier'
  /**
   * Build the mipmap chain at decode time, on a worker, instead of asking the
   * driver for it at upload. generateMipmap on a 3168×1344 plate is ~35ms of
   * main thread on Apple silicon; twelve resized bitmaps uploaded in turn are
   * a few. Each level is the previous one halved with a bilinear filter, which
   * is the same 2×2 box the driver would have used.
   */
  mips?: 'chain'
}

export const textureKey = (s: TextureSpec) => `${s.kind}/${s.anisotropy ?? 1}:${s.url}`

type Entry = {
  key: string
  spec: TextureSpec
  promise: Promise<THREE.Texture>
  texture: THREE.Texture | null
  /** Decoded bitmaps owned by this entry: level 0, plus the chain if one was built. */
  bitmaps: ImageBitmap[]
  /** Components currently rendering with this texture. Never evicted while > 0. */
  users: number
}

const cache = new Map<string, Entry>()
let renderer: THREE.WebGLRenderer | null = null

/** Lets the cache upload textures as soon as they decode, rather than on first draw. */
export function setTextureRenderer(gl: THREE.WebGLRenderer | null) {
  renderer = gl
}

/**
 * Uploads are queued one per animation frame. The copy itself is quick; what
 * costs is the mipmap chain the driver builds for a 3168×1344 plate, about
 * twenty milliseconds of main thread on Apple silicon. Two plates in one go
 * is a visible stutter; one per frame is a frame that arrives a little late.
 * A texture that gets drawn before its turn is uploaded by three at that draw,
 * and its queued upload then finds nothing to do.
 */
const uploadQueue: THREE.Texture[] = []
let uploadScheduled = false

function drainUploads() {
  uploadScheduled = false
  const texture = uploadQueue.shift()
  if (texture && renderer) renderer.initTexture(texture)
  if (uploadQueue.length) {
    uploadScheduled = true
    requestAnimationFrame(drainUploads)
  }
}

function scheduleUpload(texture: THREE.Texture) {
  if (!renderer || typeof requestAnimationFrame === 'undefined') return
  uploadQueue.push(texture)
  if (!uploadScheduled) {
    uploadScheduled = true
    requestAnimationFrame(drainUploads)
  }
}

function configure(texture: THREE.Texture, spec: TextureSpec) {
  switch (spec.kind) {
    case 'art':
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
      break
    case 'data':
      texture.colorSpace = THREE.NoColorSpace
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
      break
    case 'data-repeat':
      texture.colorSpace = THREE.NoColorSpace
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      break
    case 'sim':
      texture.colorSpace = THREE.NoColorSpace
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = false
      break
  }
  if (spec.anisotropy === 'tier') {
    texture.anisotropy = PROFILES[useExperience.getState().quality].anisotropy
  } else if (spec.anisotropy) {
    texture.anisotropy = spec.anisotropy
  }
}

// --------------------------------------------------------------- decoding

/**
 * Whether createImageBitmap honours `imageOrientation: 'flipY'`. three does not
 * flip ImageBitmaps on upload (it expects the bitmap to already be in GL's
 * bottom-up order), so a browser that ignores the option would render every
 * plate upside down. Probe once with a two-pixel image and fall back to the
 * element path if the flip is not applied.
 */
let bitmapProbe: Promise<boolean> | null = null
function canFlipBitmaps(): Promise<boolean> {
  if (bitmapProbe) return bitmapProbe
  bitmapProbe = (async () => {
    if (typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') return false
    try {
      const data = new ImageData(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]), 1, 2)
      const bmp = await createImageBitmap(data, { imageOrientation: 'flipY', premultiplyAlpha: 'none' })
      const canvas = new OffscreenCanvas(1, 2)
      const ctx = canvas.getContext('2d')
      if (!ctx) return false
      ctx.drawImage(bmp, 0, 0)
      const px = ctx.getImageData(0, 0, 1, 1).data
      bmp.close()
      return px[2] === 255 && px[0] === 0
    } catch {
      return false
    }
  })()
  return bitmapProbe
}

type Decoded = { image: ImageBitmap | HTMLImageElement; bitmaps: ImageBitmap[]; levels: ImageBitmap[] | null }

async function decode(url: string, chain: boolean): Promise<Decoded> {
  if (await canFlipBitmaps()) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    const blob = await res.blob()
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: 'flipY',
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    })
    if (!chain) return { image: bitmap, bitmaps: [bitmap], levels: null }

    // Level i is max(1, floor(w / 2^i)), which successive halving reproduces
    // exactly; the loop ends at 1×1, so the chain is complete and the texture
    // needs no further levels to be sampled at any distance.
    const levels = [bitmap]
    let w = bitmap.width
    let h = bitmap.height
    while (w > 1 || h > 1) {
      w = Math.max(1, Math.floor(w / 2))
      h = Math.max(1, Math.floor(h / 2))
      levels.push(
        await createImageBitmap(levels[levels.length - 1], {
          resizeWidth: w,
          resizeHeight: h,
          resizeQuality: 'medium',
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none',
        }),
      )
    }
    return { image: bitmap, bitmaps: levels, levels }
  }
  const image = new Image()
  image.src = url
  await image.decode()
  return { image, bitmaps: [], levels: null }
}

// ------------------------------------------------------------------ cache

function request(spec: TextureSpec): Entry {
  const key = textureKey(spec)
  const existing = cache.get(key)
  if (existing) return existing

  const entry: Entry = { key, spec, promise: null as unknown as Promise<THREE.Texture>, texture: null, bitmaps: [], users: 0 }
  entry.promise = decode(spec.url, spec.mips === 'chain' && spec.kind === 'art').then(({ image, bitmaps, levels }) => {
    // The cache may have been cleared while this was in flight; do not
    // resurrect an evicted entry with a texture nobody will dispose.
    if (cache.get(key) !== entry) {
      for (const b of bitmaps) b.close()
      throw new Error(`texture evicted while loading: ${spec.url}`)
    }
    const texture = new THREE.Texture(image)
    // ImageBitmaps are pre-flipped at decode; elements are flipped on upload.
    texture.flipY = bitmaps.length === 0
    configure(texture, spec)
    if (levels) {
      texture.mipmaps = levels as unknown as THREE.Texture['mipmaps']
      texture.generateMipmaps = false
    }
    texture.needsUpdate = true
    entry.texture = texture
    entry.bitmaps = bitmaps
    // Upload ahead of the frame that will first draw it.
    scheduleUpload(texture)
    return texture
  })
  // A load that fails after its component has gone would otherwise surface as
  // an unhandled rejection; consumers still see the rejection through `use`.
  entry.promise.catch(() => {})
  cache.set(key, entry)
  return entry
}

function release(entry: Entry) {
  cache.delete(entry.key)
  entry.texture?.dispose()
  for (const b of entry.bitmaps) b.close()
  entry.texture = null
  entry.bitmaps = []
}

/** Starts loading (and uploading) a set of textures. Resolves when all have settled. */
export async function prewarmTextures(specs: readonly TextureSpec[]): Promise<void> {
  await Promise.allSettled(specs.map((s) => request(s).promise))
}

/**
 * Disposes every cached texture whose key is not in `keep` and which no mounted
 * component is using. GPU memory is released immediately; the decoded bitmap
 * with it.
 */
export function evictTextures(keep: ReadonlySet<string>): void {
  for (const entry of [...cache.values()]) {
    if (keep.has(entry.key) || entry.users > 0) continue
    release(entry)
  }
}

/** Drops entries outright so the next request reloads them. For retry after a failed load. */
export function clearTextures(specs: readonly TextureSpec[]): void {
  for (const s of specs) {
    const entry = cache.get(textureKey(s))
    if (entry) release(entry)
  }
}

/** Resident GPU texture count, for diagnostics. */
export function textureCacheSize(): number {
  return cache.size
}

/**
 * Suspends until every texture is decoded and uploaded. The array identity of
 * `specs` does not matter; entries are keyed by content.
 */
export function useSceneTextures(specs: readonly TextureSpec[]): THREE.Texture[] {
  const entries = specs.map(request)
  const textures = entries.map((e) => (e.texture ? e.texture : use(e.promise)))
  useEffect(() => {
    for (const e of entries) e.users++
    return () => {
      for (const e of entries) e.users--
    }
    // Entries are stable per key; re-running on key change is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.map((e) => e.key).join('|')])
  return textures
}
