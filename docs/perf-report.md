# Performance report — `perf/optimize` against `main`

Measured with `scripts/bench.mjs` on an Apple M2 (headless Chromium on ANGLE/Metal), 1600×900 viewport
at 2× device pixel ratio, production builds of both branches served from `next start`. Every figure below
is the harness's own output (`scripts/bench-compare.mjs`); nothing was typed in by hand. `main` here is
the version with the authored chapter beats and mounted decision nodes; the branch has that merged in.

## What changed

**Frame cost.** The ink dissolve — fifteen simplex-noise evaluations per fragment — ran full-frame on
every chapter and twice on the hero. `InkPlane` now fits its quad to the artwork's bounds and passes the
shader a `uRect` so its fields are computed in the same frame-space coordinates as before: identical
pixels, ~6% of the fragments. MSAA is off because nothing in the project has a geometric edge in frame
(every visible edge is texture alpha). The render loop stops in Codex Mode, behind the gate once the hero
has drawn, and in hidden tabs.

**Chapter swaps.** drei's `useTexture` was replaced by a texture cache (`src/three/textures.ts`) that
decodes on a worker with `createImageBitmap` and uploads artwork through `texImage2D` into an
`ExternalTexture` — on Chrome's Metal backend, three's `texStorage2D` + `texSubImage2D` pair cannot take
the fast path into an sRGB texture from a bitmap and costs ~30ms per plate. The scene controller warms
the next chapter's textures during the current one and evicts all but the previous, current and next
scenes. Scene materials are `dispose={null}` so three keeps their compiled programs across swaps.

**The DOM.** With the chapter beats, seventy-eight `Beat` components and thirteen `DecisionNode`s each
read the whole quantised scroll snapshot and the whole decision snapshot, so every scroll start and stop,
direction change and hover over an option reconciled ninety-odd components. They now subscribe through
selectors that return a boolean about themselves; nodes outside the active chapter see a constant
snapshot; the HUD, ground sync, audio director and scene controller subscribe to the chapter index alone.
The thirteen per-node `requestAnimationFrame` arming loops are one loop that checks the chapter the reader
is in.

**Load.** The canvas mounts behind the opaque enter gate; the hero's plates are `<link rel="preload">`ed
from the server HTML; hovering "Enter with sound" prefetches the overture; generated assets are served
immutable for a year.

**Memory.** GPU textures no longer accumulate for the life of the session; decoded audio stems are capped
at four resident (a three-minute stereo bed is ~60MB of PCM).

## Caveats

- The per-frame numbers are for the `high` quality tier pinned, which the harness's virtual clock forces.
  In the field the frame watchdog would have demoted this machine at 2× DPR to `medium` or `low`;
  after the change it can stay on `high`.
- The visual diff compares both builds on the same virtual frame. Residual differences are single pixels
  at dry-brush edges from floating-point reordering in the fitted quad; no plate, glyph or type differs.
- "The DOM" rows measure main-thread time between frames that is neither the render loop nor a wait for
  an asynchronous decode: React commits, style, layout and paint. The scroll-through walks chapter 3 from
  5% to 70% a step per tick, short of the decision node's mark.

# Bench: baseline → after

GPU: ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version) · viewport 1600x900 @ 2× · network none

## Load and enter

| Metric | before → after |
|---|---|
| Canvas alive before Enter | false → true |
| Enter click → first drawn frame (ms) | 333.5 → 72.0 (-78% ✓) |
| Enter click → hero textures + shaders ready (ms) | 882.2 → 72.0 (-92% ✓) |
| Shader links after Enter | 16 → 4 (-75% ✓) |
| Shader compile/link blocking after Enter (ms) | 1.4 → 0.1 (-93% ✓) |
| Texture uploads after Enter | 57 → 0 (-100% ✓) |

## Per-frame cost at rest (median / p95, ms; main thread + GPU, fenced)

| Mark | Frame before | Frame after | Δ frame | Main thread before | after | Draws |
|---|---|---|---|---|---|---|
| hero | 55.7 / 57.0 | 15.9 / 16.8 | -71% (3.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 35 → 35 |
| ch1 | 38.1 / 40.0 | 15.0 / 16.3 | -61% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch2 | 38.5 / 40.1 | 15.0 / 16.0 | -61% (2.6×) | 0.2 / 0.5 | 0.2 / 0.3 | 32 → 32 |
| ch3 | 37.9 / 39.3 | 15.1 / 15.9 | -60% (2.5×) | 0.2 / 0.4 | 0.2 / 0.3 | 32 → 32 |
| ch4 | 77.7 / 92.7 | 15.0 / 16.2 | -81% (5.2×) | 0.6 / 1.3 | 0.2 / 0.3 | 32 → 32 |
| ch5 | 73.6 / 90.7 | 15.1 / 16.4 | -79% (4.9×) | 0.5 / 1.2 | 0.2 / 0.3 | 32 → 32 |
| ch6 | 79.4 / 104.5 | 16.7 / 17.7 | -79% (4.8×) | 1.0 / 1.7 | 0.2 / 0.4 | 43 → 43 |
| ch7 | 74.9 / 95.5 | 15.3 / 16.9 | -80% (4.9×) | 0.7 / 1.7 | 0.2 / 0.4 | 32 → 32 |
| ch8 | 73.9 / 92.0 | 15.5 / 17.4 | -79% (4.8×) | 0.6 / 1.4 | 0.2 / 0.9 | 32 → 32 |
| ch9 | 77.8 / 98.8 | 15.1 / 16.6 | -81% (5.2×) | 0.6 / 1.2 | 0.2 / 0.4 | 32 → 32 |
| ch10 | 70.6 / 89.1 | 15.1 / 16.1 | -79% (4.7×) | 0.5 / 1.2 | 0.2 / 0.3 | 32 → 32 |
| ch11 | 42.7 / 46.9 | 15.5 / 16.4 | -64% (2.8×) | 0.5 / 1.0 | 0.2 / 0.6 | 32 → 32 |
| ch12 | 42.5 / 45.1 | 15.7 / 17.2 | -63% (2.7×) | 0.7 / 1.6 | 0.3 / 0.5 | 36 → 36 |
| ch13 | 40.8 / 43.1 | 15.4 / 16.7 | -62% (2.6×) | 0.5 / 1.0 | 0.2 / 0.4 | 32 → 32 |
| codex | 42.2 / 45.4 | 0.7 / 1.1 | -98% (60.3×) | 0.7 / 1.0 | 0.4 / 0.6 | 32 → 0 |
| story | 40.9 / 42.6 | 15.1 / 16.0 | -63% (2.7×) | 0.7 / 1.1 | 0.2 / 0.4 | 32 → 32 |

Average chapter frame: 59.1 → 15.3 (-74% ✓) → 17 → 65 fps attainable · main thread: 0.5 → 0.2 (-61% ✓)

## The DOM: main thread outside the render loop (React, style, layout, paint)

| Where | before → after |
|---|---|
| Scrolling through a chapter, per tick (median / p95, ms) | 0.6 / 1.3 → 0.4 / 0.7 |
| Scrolling through a chapter, total over 240 ticks (ms) | 165 → 110 (-33% ✓) |
| Scrolling through a chapter, worst tick (ms) | 4.9 → 4.7 (-4% ✓) |
| Scrolling through a chapter, worst frame interval (ms) | 102.6 → 23.8 (-77% ✓) |
| Scrolling through a chapter, render cost per tick (ms) | 44.0 → 15.1 (-66% ✓) |
| Scrolling through a chapter, style recalc (ms, count) | 11 (121×) → 10 (244×) |
| Scrolling through a chapter, layout (ms, count) | 5 (103×) → 5 (242×) |
| Scrolling through a chapter, script (ms) | 13646 → 3736 (-73% ✓) |
| Arriving at each chapter, total across thirteen (ms) | 808 → 492 (-39% ✓) |
| Arriving at a chapter, worst tick (ms) | 28.5 → 9.3 (-67% ✓) |
| At rest in a chapter, per tick (median, ms) | 0.24 → 0.11 (-55% ✓) |

## Chapter transitions (the swap into each mark)

| Mark | Longest main-thread frame before → after (ms) | Shader links | Compile block (ms) | Uploads (MB) | Upload time (ms) | Async load wait (ms) |
|---|---|---|---|---|---|---|
| hero | 229.5 → 30.0 (-87% ✓) | 16 → 16 | 1.0 → 0.9 (-10% ✓) | 264.4 → 227.5 | 204.4 → 8.9 (-96% ✓) | 31 → 317 |
| ch1 | 89.9 → 3.1 (-97% ✓) | 4 → 0 | 0.5 → 0.0 (-100% ✓) | 29.2 → 25.2 | 80.6 → 7.2 (-91% ✓) | 11 → 56 |
| ch2 | 87.4 → 0.6 (-99% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 25.2 | 77.7 → 6.7 (-91% ✓) | 10 → 65 |
| ch3 | 93.6 → 2.1 (-98% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 25.2 | 84.7 → 8.1 (-90% ✓) | 10 → 102 |
| ch4 | 102.3 → 3.6 (-96% ✓) | 4 → 0 | 0.1 → 0.0 (-100% ✓) | 29.2 → 25.2 | 90.8 → 4.8 (-95% ✓) | 25 → 63 |
| ch5 | 140.9 → 1.7 (-99% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 21.0 | 128.9 → 4.2 (-97% ✓) | 18 → 46 |
| ch6 | 80.7 → 7.8 (-90% ✓) | 4 → 2 | 0.4 → 0.2 (-50% ✓) | 27.0 → 27.2 | 64.1 → 7.1 (-89% ✓) | 26 → 63 |
| ch7 | 165.9 → 1.8 (-99% ✓) | 4 → 0 | 0.7 → 0.0 (-100% ✓) | 29.2 → 25.2 | 122.7 → 5.4 (-96% ✓) | 41 → 45 |
| ch8 | 106.7 → 2.7 (-97% ✓) | 4 → 0 | 0.5 → 0.0 (-100% ✓) | 29.2 → 25.2 | 95.2 → 6.8 (-93% ✓) | 18 → 49 |
| ch9 | 110.0 → 0.7 (-99% ✓) | 4 → 0 | 0.4 → 0.0 (-100% ✓) | 29.2 → 25.2 | 98.4 → 7.8 (-92% ✓) | 20 → 56 |
| ch10 | 104.1 → 1.7 (-98% ✓) | 4 → 0 | 0.1 → 0.0 (-100% ✓) | 29.2 → 25.2 | 91.6 → 7.3 (-92% ✓) | 24 → 64 |
| ch11 | 145.4 → 2.0 (-99% ✓) | 4 → 0 | 0.4 → 0.0 (-100% ✓) | 29.2 → 50.3 | 132.4 → 12.8 (-90% ✓) | 16 → 169 |
| ch12 | 469.7 → 9.9 (-98% ✓) | 5 → 2 | 30.8 → 0.2 (-99% ✓) | 54.3 → 25.2 | 234.8 → 7.0 (-97% ✓) | 105 → 119 |
| ch13 | 125.3 → 0.8 (-99% ✓) | 4 → 0 | 0.4 → 0.0 (-100% ✓) | 29.2 → 0.0 | 111.6 → 0.0 (-100% ✓) | 50 → 0 |
| codex | 1.0 → 0.6 (-40% ✓) | 0 → 0 | 0.0 → 0.0 (0%) | 0.0 → 0.0 | 0.0 → 0.0 (0%) | 0 → 0 |
| story | 1.2 → 0.7 (-42% ✓) | 0 → 0 | 0.0 → 0.0 (0%) | 0.0 → 0.0 | 0.0 → 0.0 (0%) | 0 → 0 |

Across all thirteen chapters: shader links 53 → 4, compile blocking 35 → 0 ms, uploads in the swap window 403.0 → 325.7 MB taking 1414 → 85 ms of main thread, load waits 376 → 896 ms.

## Memory

| Metric | before → after |
|---|---|
| GPU texture bytes resident after ch13 (MB) | 665.3 → 281.6 (-58% ✓) |
| JS heap at end (MB) | 12.1 → 12.1 (0%) |
| GPU texture bytes at end (MB) | 665.3 → 281.6 (-58% ✓) |

## Network

| Kind | before | after |
|---|---|---|
| font | 42 requests, 2.73 MB | 42 requests, 2.73 MB |
| css | 3 requests, 0.08 MB | 3 requests, 0.08 MB |
| js | 15 requests, 0.44 MB | 15 requests, 0.44 MB |
| image | 47 requests, 7.18 MB | 48 requests, 7.18 MB |

## Visual diff (seeded visit, same virtual frame in both builds)

| Mark | Pixels changed (> 8/255) | Max channel Δ | Mean Δ |
|---|---|---|---|
| ch1 | 0.000% | 3 | 0.274 |
| ch10 | 0.002% | 12 | 0.647 |
| ch11 | 0.000% | 11 | 0.680 |
| ch12 | 0.000% | 3 | 0.068 |
| ch13 | 0.007% | 17 | 0.080 |
| ch2 | 0.000% | 7 | 0.493 |
| ch3 | 0.000% | 8 | 0.233 |
| ch4 | 0.000% | 5 | 0.521 |
| ch5 | 0.000% | 8 | 0.446 |
| ch6 | 0.000% | 2 | 0.253 |
| ch7 | 0.000% | 10 | 0.497 |
| ch8 | 0.000% | 5 | 0.508 |
| ch9 | 0.001% | 9 | 0.650 |
| codex | 0.000% | 2 | 0.178 |
| hero | 0.000% | 7 | 0.541 |

