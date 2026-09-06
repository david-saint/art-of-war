#!/usr/bin/env node
// Generates every image asset in the manifest through the Gemini image models,
// then keys / flattens them into the exact form the WebGL layer wants.
//
//   node scripts/gen-images.mjs                 # everything still missing
//   node scripts/gen-images.mjs --set=core      # core material system only
//   node scripts/gen-images.mjs --set=chapters  # the 13 chapter key frames
//   node scripts/gen-images.mjs --only=ink/     # id prefix filter
//   node scripts/gen-images.mjs --force         # regenerate even if present
import { mkdir, writeFile, rm, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { generateContent, inlineParts, pool } from './lib/gemini.mjs'
import { CORE, CHAPTERS, GLYPHS, FIELDS } from './assets.images.mjs'

const run = promisify(execFile)
const OUT = 'public/assets/generated/img'
const MODEL = process.env.IMAGE_MODEL ?? 'gemini-3-pro-image'
const argv = process.argv.slice(2)
const arg = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=')
const FORCE = argv.includes('--force')
const SET = arg('set', 'all')
const ONLY = arg('only', '')

const exists = (p) => access(p).then(() => true, () => false)

const chapterEntries = CHAPTERS.map((c) => ({
  id: c.id, prompt: c.prompt, aspect: '21:9', size: '2K', post: 'none',
}))

const bySet = { core: CORE, chapters: chapterEntries, glyphs: GLYPHS, fields: FIELDS }
let manifest = bySet[SET] ?? [...CORE, ...GLYPHS, ...FIELDS, ...chapterEntries]
if (ONLY) manifest = manifest.filter((m) => m.id.startsWith(ONLY))

const finalPath = (m) => join(OUT, `${m.id}.${m.post === 'none' ? 'jpg' : 'png'}`)

async function post(m, rawPath, outPath) {
  // format=rgba first so geq's r/g/b/a expressions address real planes.
  // The model's "pure white" ground is really about #E8E6E0, so a straight
  // 255-luma inversion leaves ~20/255 of alpha everywhere and the asset shows
  // as a faint grey box over the page. Remap through a white point (LO) and a
  // black point (HI) instead, which clears the ground and keeps soft edges.
  const LO = 46   // luma at or above 255-LO becomes fully transparent
  const HI = 214  // luma at or below 255-HI becomes fully opaque
  const A = `clip((255-(r(X,Y)+g(X,Y)+b(X,Y))/3 - ${LO}) * 255 / ${HI - LO}, 0, 255)`
  const filters = {
    alpha: `format=rgba,geq=r='0':g='0':b='0':a='${A}'`,
    alphaKeepColor: `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='${A}'`,
    mask: 'format=gray',
  }
  if (m.post === 'none') {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, '-q:v', '3', outPath])
    // Homebrew's ffmpeg is built without libwebp, so shell out to cwebp, which
    // is what actually ships with the webp formula. A missing encoder must be
    // loud: silently skipping it means the site 404s on every plate.
    await run('cwebp', ['-quiet', '-q', '80', '-m', '6', outPath, '-o', outPath.replace(/\.jpg$/, '.webp')])
  } else {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, '-vf', filters[m.post], outPath])
  }
  await rm(rawPath, { force: true })
}

let ok = 0, skipped = 0, failed = 0
await pool(manifest, 3, async (m) => {
  const outPath = finalPath(m)
  if (!FORCE && (await exists(outPath))) { skipped++; return }
  await mkdir(dirname(outPath), { recursive: true })
  try {
    const res = await generateContent(MODEL, {
      contents: [{ parts: [{ text: m.prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: m.aspect, imageSize: m.size ?? '2K' },
      },
    })
    const parts = inlineParts(res)
    if (!parts.length) throw new Error('no image in response')
    const rawPath = `${outPath}.raw`
    await writeFile(rawPath, parts[0].buffer)
    await post(m, rawPath, outPath)
    ok++
    console.log(`  ✓ ${m.id}  (${(parts[0].buffer.length / 1024).toFixed(0)} KB in)`)
  } catch (e) {
    failed++
    console.error(`  ✗ ${m.id}: ${e.message.slice(0, 160)}`)
  }
})

console.log(`\nimages: ${ok} generated, ${skipped} already present, ${failed} failed  [model ${MODEL}]`)
if (failed) process.exitCode = 1
