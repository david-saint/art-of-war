// Minimal Gemini REST client used by the asset generators.
// Key resolution order: env GEMINI_API_KEY, then ~/.zsh_secrets.
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  try {
    const txt = readFileSync(join(homedir(), '.zsh_secrets'), 'utf8')
    const m = txt.match(/GEMINI_API_KEY\s*=\s*["']?([A-Za-z0-9_\-.]+)["']?/)
    if (m) return m[1]
  } catch {}
  throw new Error('GEMINI_API_KEY not found in env or ~/.zsh_secrets')
}

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function generateContent(model, body, { retries = 4, timeoutMs = 300_000 } = {}) {
  const key = apiKey()
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(`${BASE}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      })
      const text = await res.text()
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)
        const err = new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`)
        err.fatal = true
        throw err
      }
      return JSON.parse(text)
    } catch (e) {
      lastErr = e
      if (e.fatal) throw e
      if (attempt === retries) break
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt))
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastErr
}

export function inlineParts(response) {
  const block = response?.promptFeedback?.blockReason
  if (block) {
    const err = new Error(`blocked: ${block}`)
    err.blocked = true
    throw err
  }
  const parts = response?.candidates?.[0]?.content?.parts ?? []
  return parts
    .filter((p) => p.inlineData)
    .map((p) => ({ mime: p.inlineData.mimeType, buffer: Buffer.from(p.inlineData.data, 'base64') }))
}

/** Run items through fn with a concurrency cap, preserving result order. */
export async function pool(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++
        out[idx] = await fn(items[idx], idx)
      }
    }),
  )
  return out
}
