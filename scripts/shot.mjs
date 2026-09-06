#!/usr/bin/env node
// Deterministic screenshot harness. Loads the site with a seeded store, drives
// scroll to named marks, and writes PNGs — so visual review does not depend on
// hand-driving a browser.
//
//   node scripts/shot.mjs hero ch1 ch6 ch12 ch13
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = process.env.SHOT_DIR ?? '.shots'
const URL = process.env.SHOT_URL ?? 'http://localhost:3000'
const QUERY = process.env.SHOT_QUERY ? `?${process.env.SHOT_QUERY}` : ''
const marks = process.argv.slice(2)
const wanted = marks.length ? marks : ['hero', 'ch1', 'ch6', 'ch12']

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
// Headless Chromium reports prefers-reduced-motion: reduce by default, which
// puts the site on its (correct, but static) reduced-motion path and makes
// every screenshot a still of frame zero.
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: process.env.SHOT_REDUCED === '1' ? 'reduce' : 'no-preference',
})
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || t.startsWith('[diag]')) console.error('  [console]', t.slice(0, 220)) })
page.on('pageerror', (e) => console.error('  [pageerror]', String(e).slice(0, 200)))

await page.goto(URL + QUERY, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.setItem('bingfa.v1', JSON.stringify({
    state: { entered: true, audioEnabled: false, mode: 'story', visited: [], decisions: {}, masterVolume: 0.7, captions: true },
    version: 1,
  }))
})
await page.goto(URL + QUERY, { waitUntil: 'networkidle' })
await page.waitForTimeout(6000)

for (const mark of wanted) {
  if (mark === 'hero') {
    await page.evaluate(() => window.scrollTo(0, 0))
  } else {
    const n = Number(mark.replace(/\D/g, ''))
    const at = Number(process.env.SHOT_AT ?? 0.45)
    await page.evaluate(([n, at]) => {
      const el = document.getElementById(`chapter-${n}`)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + el.offsetHeight * at - window.innerHeight * 0.5)
    }, [n, at])
  }
  await page.waitForTimeout(5500)
  const file = `${OUT}/${mark}.png`
  await page.screenshot({ path: file })
  console.log(`  ✓ ${file}`)
}

await browser.close()
