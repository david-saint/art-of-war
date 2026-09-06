#!/usr/bin/env node
// Compares two bench runs and pixel-diffs their screenshots.
//
//   node scripts/bench-compare.mjs .bench/baseline.json .bench/after.json [--md report.md]
//
// Screenshots are compared in a headless browser (no native image deps): a
// pixel counts as changed when any channel differs by more than THRESHOLD.
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { chromium } from 'playwright'

const [aPath, bPath] = process.argv.slice(2).filter((x) => !x.startsWith('--'))
const mdOut = process.argv.includes('--md') ? process.argv[process.argv.indexOf('--md') + 1] : null
if (!aPath || !bPath) { console.error('usage: bench-compare <a.json> <b.json> [--md out.md]'); process.exit(1) }

const A = JSON.parse(await readFile(aPath, 'utf8'))
const B = JSON.parse(await readFile(bPath, 'utf8'))
const THRESHOLD = 8 // out of 255

const f = (x, d = 1) => (x == null ? '–' : Number(x).toFixed(d))
const delta = (a, b, lowerIsBetter = true, d = 1) => {
  if (a == null || b == null) return '–'
  const pct = a === 0 ? (b === 0 ? 0 : Infinity) : ((b - a) / a) * 100
  const better = lowerIsBetter ? b < a : b > a
  const sign = pct > 0 ? '+' : ''
  return `${f(a, d)} → ${f(b, d)} (${sign}${Number.isFinite(pct) ? pct.toFixed(0) : '∞'}%${better ? ' ✓' : b === a ? '' : ' ✗'})`
}

const lines = []
const out = (s = '') => lines.push(s)

out(`# Bench: ${A.label} → ${B.label}`)
out()
out(`GPU: ${B.meta.renderer} · viewport ${B.meta.viewport} @ ${B.meta.dpr}× · network ${B.meta.net}`)
out()

out('## Load and enter')
out()
out('| Metric | before → after |')
out('|---|---|')
out(`| Canvas alive before Enter | ${A.gate.canvasBeforeEnter} → ${B.gate.canvasBeforeEnter} |`)
out(`| Enter click → first drawn frame (ms) | ${delta(A.enter.firstFrameMs, B.enter.firstFrameMs)} |`)
out(`| Enter click → hero textures + shaders ready (ms) | ${delta(A.enter.heroReadyMs, B.enter.heroReadyMs)} |`)
out(`| Shader links after Enter | ${delta(A.enter.links, B.enter.links, true, 0)} |`)
out(`| Shader compile/link blocking after Enter (ms) | ${delta(A.enter.shaderMs, B.enter.shaderMs)} |`)
out(`| Texture uploads after Enter | ${delta(A.enter.uploads, B.enter.uploads, true, 0)} |`)
out()

const byName = (r) => Object.fromEntries(r.phases.map((p) => [p.name, p]))
const PA = byName(A), PB = byName(B)
const names = A.phases.map((p) => p.name).filter((n) => PB[n])

out('## Per-frame cost at rest (median / p95, ms; main thread + GPU, fenced)')
out()
out('| Mark | Frame before | Frame after | Δ frame | Main thread before | after | Draws |')
out('|---|---|---|---|---|---|---|')
for (const n of names) {
  const a = PA[n], b = PB[n]
  const ca = a.cost ?? a.frame, cb = b.cost ?? b.frame
  const dg = ca.med && cb.med ? `${(((cb.med - ca.med) / ca.med) * 100).toFixed(0)}% (${(ca.med / cb.med).toFixed(1)}×)` : '–'
  out(`| ${n} | ${f(ca.med)} / ${f(ca.p95)} | ${f(cb.med)} / ${f(cb.p95)} | ${dg} | ${f(a.js.med)} / ${f(a.js.p95)} | ${f(b.js.med)} / ${f(b.js.p95)} | ${a.steadyDraws} → ${b.steadyDraws} |`)
}
const avg = (r, k) => { const xs = r.phases.filter((p) => /^ch/.test(p.name)).map((p) => (p[k] ?? p.frame).med).filter((x) => x != null); return xs.reduce((s, x) => s + x, 0) / xs.length }
out()
out(`Average chapter frame: ${delta(avg(A, 'cost'), avg(B, 'cost'))} → ${(1000 / avg(A, 'cost')).toFixed(0)} → ${(1000 / avg(B, 'cost')).toFixed(0)} fps attainable · main thread: ${delta(avg(A, 'js'), avg(B, 'js'))}`)
out()

out('## Chapter transitions (the swap into each mark)')
out()
out('| Mark | Longest main-thread frame before → after (ms) | Shader links | Compile block (ms) | Uploads (MB) | Upload time (ms) | Load wait (ms) |')
out('|---|---|---|---|---|---|---|')
for (const n of names) {
  const a = PA[n].transition, b = PB[n].transition
  out(`| ${n} | ${delta(a.maxJs, b.maxJs)} | ${a.links} → ${b.links} | ${delta(a.shaderMs, b.shaderMs)} | ${f(a.uploadMB)} → ${f(b.uploadMB)} | ${delta(a.uploadMs ?? 0, b.uploadMs ?? 0)} | ${f(a.pendingMs, 0)} → ${f(b.pendingMs, 0)} |`)
}
const sum = (r, k) => r.phases.filter((p) => /^ch/.test(p.name)).reduce((s, p) => s + p.transition[k], 0)
out()
out(`Across all thirteen chapters: shader links ${sum(A, 'links')} → ${sum(B, 'links')}, compile blocking ${f(sum(A, 'shaderMs'), 0)} → ${f(sum(B, 'shaderMs'), 0)} ms, uploads in the swap window ${f(sum(A, 'uploadMB'))} → ${f(sum(B, 'uploadMB'))} MB taking ${f(sum(A, 'uploadMs'), 0)} → ${f(sum(B, 'uploadMs'), 0)} ms of main thread, load waits ${f(sum(A, 'pendingMs'), 0)} → ${f(sum(B, 'pendingMs'), 0)} ms.`)
out()

out('## Memory')
out()
out('| Metric | before → after |')
out('|---|---|')
const last = (r) => r.phases[r.phases.length - 1]
out(`| GPU texture bytes resident after ch13 (MB) | ${delta(PA.ch13?.texMB, PB.ch13?.texMB)} |`)
out(`| JS heap at end (MB) | ${delta(A.memory.heapMB, B.memory.heapMB)} |`)
out(`| GPU texture bytes at end (MB) | ${delta(last(A).texMB, last(B).texMB)} |`)
out()

out('## Network')
out()
out('| Kind | before | after |')
out('|---|---|---|')
for (const k of new Set([...Object.keys(A.resources), ...Object.keys(B.resources)])) {
  const a = A.resources[k] ?? { count: 0, transferKB: 0 }, b = B.resources[k] ?? { count: 0, transferKB: 0 }
  out(`| ${k} | ${a.count} requests, ${(a.transferKB / 1024).toFixed(2)} MB | ${b.count} requests, ${(b.transferKB / 1024).toFixed(2)} MB |`)
}
out()

// ------------------------------------------------------------ screenshots
const dirA = join(dirname(aPath), A.label), dirB = join(dirname(bPath), B.label)
const shots = (await readdir(dirA)).filter((x) => x.endsWith('.png'))
const browser = await chromium.launch()
const page = await browser.newPage()
out('## Visual diff (same virtual frame, both builds)')
out()
out(`| Mark | Pixels changed (> ${THRESHOLD}/255) | Max channel Δ | Mean Δ |`)
out('|---|---|---|---|')
const diffs = []
for (const s of shots) {
  let b64b
  try { b64b = (await readFile(join(dirB, s))).toString('base64') } catch { continue }
  const b64a = (await readFile(join(dirA, s))).toString('base64')
  const r = await page.evaluate(async ([a, b, thr]) => {
    const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + src })
    const [ia, ib] = await Promise.all([load(a), load(b)])
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height)
    const c = new OffscreenCanvas(w, h), ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(ia, 0, 0); const da = ctx.getImageData(0, 0, w, h).data
    ctx.drawImage(ib, 0, 0); const db = ctx.getImageData(0, 0, w, h).data
    let changed = 0, max = 0, sum = 0
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]))
      if (d > thr) changed++
      if (d > max) max = d
      sum += d
    }
    return { changedPct: (changed / (w * h)) * 100, max, mean: sum / (w * h), sizeMatch: ia.width === ib.width && ia.height === ib.height }
  }, [b64a, b64b, THRESHOLD])
  diffs.push({ name: basename(s, '.png'), ...r })
  out(`| ${basename(s, '.png')} | ${r.changedPct.toFixed(3)}% | ${r.max} | ${r.mean.toFixed(3)} |`)
}
await browser.close()
out()

const text = lines.join('\n')
console.log(text)
if (mdOut) { await writeFile(mdOut, text + '\n'); console.log(`\nwrote ${mdOut}`) }
