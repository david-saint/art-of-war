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

## Performance

The render layer is built so that the reader never waits and the frame never stalls. The rules, and
the tools that keep them honest:

- **The dissolve only runs where ink can land.** `InkPlane` fits its quad to the artwork's bounds and
  tells the shader which patch of the frame it is drawing, so the fifteen-noise-lookup fragment program
  runs on ~6% of the frame instead of all of it, with identical output.
- **Nothing is compiled or uploaded on the frame the reader is looking at.** The canvas mounts behind
  the opaque enter gate, so code, shaders and the hero's plates are resident before the click; the next
  chapter's textures are decoded (on a worker, via `createImageBitmap`), mip-chained and uploaded while the
  reader is still in this one; scene materials are `dispose={null}` so three keeps their programs.
- **Memory has a lifetime.** `src/three/textures.ts` keeps the previous, current and next scene's
  textures and releases everything else; decoded audio stems are capped at four resident.
- **Nothing draws for nobody.** The loop stops in Codex Mode, behind the gate once warm, and in a
  hidden tab. There is no MSAA: every visible edge here is texture alpha, which MSAA never touched.

Measure before believing any of it:

```bash
npm run build
npm run bench baseline            # → .bench/baseline.json + screenshots
npm run bench after
npm run bench:compare .bench/baseline.json .bench/after.json --md .bench/report.md
```

`scripts/bench.mjs` drives the production build through the gate, all thirteen chapters and Codex Mode
under a virtual clock, fences every frame with a readback so main-thread and GPU cost are real, and lands
on the same virtual frame in every run so `bench-compare` can pixel-diff two builds. To compare against
another branch, serve it from a git worktree and point the harness at it with `BENCH_URL`. The last
comparison is in [`docs/perf-report.md`](docs/perf-report.md).

## Layout

```
src/lib/scroll.ts        the scroll engine — the two-tier split everything depends on
src/lib/audio.ts         Web Audio: gapless beds, ducked narration, synthesised impacts
src/lib/decision.ts      the decision-node state machine
src/three/              the render layer — stage, camera rig, scene controller, materials
src/three/textures.ts    the texture cache — decode off-thread, upload early, evict on schedule
src/three/assets.ts      what every scene draws, so the next one can be warmed and the last one dropped
src/shaders/            four custom GLSL programs
src/data/chapters/      thirteen typed chapter modules, from the verified canon
docs/_research/         the source research the bible was written from
scripts/                asset generation, the screenshot harness and the benchmark
```

## Two rules the code is built around

**Continuous scroll values never enter React state.** `src/lib/scroll.ts` keeps a mutable snapshot read
directly inside `useFrame`, and exposes a separate `useSyncExternalStore` subscription that only fires on
*quantised* changes. Wiring scroll to `useState` is the standard way these builds end up at 20fps.

**Ink density only ever increases.** Nothing on the page lightens. It is why a decision is a decision,
and it is enforced in the shader (`monotonic` on `InkPlane`) rather than by convention.
