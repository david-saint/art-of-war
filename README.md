# 兵法 · The Art of War

A cinematic WebGL scrollytelling reading of Sun Tzu's *Bingfa* — thirteen chapters, no battles.

**Design bible:** the full art direction, chapter scripts and technical specification are published as
[The Unfought Battle](https://claude.ai/code/artifact/675c6646-7a4f-4635-aed7-d4ac1ee97b3e).
The source research it was written from lives in [`docs/_research/`](docs/_research/) — five
adversarially-verified canon packets covering all thirteen chapters, three full scene scripts, and the
audio, UX, shot-grammar and technical direction documents.

**One canonical bible:** [`docs/_research/manifesto.md`](docs/_research/manifesto.md). Everything else in
that directory is answerable to it. Superseded drafts live in `_superseded/` and are not authoritative.

**Read the freeze list before implementing.** Two adversarial critics went over the whole corpus and found
21 blocker-level contradictions *between* documents — two incompatible films for Chapter 12, two lighting
models for Chapter 6, three chapters each claiming the same "first", and three different scroll-lock
contracts. They are itemised in the bible under *Freeze pass*. The corpus is not implementation-ready
until they are resolved, and resolving them is an editorial pass, not a build task.

## Running it

```bash
npm install
npm run dev
```

Assets are generated, not committed as sources. To reproduce them you need `GEMINI_API_KEY` in the
environment or in `~/.zsh_secrets`, plus `ffmpeg` and `cwebp` on the PATH:

```bash
npm run assets:images     # 57 plates — parallax, silhouettes, ink library, calligraphy, key frames
npm run assets:audio      # 23 stems — music beds, ambience textures, narration
node scripts/optimize-assets.mjs   # 2K masters → web webp
npm run assets:codex      # regenerates src/data/codex.ts from the chapter modules
```

Every generator is idempotent: an asset that already exists is skipped, so a failed run is safe to repeat.

## Looking at it

`scripts/shot.mjs` drives a headless browser to named scroll marks and writes PNGs, so a visual change
can be reviewed without hand-driving a browser:

```bash
node scripts/shot.mjs hero ch1 ch6 ch12       # → .shots/
SHOT_AT=0.62 node scripts/shot.mjs ch6        # scroll depth within the chapter
SHOT_QUERY=field=1 node scripts/shot.mjs ch6  # raw simulation channels
```

Headless Chromium reports `prefers-reduced-motion: reduce`, which puts the site on its (correct, but
static) reduced-motion path. The harness overrides it; `SHOT_REDUCED=1` puts it back if you want to
check that path deliberately.

## Layout

```
src/lib/scroll.ts        the scroll engine — the two-tier split everything depends on
src/lib/audio.ts         Web Audio: gapless beds, ducked narration, synthesised impacts
src/lib/decision.ts      the decision-node state machine
src/three/              the render layer — stage, camera rig, scene controller, materials
src/shaders/            four custom GLSL programs
src/data/chapters/      thirteen typed chapter modules, from the verified canon
docs/_research/         the source research the bible was written from
scripts/                asset generation and the screenshot harness
```

## How a chapter reads

Each chapter is **six beats**, and the beat boundaries are measured from the DOM rather than
declared as fractions, so a longer vignette simply takes more scroll:

| Beat | Holds? | What it is |
|---|---|---|
| 0 | sticky | The dictum, plus the chapter's opening line in traditional characters |
| 1 | sticky | The reading — what the chapter argues, and where the popular reading is wrong |
| 2 | sticky | Two more key lines with pinyin, literal and modern renderings |
| 3 | **flows** | The historical vignette, 700–900 words. The letterbox retracts: you are reading, not watching |
| 4 | sticky | The Tactic Decision Node. Scroll locks until you commit; the verdict is illegal until the ink dries |
| 5 | sticky | What the chapter is for |

Verify any of it without hand-driving a browser:

```bash
node scripts/beatwalk.mjs 6     # screenshots every beat of a chapter → .shots/beats/
node scripts/nodetest.mjs       # drives a decision node end to end and asserts the lock
```

## Two rules the code is built around

**Continuous scroll values never enter React state.** `src/lib/scroll.ts` keeps a mutable snapshot read
directly inside `useFrame`, and exposes a separate `useSyncExternalStore` subscription that only fires on
*quantised* changes. Wiring scroll to `useState` is the standard way these builds end up at 20fps.

**Ink density only ever increases.** Nothing on the page lightens. It is why a decision is a decision,
and it is enforced in the shader (`monotonic` on `InkPlane`) rather than by convention.
