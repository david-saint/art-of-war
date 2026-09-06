#!/usr/bin/env node
// One-shot repair for alpha plates generated before the black/white point ramp.
import { readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run = promisify(execFile)
const ROOT = 'public/assets/generated/img'
const ALPHA_DIRS = ['sil', 'ink', 'seal', 'glyph', 'sprite', 'paper']
const KEEP_COLOR = new Set(['seal'])
const MASKS = new Set(['ink/wash-cloud-01', 'ink/smoke-01', 'ink/dissolve-noise-01', 'ink/paper-fibre-01',
  'sprite/ember-01', 'sprite/ash-01', 'sprite/rain-01', 'map/contour-height-01'])
const LO = 46, HI = 214
let n = 0
for (const dir of ALPHA_DIRS) {
  let files = []
  try { files = await readdir(join(ROOT, dir)) } catch { continue }
  for (const f of files) {
    if (!f.endsWith('.png')) continue
    const id = `${dir}/${f.replace(/\.png$/, '')}`
    if (MASKS.has(id)) continue
    const src = join(ROOT, dir, f)
    const tmp = `${src}.fix.png`
    const A = `clip((alpha(X,Y) - ${LO}) * 255 / ${HI - LO}, 0, 255)`
    const rgb = KEEP_COLOR.has(dir)
      ? `r='r(X,Y)':g='g(X,Y)':b='b(X,Y)'`
      : `r='0':g='0':b='0'`
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', `format=rgba,geq=${rgb}:a='${A}'`, tmp])
    await rename(tmp, src)
    n++
    console.log(`  · ${id}`)
  }
}
console.log(`\nrepaired ${n} alpha plates`)
