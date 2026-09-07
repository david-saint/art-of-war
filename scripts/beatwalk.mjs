import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
const CH = Number(process.argv[2] ?? 1)
await mkdir('.shots/beats', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'no-preference' })
p.on('pageerror', (e) => console.error('[pageerror]', String(e).slice(0, 200)))
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => localStorage.setItem('bingfa.v1', JSON.stringify({
  state: { entered: true, audioEnabled: false, mode: 'story', visited: [], decisions: {}, masterVolume: .7, captions: true },
  version: 1 })))
await p.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await p.waitForTimeout(5000)
const box = await p.evaluate((ch) => {
  const el = document.getElementById(`chapter-${ch}`)
  const r = el.getBoundingClientRect()
  return { top: r.top + window.scrollY, height: el.offsetHeight, vh: window.innerHeight }
}, CH)
console.log(`chapter ${CH}: ${(box.height / box.vh).toFixed(0)}vh tall`)
for (const f of [0.04, 0.20, 0.36, 0.55, 0.76, 0.94]) {
  await p.evaluate(([top, h, vh, f]) => window.scrollTo(0, top + h * f - vh * 0.5), [box.top, box.height, box.vh, f])
  await p.waitForTimeout(2200)
  const info = await p.evaluate(() => document.documentElement.getAttribute('data-beat') ?? '')
  await p.screenshot({ path: `.shots/beats/ch${CH}-${String(Math.round(f * 100)).padStart(2, '0')}.png` })
  console.log(`  ✓ ${(f * 100).toFixed(0)}% ${info}`)
}
await b.close()
