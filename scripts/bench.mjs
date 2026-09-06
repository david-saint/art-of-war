#!/usr/bin/env node
// Performance harness.
//
// Drives a PRODUCTION build (`next build` first) through the enter gate, every
// chapter, and Codex Mode, and records per frame:
//
//   - frame cost          wall time of the rAF batch that renders the frame plus a
//                         gl.finish() fence, i.e. CPU + GPU for exactly one frame
//                         (vsync is unlocked, so the interval between frames is
//                         throughput, not the display's refresh rate)
//   - main-thread time    the rAF batch alone
//   - draw calls, shader links (+ the time they block for), texture uploads
//   - long tasks, JS heap, GPU texture bytes resident
//
// The page runs on a VIRTUAL CLOCK: performance.now, requestAnimationFrame and
// setTimeout are replaced so that one tick is exactly 1/60 s and the clock
// holds still while anything is loading (an image, a fetch, a script chunk, a
// bitmap decode). Two consequences that matter:
//
//   1. Every run visits the same virtual frame at every mark, so screenshots
//      taken at a mark are reproducible and can be pixel-compared between
//      builds. This is how "no visual downgrade" is checked, not by eye.
//   2. Frame-time numbers are REAL durations (GPU and CPU) for identical work,
//      so a change in them is a change in cost, not in what was rendered.
//
//   node scripts/bench.mjs baseline           → .bench/baseline.json + .bench/baseline/*.png
//   BENCH_DPR=1 node scripts/bench.mjs foo    → device pixel ratio (default 2)
//   BENCH_NET=4g node scripts/bench.mjs foo   → throttle the network (none|4g|3g)
//   BENCH_URL=http://localhost:3000 …         → use a running server instead
//
// Then: node scripts/bench-compare.mjs .bench/baseline.json .bench/after.json
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const label = process.argv[2]
if (!label) {
  console.error('usage: node scripts/bench.mjs <label>')
  process.exit(1)
}

const DPR = Number(process.env.BENCH_DPR ?? 2)
const NET = process.env.BENCH_NET ?? 'none'
const PORT = Number(process.env.BENCH_PORT ?? 3123)
const OUT = process.env.BENCH_DIR ?? '.bench'
const GATE_READ_MS = 2000 // how long a reader spends on the enter gate
const STEADY_FRAMES = 150 // frames sampled at rest on each mark
const SETTLE_FRAMES = 150 // frames allowed for the transition into a mark
const CHAPTERS = (process.env.BENCH_CHAPTERS ?? '1,2,3,4,5,6,7,8,9,10,11,12,13').split(',').map(Number)
const DUMP = process.env.BENCH_DUMP === '1' // include every frame record in the JSON

const NETWORKS = {
  none: null,
  '4g': { downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8, latency: 40 },
  '3g': { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
}

// ------------------------------------------------------------ page-side probe
// Installed before any page script runs. Everything it touches is a global
// the app resolves at call time, so the app itself is unmodified.
const PROBE = String.raw`(() => {
  const S = (window.__bench = {
    frames: [], phase: 'boot', paused: false, pending: 0, pendingSince: 0, pendingMs: 0,
    gl: null,
    texBytes: 0, texAlloc: new WeakMap(), longTasks: [], events: [], px: new Uint8Array(4),
  })
  const realNow = performance.now.bind(performance)
  const realRAF = window.requestAnimationFrame.bind(window)
  const STEP = 1000 / 60
  let vnow = 0
  S.now = () => vnow
  S.real = realNow
  performance.now = () => vnow

  // --- virtual scheduler ------------------------------------------------
  const rafQueue = new Map()
  const timers = new Map()
  let rafId = 0
  let timerId = 0
  let scheduled = false
  window.requestAnimationFrame = (cb) => { const id = ++rafId; rafQueue.set(id, cb); schedule(); return id }
  window.cancelAnimationFrame = (id) => { rafQueue.delete(id) }
  window.setTimeout = (cb, ms = 0, ...args) => {
    const id = ++timerId
    timers.set(id, { due: vnow + Math.max(0, Number(ms) || 0), cb, args })
    schedule()
    return id
  }
  window.clearTimeout = (id) => { timers.delete(id) }

  function schedule() { if (scheduled) return; scheduled = true; realRAF(tick) }

  function cur() { return S.frames[S.frames.length - 1] }

  function tick() {
    scheduled = false
    if (S.paused) { schedule(); return }
    if (S.pending > 0) {
      // Hold the clock while anything is in flight, but never for ever: a lazy
      // image that never enters the viewport would otherwise stall the run.
      if (realNow() - S.pendingSince > 10000) { S.events.push({ t: realNow(), what: 'pending-timeout', phase: S.phase }); S.pending = 0 }
      else { schedule(); return }
    }
    vnow += STEP
    const rec = { v: vnow, t: realNow(), phase: S.phase, draws: 0, links: 0, shaderMs: 0, uploads: 0, uploadBytes: 0, uploadMs: 0, mips: 0, js: 0, fin: 0, pendingMs: S.pendingMs }
    S.pendingMs = 0
    S.frames.push(rec)

    const due = [...timers].filter(([, t]) => t.due <= vnow).sort((a, b) => a[1].due - b[1].due)
    for (const [id, t] of due) { timers.delete(id); try { t.cb(...t.args) } catch (e) { console.error(e) } }

    const cbs = [...rafQueue.values()]
    rafQueue.clear()
    const t0 = realNow()
    S.inTick = true
    for (const cb of cbs) { try { cb(vnow) } catch (e) { console.error(e) } }
    S.inTick = false
    const t1 = realNow()
    rec.js = t1 - t0
    // Fence: a one-pixel readback of the default framebuffer forces the GPU to
    // finish this frame before the next tick, so js + fin is the whole cost of
    // one frame rather than a measure of how deep the driver's queue happens
    // to be. (gl.finish() does not block here, and EXT_disjoint_timer_query is
    // not trustworthy on ANGLE/Metal.)
    if (S.gl && !S.gl.isContextLost()) {
      try { S.gl.bindFramebuffer(S.gl.FRAMEBUFFER, null); S.gl.readPixels(0, 0, 1, 1, S.gl.RGBA, S.gl.UNSIGNED_BYTE, S.px) } catch {}
      rec.dbw = S.gl.drawingBufferWidth
    }
    rec.fin = realNow() - t1
    if (rafQueue.size || timers.size) schedule()
  }

  // --- WebGL instrumentation --------------------------------------------
  const origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const ctx = origGetContext.call(this, type, attrs)
    if (ctx && type === 'webgl2' && this.isConnected && !S.gl) {
      S.gl = ctx
      const dbg = ctx.getExtension('WEBGL_debug_renderer_info')
      S.renderer = dbg ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER)
      S.events.push({ t: realNow(), what: 'context' })
    }
    return ctx
  }
  const P = WebGL2RenderingContext.prototype
  const wrap = (name, fn) => { const o = P[name]; P[name] = function (...a) { const r = o.apply(this, a); try { fn.call(this, a, r) } catch {} ; return r } }
  const timed = (name, fn) => { const o = P[name]; P[name] = function (...a) { const t = realNow(); const r = o.apply(this, a); const c = cur(); if (c) { c.shaderMs += realNow() - t; fn && fn(c, a) } return r } }
  S.stacks = {}
  for (const d of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) wrap(d, () => { const c = cur(); if (c) c.draws++; if (!S.stacks[S.phase]) S.stacks[S.phase] = { inTick: S.inTick, stack: new Error().stack.split('\n').slice(1, 7).join(' | ') } })
  timed('linkProgram', (c) => { c.links++ })
  timed('getProgramParameter')
  timed('getShaderParameter')
  const texSize = (a) => {
    // texStorage2D(target, levels, ifmt, w, h) | texImage2D(target, level, ifmt, w, h, border, fmt, type, px) | texImage2D(target, level, ifmt, fmt, type, source)
    if (a.length === 5) return a[3] * a[4] * 4
    if (a.length >= 9) return a[3] * a[4] * 4
    const src = a[5]
    if (src && src.width) return src.width * src.height * 4
    return 0
  }
  const timedUpload = (name, fn) => { const o = P[name]; P[name] = function (...a) { const t = realNow(); const r = o.apply(this, a); const c = cur(); if (c) { c.uploadMs += realNow() - t; try { fn && fn.call(this, a) } catch {} } return r } }
  const alloc = function (a) {
    const c = cur(); const bytes = texSize(a)
    const tex = this.getParameter(this.TEXTURE_BINDING_2D)
    if (tex) { const prev = S.texAlloc.get(tex) ?? 0; S.texAlloc.set(tex, bytes); S.texBytes += bytes - prev }
    if (c) { c.uploads++; c.uploadBytes += bytes }
  }
  timedUpload('texStorage2D', alloc)
  timedUpload('texImage2D', function (a) { if (a.length !== 6 && a.length < 9) return; alloc.call(this, a) })
  timedUpload('texSubImage2D', () => { const c = cur(); if (c) c.uploads++ })
  timedUpload('generateMipmap', () => { const c = cur(); if (c) c.mips++ })
  wrap('deleteTexture', function (a) { const b = S.texAlloc.get(a[0]); if (b) { S.texBytes -= b; S.texAlloc.delete(a[0]) } })

  // --- loads hold the clock ---------------------------------------------
  // Anything asynchronous that the app waits for freezes virtual time until it
  // lands, so a scene mounts on the same virtual tick whatever the network
  // did. pendingMs is the real time spent held, attributed to the next frame.
  function hold() {
    if (S.pending === 0) S.pendingSince = realNow()
    S.pending++
    const start = realNow()
    let done = false
    return () => { if (done) return; done = true; S.pending = Math.max(0, S.pending - 1); S.pendingMs += realNow() - start }
  }
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, get: desc.get,
    set(v) {
      if (this.loading !== 'lazy') {
        const release = hold()
        const done = () => { release(); this.removeEventListener('load', done); this.removeEventListener('error', done) }
        this.addEventListener('load', done); this.addEventListener('error', done)
      }
      desc.set.call(this, v)
    },
  })
  const realFetch = window.fetch.bind(window)
  window.fetch = function (...a) {
    const release = hold()
    return realFetch(...a).then((res) => {
      // Held until the body is consumed, which is when the app can act on it.
      for (const m of ['arrayBuffer', 'blob', 'json', 'text']) {
        const o = res[m].bind(res)
        res[m] = () => o().finally(release)
      }
      // A body nobody reads must not hold the clock for ever.
      window.setTimeout(release, 30000)
      return res
    }, (e) => { release(); throw e })
  }
  if (typeof createImageBitmap === 'function') {
    const realCIB = window.createImageBitmap.bind(window)
    window.createImageBitmap = function (...a) { const release = hold(); return realCIB(...a).finally(release) }
  }
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.tagName === 'SCRIPT' && n.src) {
        const release = hold()
        n.addEventListener('load', release); n.addEventListener('error', release)
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true })

  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) S.longTasks.push({ t: e.startTime, d: e.duration, phase: S.phase }) }).observe({ entryTypes: ['longtask'] })
  } catch {}
})()`

// ------------------------------------------------------------------- server
async function startServer() {
  if (process.env.BENCH_URL) return { url: process.env.BENCH_URL, stop: () => {} }
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] })
  const url = `http://localhost:${PORT}`
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(url); if (r.ok) return { url, stop: () => child.kill() } } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  child.kill()
  throw new Error('server did not start')
}

// ---------------------------------------------------------------------- run
const stats = (xs) => {
  const a = xs.filter((x) => x != null && Number.isFinite(x)).sort((x, y) => x - y)
  if (!a.length) return { n: 0 }
  const q = (p) => a[Math.min(a.length - 1, Math.floor(p * a.length))]
  return { n: a.length, med: q(0.5), p95: q(0.95), max: a[a.length - 1], mean: a.reduce((s, x) => s + x, 0) / a.length }
}

const { url, stop } = await startServer()
const dir = join(OUT, label)
await mkdir(dir, { recursive: true })

const browser = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=default', '--enable-gpu', '--disable-frame-rate-limit', '--disable-gpu-vsync'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: DPR, reducedMotion: 'no-preference' })
const page = await context.newPage()
await page.addInitScript(PROBE)
if (NETWORKS[NET]) {
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, ...NETWORKS[NET] })
}
page.on('pageerror', (e) => console.error('  [pageerror]', String(e).slice(0, 200)))
page.on('console', (m) => { if (m.type() === 'error') console.error('  [console]', m.text().slice(0, 200)) })

const bench = (fn, arg) => page.evaluate(fn, arg)
const setPhase = (phase) => bench((p) => { window.__bench.phase = p }, phase)
const frameCount = () => bench(() => window.__bench.frames.length)
const waitFrames = async (n) => { const target = (await frameCount()) + n; await page.waitForFunction((t) => window.__bench.frames.length >= t, target, { timeout: 120000 }) }
const scrollToChapter = (n, at = 0.45) => bench(([n, at]) => {
  const el = document.getElementById(`chapter-${n}`)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  window.scrollTo(0, top + el.offsetHeight * at - window.innerHeight * 0.5)
}, [n, at])
const shot = async (name) => {
  await bench(() => { window.__bench.paused = true })
  await page.screenshot({ path: join(dir, `${name}.png`) })
  await bench(() => { window.__bench.paused = false })
}

const t0 = Date.now()
process.stdout.write(`bench ${label}: dpr ${DPR}, net ${NET}\n`)

// 1. Load, read the gate for a moment, enter in silence.
await page.goto(url, { waitUntil: 'domcontentloaded' })
const nav = await bench(() => { const e = performance.getEntriesByType('navigation')[0]; return e ? { dcl: e.domContentLoadedEventEnd, load: e.loadEventEnd, ttfb: e.responseStart } : null })
await page.waitForSelector('text=Enter in silence')
await page.waitForTimeout(GATE_READ_MS)
const gateEnd = await bench(() => ({ real: window.__bench.real(), frames: window.__bench.frames.length, texBytes: window.__bench.texBytes, gl: !!window.__bench.gl }))
await setPhase('enter')
await page.click('text=Enter in silence')
// First frame with any draw, then the frame after which uploads stop for 30 frames.
await page.waitForFunction(() => window.__bench.frames.some((f) => f.phase === 'enter' && f.draws > 0), null, { timeout: 60000 })
await page.waitForFunction(() => {
  const fs = window.__bench.frames.filter((f) => f.phase === 'enter')
  const first = fs.findIndex((f) => f.draws > 0)
  if (first < 0) return false
  const tail = fs.slice(-30)
  return fs.length - first > 30 && tail.every((f) => f.uploads === 0 && f.links === 0)
}, null, { timeout: 60000 })
const enter = await bench((gateReal) => {
  const B = window.__bench
  const fs = B.frames.filter((f) => f.phase === 'enter')
  const first = fs.find((f) => f.draws > 0)
  let settled = first
  for (const f of fs) if (f.uploads > 0 || f.links > 0) settled = f
  return {
    firstFrameMs: first.t - gateReal,
    heroReadyMs: settled.t - gateReal,
    links: fs.reduce((s, f) => s + f.links, 0),
    shaderMs: fs.reduce((s, f) => s + f.shaderMs, 0),
    uploads: fs.reduce((s, f) => s + f.uploads, 0),
    uploadMB: fs.reduce((s, f) => s + f.uploadBytes, 0) / 1048576,
    pendingMs: fs.reduce((s, f) => s + f.pendingMs, 0),
  }
}, gateEnd.real)
process.stdout.write(`  enter: first frame ${enter.firstFrameMs.toFixed(0)}ms, hero ready ${enter.heroReadyMs.toFixed(0)}ms, ${enter.links} links (${enter.shaderMs.toFixed(0)}ms), ${enter.uploads} uploads\n`)

// 2. Hero at rest.
const phases = []
async function measure(name, transitionFrames) {
  const transStart = await frameCount()
  await waitFrames(transitionFrames)
  const steadyStart = await frameCount()
  await waitFrames(STEADY_FRAMES)
  const r = await bench(([name, a, b, c]) => {
    const B = window.__bench
    const trans = B.frames.slice(a, b)
    const steady = B.frames.slice(b, c)
    const draws = steady.map((f) => f.draws)
    const steadyDraws = draws.slice().sort((x, y) => x - y)[Math.floor(draws.length / 2)]
    // Gap: real time between the old scene leaving and the new one drawing at steady weight.
    let gapMs = 0, dropped = null
    for (const f of trans) {
      if (dropped == null && f.draws < steadyDraws * 0.6) dropped = f
      else if (dropped && f.draws >= steadyDraws * 0.9) { gapMs = f.t - dropped.t; break }
    }
    if (dropped && !gapMs) gapMs = trans[trans.length - 1].t - dropped.t
    return {
      name,
      steadyDraws,
      frame: steady.slice(1).map((f, i) => f.t - steady[i].t),
      js: steady.map((f) => f.js),
      fin: steady.map((f) => f.fin),
      transition: {
        maxJs: Math.max(...trans.map((f) => f.js)),
        maxFrame: Math.max(...trans.slice(1).map((f, i) => f.t - trans[i].t)),
        links: trans.reduce((s, f) => s + f.links, 0),
        shaderMs: trans.reduce((s, f) => s + f.shaderMs, 0),
        uploads: trans.reduce((s, f) => s + f.uploads, 0),
        uploadMB: trans.reduce((s, f) => s + f.uploadBytes, 0) / 1048576,
        uploadMs: trans.reduce((s, f) => s + f.uploadMs, 0),
        mips: trans.reduce((s, f) => s + f.mips, 0),
        pendingMs: trans.reduce((s, f) => s + f.pendingMs, 0),
        gapMs,
        longTasks: B.longTasks.filter((l) => l.phase === name).length,
      },
      texMB: B.texBytes / 1048576,
      heapMB: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null,
    }
  }, [name, transStart, steadyStart, steadyStart + STEADY_FRAMES])
  r.frame = stats(r.frame)
  r.js = stats(r.js)
  r.fin = stats(r.fin)
  phases.push(r)
  const tr = r.transition
  process.stdout.write(`  ${name.padEnd(6)} frame ${fmt(r.frame.med)}/${fmt(r.frame.p95)}ms (js ${fmt(r.js.med)} fence ${fmt(r.fin.med)})  draws ${r.steadyDraws}  | swap: maxJs ${fmt(tr.maxJs)}ms links ${tr.links} (${fmt(tr.shaderMs)}ms) uploads ${tr.uploads} (${tr.uploadMB.toFixed(1)}MB, ${fmt(tr.uploadMs)}ms) gap ${fmt(tr.gapMs)}ms  | tex ${r.texMB.toFixed(0)}MB\n`)
  return r
}
function fmt(x) { return x == null ? '–' : x.toFixed(1) }

await setPhase('hero')
await measure('hero', 60)
await shot('hero')

// 3. Every chapter, in reading order, so each transition is the real one.
for (const n of CHAPTERS) {
  const name = `ch${n}`
  await setPhase(name)
  await scrollToChapter(n)
  await measure(name, SETTLE_FRAMES)
  await shot(name)
}

// 4. Codex Mode: the canvas is behind a blurred scrim.
await setPhase('codex')
await page.click('button:has-text("Codex")')
await measure('codex', 60)
await shot('codex')
await page.keyboard.press('Escape')
await setPhase('story')
await measure('story', 60)

// 5. Resources.
const resources = await bench(() => {
  const groups = {}
  for (const e of performance.getEntriesByType('resource')) {
    const ext = (e.name.split('?')[0].match(/\.(\w+)$/) || [, 'other'])[1]
    const kind = /js|mjs/.test(ext) ? 'js' : /css/.test(ext) ? 'css' : /woff2?|ttf|otf/.test(ext) ? 'font' : /webp|png|jpe?g|avif/.test(ext) ? 'image' : /ogg|m4a|mp3|opus/.test(ext) ? 'audio' : 'other'
    const g = (groups[kind] ??= { count: 0, transferKB: 0, decodedKB: 0 })
    g.count++
    g.transferKB += e.transferSize / 1024
    g.decodedKB += e.decodedBodySize / 1024
  }
  return groups
})
const memory = await bench(() => ({ heapMB: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null, texMB: window.__bench.texBytes / 1048576 }))
const renderer = await bench(() => window.__bench.renderer)
const events = await bench(() => window.__bench.events)
const stacks = await bench(() => window.__bench.stacks)
const frames = DUMP ? await bench(() => window.__bench.frames) : undefined

const result = { label, date: new Date().toISOString(), meta: { dpr: DPR, net: NET, renderer, viewport: '1600x900', gateReadMs: GATE_READ_MS, steadyFrames: STEADY_FRAMES }, nav, gate: { canvasBeforeEnter: gateEnd.gl, texMBBeforeEnter: gateEnd.texBytes / 1048576 }, enter, phases, resources, memory, events, stacks, frames, wallMs: Date.now() - t0 }
await writeFile(join(OUT, `${label}.json`), JSON.stringify(result, null, 2))
process.stdout.write(`  resources: ${Object.entries(resources).map(([k, v]) => `${k} ${v.count}× ${(v.transferKB / 1024).toFixed(1)}MB`).join(', ')}\n`)
process.stdout.write(`  wrote ${join(OUT, `${label}.json`)} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`)

await browser.close()
stop()
