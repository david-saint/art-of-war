#!/usr/bin/env node
// Turns the generated masters into web deliverables.
//
// The generators write 2K masters because that is what the model produces and
// what a future re-crop wants. Nothing at that size should reach a browser: a
// 2K greyscale mask is three megabytes of PNG to carry maybe forty kilobytes of
// actual information, and the site loads a dozen of them.
//
// Rules applied here:
//   - data maps (masks, height fields, fibre) — these are SAMPLED, not looked
//     at, so they drop to 1024 and become lossy webp. Nobody ever sees a
//     compression artefact in a noise field.
//   - alpha plates (glyphs, silhouettes, seals) — kept at 1536 with alpha,
//     lossy webp at q86. These ARE looked at, and a glyph's dry-brush edge is
//     the whole point, so the quality floor is higher.
//   - sprites — 512 is plenty for something drawn at 13 screen pixels.
//
// PNG masters stay on disk; the app references .webp and falls back to .png.
import { readdir, stat, mkdir } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const ROOT = 'public/assets/generated/img'

const RULES = [
  { match: /^(ink|map|field)\//, width: 1024, quality: 78, alpha: false },
  { match: /^sprite\//, width: 512, quality: 82, alpha: true },
  { match: /^(glyph|seal|sil|paper)\//, width: 1536, quality: 86, alpha: true },
]

async function* walk(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) yield* walk(join(dir, entry.name), rel)
    else yield rel
  }
}

let done = 0
let savedBytes = 0
for await (const rel of walk(ROOT)) {
  if (!rel.endsWith('.png')) continue
  const rule = RULES.find((r) => r.match.test(rel))
  if (!rule) continue
  const src = join(ROOT, rel)
  const dst = src.replace(/\.png$/, '.webp')
  const before = (await stat(src)).size
  const args = ['-quiet', '-q', String(rule.quality), '-m', '6', '-resize', String(rule.width), '0']
  if (rule.alpha) args.push('-alpha_q', '95')
  else args.push('-noalpha')
  await run('cwebp', [...args, src, '-o', dst])
  const after = (await stat(dst)).size
  savedBytes += before - after
  done++
  console.log(`  ${rel.padEnd(34)} ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`)
}

console.log(`\noptimised ${done} plates, saved ${(savedBytes / 1048576).toFixed(1)} MB`)
