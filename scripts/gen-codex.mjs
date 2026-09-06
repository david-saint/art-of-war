#!/usr/bin/env node
// Generates src/data/codex.ts as a LITERAL record.
//
// Codex Mode shows all thirteen chapters at once, so its data has to be
// statically available on the client. Deriving it at module scope from the
// chapter modules — `import { chapter as ch01 } …` then map — reads cleanly and
// is the wrong thing: the bundler then pulls all thirteen modules into the
// client chunk, and each one carries a nine-hundred-word vignette that Codex
// never renders. That is roughly 150KB of prose shipped to show three bullets.
//
// So the three fields Codex actually needs are extracted at build time and
// written out flat. Re-run this whenever a chapter's codex entry changes:
//   node scripts/gen-codex.mjs
import { writeFile } from 'node:fs/promises'

const entries = []
for (let n = 1; n <= 13; n++) {
  const id = String(n).padStart(2, '0')
  const { chapter } = await import(`../src/data/chapters/ch${id}.ts`)
  entries.push([n, { dictum: chapter.dictum, bullets: chapter.codex.bullets, apply: chapter.codex.apply }])
}

const body = entries
  .map(([n, e]) => `  ${n}: {
    dictum: ${JSON.stringify(e.dictum)},
    bullets: [
${e.bullets.map((b) => `      ${JSON.stringify(b)},`).join('\n')}
    ],
    apply: ${JSON.stringify(e.apply)},
  },`)
  .join('\n')

const out = `export type CodexEntry = {
  dictum: string
  bullets: string[]
  /** One line on using it, which is NOT allowed to be consultant pablum. */
  apply: string
}

/**
 * The fast-reference layer.
 *
 * GENERATED — do not edit by hand. Run \`node scripts/gen-codex.mjs\` after
 * changing a chapter's codex entry in src/data/chapters/chNN.ts.
 *
 * This is written out flat rather than derived from the chapter modules on
 * purpose. Codex Mode is a client component, so importing the modules here
 * would pull all thirteen — and their nine-hundred-word vignettes — into the
 * client bundle to render three bullets each.
 */
export const CHAPTER_CODEX: Record<number, CodexEntry> = {
${body}
}
`

await writeFile('src/data/codex.ts', out)
console.log(`codex.ts written: ${entries.length} chapters, ${(out.length / 1024).toFixed(1)} KB`)
