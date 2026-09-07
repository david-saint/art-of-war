import { glyphAsset, keyArtAsset } from '@/data/chapters'
import type { TextureSpec } from './textures'

/**
 * Every texture each scene draws, declared once.
 *
 * The scene controller reads this to warm the NEXT chapter's textures while
 * the reader is still in the current one, and to evict everything that is not
 * the previous, current or next chapter. The scene components read the same
 * helpers so the cache keys match by construction — a plate warmed as `art`
 * and then requested as `data` would be two uploads, not one.
 */

const IMG = '/assets/generated/img'

/** A painted plate or silhouette: sRGB, anisotropic. */
export const plate = (url: string): TextureSpec => ({ url, kind: 'art', anisotropy: 4 })
/** Calligraphy or a seal, sampled by the ink dissolve. */
export const glyph = (url: string): TextureSpec => ({ url, kind: 'art' })
/** A sprite or mask read as data. */
export const sprite = (url: string): TextureSpec => ({ url, kind: 'data' })
/** A simulation input: linear, unmipmapped. */
export const sim = (url: string, anisotropy?: 'tier'): TextureSpec => ({ url, kind: 'sim', anisotropy })

export const FIBRE: TextureSpec = { url: `${IMG}/ink/paper-fibre-01.webp`, kind: 'data-repeat' }
export const RIDGE = plate(`${IMG}/sil/ridge-01.webp`)

export const HERO = {
  rangeFar: plate(`${IMG}/plate/range-far-01.webp`),
  rangeMid: plate(`${IMG}/plate/range-mid-01.webp`),
  ridge: RIDGE,
  bamboo: plate(`${IMG}/sil/bamboo-01.webp`),
  title: glyph(`${IMG}/glyph/bingfa.webp`),
  seal: glyph(`${IMG}/seal/square-01.webp`),
  fibre: FIBRE,
} as const

export const CH06 = {
  terrain: sim(`${IMG}/field/terrain-01.webp`),
  sizing: sim(`${IMG}/field/sizing-01.webp`),
  paper: sim(`${IMG}/ink/paper-fibre-01.webp`, 'tier'),
  glyph: glyph(glyphAsset(6)),
  fibre: FIBRE,
} as const

export const CH12 = {
  night: plate(keyArtAsset(12)),
  burnt: plate(`${IMG}/plate/burnt-01.webp`),
  army: plate(`${IMG}/sil/army-01.webp`),
  ember: sprite(`${IMG}/sprite/ember-01.webp`),
  smoke: sprite(`${IMG}/ink/wash-cloud-01.webp`),
  glyph: glyph(glyphAsset(12)),
  fibre: FIBRE,
} as const

/** The default chapter set. */
export function chapterAssets(n: number) {
  return { art: plate(keyArtAsset(n)), ridge: RIDGE, glyph: glyph(glyphAsset(n)), fibre: FIBRE }
}

/** Everything a scene draws, by chapter number; -1 is the hero. */
export function sceneAssets(chapter: number): TextureSpec[] {
  if (chapter === -1) return Object.values(HERO)
  if (chapter === 6) return Object.values(CH06)
  if (chapter === 12) return Object.values(CH12)
  return Object.values(chapterAssets(chapter))
}

/** URLs worth fetching before the render layer's code has even arrived. */
export const HERO_URLS = Object.values(HERO).map((s) => s.url)
