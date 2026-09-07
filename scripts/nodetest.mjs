import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'no-preference' })
p.on('pageerror', (e) => console.error('[pageerror]', String(e).slice(0, 200)))
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => localStorage.setItem('bingfa.v1', JSON.stringify({
  state: { entered: true, audioEnabled: false, mode: 'story', visited: [], decisions: {}, masterVolume: .7, captions: true },
  version: 1 })))
await p.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await p.waitForTimeout(4500)

const box = await p.evaluate(() => {
  const el = document.getElementById('chapter-1')
  return { top: el.getBoundingClientRect().top + window.scrollY, h: el.offsetHeight, vh: window.innerHeight }
})
await p.evaluate(([t, h, vh]) => window.scrollTo(0, t + h * 0.76 - vh * 0.5), [box.top, box.h, box.vh])
await p.waitForTimeout(2500)

const armed = await p.evaluate(() => ({
  node: !!document.querySelector('[aria-label*="tactical decision"]'),
  buttons: [...document.querySelectorAll('[aria-label*="tactical decision"] button')].map(b => b.innerText.replace(/\s+/g,' ').slice(0,50)),
  bodyPos: getComputedStyle(document.body).position,
  y: window.scrollY,
}))
console.log('ARMED:', JSON.stringify(armed, null, 0))

// try to scroll while locked — it must not move
await p.mouse.wheel(0, 1200); await p.waitForTimeout(600)
console.log('scroll after wheel while locked:', await p.evaluate(() => window.scrollY), '(expect unchanged)')

await p.screenshot({ path: '.shots/beats/node-presented.png' })

const btns = await p.$$('[aria-label*="tactical decision"] button')
if (btns.length) { await btns[0].click(); console.log('committed option A') }
for (const [label, ms] of [['committed', 1400], ['simulating', 4400], ['consequence', 2400]]) {
  await p.waitForTimeout(ms)
  const ph = await p.evaluate(() => document.querySelector('[aria-label*="tactical decision"]')?.getAttribute('data-phase') ?? 'n/a')
  console.log(`  after ${label}: node present =`, await p.evaluate(() => !!document.querySelector('[aria-label*="tactical decision"]')))
}
await p.screenshot({ path: '.shots/beats/node-verdict.png' })
console.log('chapter shown while locked:', await p.evaluate(() => document.querySelector('nav[aria-label="Chapter progress"]')?.parentElement?.querySelectorAll('a[aria-current="step"]').length ? 'has current' : '?'))
const verdict = await p.evaluate(() => {
  const n = document.querySelector('[aria-label*="tactical decision"]')
  return n ? n.innerText.replace(/\s+/g, ' ').slice(0, 320) : 'NODE GONE'
})
console.log('VERDICT TEXT:', verdict)

const cont = await p.$('[aria-label*="tactical decision"] button:last-of-type')
if (cont) { await cont.click(); await p.waitForTimeout(900) }
console.log('after continue — bodyPos:', await p.evaluate(() => getComputedStyle(document.body).position))
await p.mouse.wheel(0, 900); await p.waitForTimeout(700)
console.log('scroll released, y =', await p.evaluate(() => window.scrollY))
console.log('stored decision:', await p.evaluate(() => JSON.parse(localStorage.getItem('bingfa.v1')).state.decisions))
await b.close()
