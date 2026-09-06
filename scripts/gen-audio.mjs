#!/usr/bin/env node
// Generates the music beds, ambience textures and narration stems.
//
//   node scripts/gen-audio.mjs              # everything still missing
//   node scripts/gen-audio.mjs --set=beds   # beds | textures | narration | all
//   node scripts/gen-audio.mjs --only=bed/fire
//   node scripts/gen-audio.mjs --force
//
// Music beds come back from Lyria as ~3 minute MP3s. Each is turned into a
// genuinely seamless loop before encoding: the tail is cross-faded onto the
// head with equal-power curves, so the file's last sample flows into its first.
import { mkdir, writeFile, rm, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { generateContent, inlineParts, pool } from './lib/gemini.mjs'
import { BEDS, TEXTURES, NARRATION, VOICES } from './assets.audio.mjs'

const run = promisify(execFile)
const OUT = 'public/assets/generated/audio'
const MUSIC_MODEL = process.env.MUSIC_MODEL ?? 'lyria-3.5'
const TTS_MODEL = process.env.TTS_MODEL ?? 'gemini-3.1-flash-tts-preview'
const argv = process.argv.slice(2)
const arg = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=')
const FORCE = argv.includes('--force')
const SET = arg('set', 'all')
const ONLY = arg('only', '')

const exists = (p) => access(p).then(() => true, () => false)

async function duration(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
  return parseFloat(stdout.trim())
}

/** tail -> head equal-power overlap, so the encoded file loops without a seam. */
async function seamlessLoop(src, dst, fade) {
  const d = await duration(src)
  const x = Math.min(fade, Math.max(1, d / 4))
  const filter = [
    `[0]atrim=0:${x},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${x}:curve=qsin[head]`,
    `[0]atrim=${d - x}:${d},asetpts=PTS-STARTPTS,afade=t=out:st=0:d=${x}:curve=qsin[tail]`,
    `[head][tail]amix=inputs=2:normalize=0[xf]`,
    `[0]atrim=${x}:${d - x},asetpts=PTS-STARTPTS[body]`,
    `[xf][body]concat=n=2:v=0:a=1[out]`,
  ].join(';')
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-filter_complex', filter, '-map', '[out]', dst])
}

/** Two web deliverables per stem: opus for everyone, aac for older Safari. */
async function encode(src, base, { music }) {
  const bitrate = music ? '96k' : '64k'
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src,
    '-af', 'loudnorm=I=-20:TP=-2:LRA=11', '-c:a', 'libopus', '-b:a', bitrate, `${base}.ogg`])
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src,
    '-af', 'loudnorm=I=-20:TP=-2:LRA=11', '-c:a', 'aac', '-b:a', music ? '128k' : '96k', `${base}.m4a`])
}

async function makeMusic(entry) {
  const base = join(OUT, entry.id)
  if (!FORCE && (await exists(`${base}.ogg`))) return 'skip'
  await mkdir(dirname(base), { recursive: true })
  const res = await generateContent(MUSIC_MODEL, {
    contents: [{ parts: [{ text: entry.prompt }] }],
    generationConfig: { responseModalities: ['AUDIO'] },
  })
  const [part] = inlineParts(res)
  if (!part) throw new Error('no audio in response')
  const raw = `${base}.src.mp3`
  await writeFile(raw, part.buffer)
  const looped = `${base}.loop.wav`
  await seamlessLoop(raw, looped, entry.loopFade ?? 6)
  await encode(looped, base, { music: true })
  const secs = await duration(looped)
  await rm(raw, { force: true })
  await rm(looped, { force: true })
  return `${secs.toFixed(1)}s`
}

async function makeNarration(entry) {
  const base = join(OUT, entry.id)
  if (!FORCE && (await exists(`${base}.ogg`))) return 'skip'
  await mkdir(dirname(base), { recursive: true })
  const v = VOICES[entry.voice]
  if (!v) throw new Error(`unknown voice "${entry.voice}"`)
  const res = await generateContent(TTS_MODEL, {
    contents: [{ parts: [{ text: `${v.style}:\n\n${entry.text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v.voice } } },
    },
  })
  const [part] = inlineParts(res)
  if (!part) throw new Error('no audio in response')
  // Gemini TTS returns headerless signed 16-bit little-endian PCM.
  const rate = /rate=(\d+)/.exec(part.mime)?.[1] ?? '24000'
  const raw = `${base}.pcm`
  await writeFile(raw, part.buffer)
  const wav = `${base}.wav`
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', rate, '-ac', '1', '-i', raw, wav])
  await encode(wav, base, { music: false })
  const secs = await duration(wav)
  await rm(raw, { force: true })
  await rm(wav, { force: true })
  return `${secs.toFixed(1)}s`
}

const jobs = [
  ...(SET === 'all' || SET === 'beds' ? BEDS.map((e) => ({ ...e, kind: 'music' })) : []),
  ...(SET === 'all' || SET === 'textures' ? TEXTURES.map((e) => ({ ...e, kind: 'music' })) : []),
  ...(SET === 'all' || SET === 'narration' ? NARRATION.map((e) => ({ ...e, kind: 'tts' })) : []),
].filter((e) => !ONLY || e.id.startsWith(ONLY))

let ok = 0, skipped = 0, failed = 0
await pool(jobs, 3, async (entry) => {
  try {
    const r = entry.kind === 'music' ? await makeMusic(entry) : await makeNarration(entry)
    if (r === 'skip') { skipped++; return }
    ok++
    console.log(`  ✓ ${entry.id}  ${r}`)
  } catch (e) {
    failed++
    console.error(`  ✗ ${entry.id}: ${e.message.slice(0, 160)}`)
  }
})

console.log(`\naudio: ${ok} generated, ${skipped} already present, ${failed} failed`)
if (failed) process.exitCode = 1
