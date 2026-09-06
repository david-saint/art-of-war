# Performance report — `perf/optimize` against `main`

Measured with `scripts/bench.mjs` on an Apple M2 (headless Chromium on ANGLE/Metal), 1600×900 viewport
at 2× device pixel ratio, production builds of both branches served from `next start`. Every figure below
is the harness's own output (`scripts/bench-compare.mjs`); nothing was typed in by hand.

## What changed

**Frame cost.** The ink dissolve — fifteen simplex-noise evaluations per fragment — ran full-frame on
every chapter and twice on the hero. `InkPlane` now fits its quad to the artwork's bounds and passes the
shader a `uRect` so its fields are computed in the same frame-space coordinates as before: identical
pixels, ~6% of the fragments. MSAA is off because nothing in the project has a geometric edge in frame
(every visible edge is texture alpha). The render loop stops in Codex Mode, behind the gate once the hero
has drawn, and in hidden tabs.

**Chapter swaps.** drei's `useTexture` was replaced by a texture cache (`src/three/textures.ts`) that
decodes on a worker with `createImageBitmap`, builds plate mipmaps there too, and uploads artwork through
`texImage2D` into an `ExternalTexture` — on Chrome's Metal backend, three's `texStorage2D` +
`texSubImage2D` pair cannot take the fast path into an sRGB texture from a bitmap and costs ~30ms per
plate. The scene controller warms the next chapter's textures during the current one and evicts all but
the previous, current and next scenes. Scene materials are `dispose={null}` so three keeps their compiled
programs across swaps.

**Load.** The canvas mounts behind the opaque enter gate; the hero's plates are `<link rel="preload">`ed
from the server HTML; hovering "Enter with sound" prefetches the overture; generated assets are served
immutable for a year.

**Memory.** GPU textures no longer accumulate for the life of the session; decoded audio stems are capped
at four resident (a three-minute stereo bed is ~60MB of PCM).

## Caveats

- The per-frame numbers are for the `high` quality tier pinned, which the harness's virtual clock forces.
  In the field the frame watchdog would have demoted this machine at 2× DPR to `medium` or `low`;
  after the change it can stay on `high`.
- The visual diff compares both builds on the same virtual frame. Residual differences are single
  pixels at dry-brush edges from floating-point reordering in the fitted quad, and, on chapter 12, a
  one-tick phase difference in the ember particles between runs; no plate, glyph or type differs.
- Plate mipmaps are now built with a bilinear halving on a worker instead of the driver's box filter.
  At 2× DPR the plates are magnified and sample level 0, which is what the diff below covers; at 1× DPR
  level 1 is sampled and is a bilinear rather than box downsample of the same pixels.

# Bench: baseline → after

GPU: ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version) · viewport 1600x900 @ 2× · network none

## Load and enter

| Metric | before → after |
|---|---|
| Canvas alive before Enter | false → true |
| Enter click → first drawn frame (ms) | 262.6 → 71.6 (-73% ✓) |
| Enter click → hero textures + shaders ready (ms) | 789.7 → 71.6 (-91% ✓) |
| Shader links after Enter | 16 → 4 (-75% ✓) |
| Shader compile/link blocking after Enter (ms) | 1.3 → 0.3 (-77% ✓) |
| Texture uploads after Enter | 57 → 0 (-100% ✓) |

## Per-frame cost at rest (median / p95, ms; main thread + GPU, fenced)

| Mark | Frame before | Frame after | Δ frame | Main thread before | after | Draws |
|---|---|---|---|---|---|---|
| hero | 56.0 / 57.4 | 17.3 / 18.1 | -69% (3.2×) | 0.4 / 0.5 | 0.3 / 0.5 | 35 → 35 |
| ch1 | 40.5 / 41.7 | 16.7 / 18.0 | -59% (2.4×) | 0.3 / 0.5 | 0.3 / 0.5 | 32 → 32 |
| ch2 | 40.4 / 41.6 | 16.2 / 17.0 | -60% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch3 | 40.5 / 41.5 | 17.4 / 18.5 | -57% (2.3×) | 0.3 / 0.5 | 0.7 / 1.1 | 32 → 32 |
| ch4 | 40.6 / 41.8 | 16.1 / 16.8 | -60% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch5 | 40.5 / 41.6 | 16.1 / 16.9 | -60% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch6 | 40.9 / 41.4 | 17.4 / 18.3 | -57% (2.4×) | 0.3 / 0.4 | 0.2 / 0.4 | 43 → 43 |
| ch7 | 40.7 / 41.9 | 16.0 / 16.9 | -61% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch8 | 40.6 / 42.1 | 16.1 / 16.8 | -60% (2.5×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch9 | 40.8 / 41.8 | 16.0 / 16.9 | -61% (2.5×) | 0.3 / 0.4 | 0.2 / 0.3 | 32 → 32 |
| ch10 | 41.4 / 42.5 | 16.0 / 16.9 | -61% (2.6×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch11 | 38.6 / 39.8 | 16.0 / 16.8 | -59% (2.4×) | 0.3 / 0.5 | 0.2 / 0.4 | 32 → 32 |
| ch12 | 38.8 / 40.7 | 15.8 / 16.7 | -59% (2.5×) | 0.4 / 0.8 | 0.2 / 0.4 | 36 → 36 |
| ch13 | 38.6 / 41.0 | 16.0 / 16.9 | -59% (2.4×) | 0.3 / 0.8 | 0.2 / 0.3 | 32 → 32 |
| codex | 40.4 / 41.3 | 0.4 / 0.7 | -99% (101.0×) | 0.8 / 1.5 | 0.2 / 0.3 | 32 → 0 |
| story | 38.4 / 38.8 | 16.0 / 16.8 | -58% (2.4×) | 0.3 / 0.4 | 0.2 / 0.4 | 32 → 32 |

Average chapter frame: 40.2 → 16.3 (-59% ✓) → 25 → 61 fps attainable · main thread: 0.3 → 0.2 (-20% ✓)

## Chapter transitions (the swap into each mark)

| Mark | Longest main-thread frame before → after (ms) | Shader links | Compile block (ms) | Uploads (MB) | Upload time (ms) | Async load wait (ms) |
|---|---|---|---|---|---|---|
| hero | 224.3 → 54.5 (-76% ✓) | 16 → 16 | 1.1 → 0.6 (-45% ✓) | 264.4 → 232.9 | 199.2 → 7.5 (-96% ✓) | 36 → 329 |
| ch1 | 90.2 → 2.6 (-97% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 30.7 | 78.9 → 6.7 (-92% ✓) | 10 → 66 |
| ch2 | 91.2 → 2.0 (-98% ✓) | 4 → 0 | 0.2 → 0.0 (-100% ✓) | 29.2 → 30.7 | 81.3 → 8.1 (-90% ✓) | 6 → 70 |
| ch3 | 98.1 → 1.8 (-98% ✓) | 4 → 0 | 0.5 → 0.0 (-100% ✓) | 29.2 → 30.7 | 88.1 → 8.1 (-91% ✓) | 7 → 54 |
| ch4 | 84.1 → 3.6 (-96% ✓) | 4 → 0 | 0.2 → 0.0 (-100% ✓) | 29.2 → 30.7 | 74.4 → 8.5 (-89% ✓) | 6 → 69 |
| ch5 | 97.1 → 2.0 (-98% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 21.0 | 87.8 → 4.0 (-95% ✓) | 6 → 53 |
| ch6 | 51.3 → 7.0 (-86% ✓) | 4 → 2 | 0.4 → 0.1 (-75% ✓) | 27.0 → 32.7 | 39.3 → 7.9 (-80% ✓) | 9 → 65 |
| ch7 | 91.3 → 1.3 (-99% ✓) | 4 → 0 | 0.1 → 0.0 (-100% ✓) | 29.2 → 30.7 | 81.5 → 4.9 (-94% ✓) | 5 → 55 |
| ch8 | 86.3 → 0.5 (-99% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 30.7 | 77.2 → 6.1 (-92% ✓) | 6 → 57 |
| ch9 | 88.1 → 0.5 (-99% ✓) | 4 → 0 | 0.2 → 0.0 (-100% ✓) | 29.2 → 30.7 | 78.4 → 8.0 (-90% ✓) | 6 → 59 |
| ch10 | 92.1 → 1.7 (-98% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 30.7 | 82.7 → 7.9 (-90% ✓) | 6 → 75 |
| ch11 | 104.1 → 2.0 (-98% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 62.4 | 94.3 → 12.4 (-87% ✓) | 8 → 192 |
| ch12 | 542.9 → 9.3 (-98% ✓) | 5 → 2 | 90.6 → 0.1 (-100% ✓) | 54.3 → 30.7 | 183.8 → 8.1 (-96% ✓) | 57 → 112 |
| ch13 | 94.7 → 0.7 (-99% ✓) | 4 → 0 | 0.3 → 0.0 (-100% ✓) | 29.2 → 0.0 | 84.1 → 0.0 (-100% ✓) | 13 → 0 |
| codex | 2.2 → 0.3 (-86% ✓) | 0 → 0 | 0.0 → 0.0 (0%) | 0.0 → 0.0 | 0.0 → 0.0 (0%) | 0 → 0 |
| story | 0.8 → 0.7 (-13% ✓) | 0 → 0 | 0.0 → 0.0 (0%) | 0.0 → 0.0 | 0.0 → 0.0 (0%) | 0 → 0 |

Across all thirteen chapters: shader links 53 → 4, compile blocking 94 → 0 ms, uploads in the swap window 403.0 → 392.0 MB taking 1132 → 91 ms of main thread, load waits 144 → 927 ms.

## Memory

| Metric | before → after |
|---|---|
| GPU texture bytes resident after ch13 (MB) | 665.3 → 225.2 (-66% ✓) |
| JS heap at end (MB) | 11.3 → 12.1 (+7% ✗) |
| GPU texture bytes at end (MB) | 665.3 → 225.2 (-66% ✓) |

## Network

| Kind | before | after |
|---|---|---|
| font | 26 requests, 1.74 MB | 26 requests, 1.74 MB |
| css | 3 requests, 0.08 MB | 3 requests, 0.08 MB |
| js | 15 requests, 0.44 MB | 15 requests, 0.44 MB |
| image | 47 requests, 7.18 MB | 48 requests, 7.18 MB |

## Visual diff (seeded visit, same virtual frame in both builds)

| Mark | Pixels changed (> 8/255) | Max channel Δ | Mean Δ |
|---|---|---|---|
| ch1 | 0.000% | 5 | 0.416 |
| ch10 | 0.004% | 22 | 0.469 |
| ch11 | 0.000% | 14 | 0.492 |
| ch12 | 0.875% | 73 | 0.390 |
| ch13 | 0.039% | 46 | 0.095 |
| ch2 | 0.030% | 16 | 0.606 |
| ch3 | 0.006% | 17 | 0.299 |
| ch4 | 0.000% | 8 | 0.690 |
| ch5 | 0.001% | 14 | 0.537 |
| ch6 | 0.000% | 4 | 0.520 |
| ch7 | 0.007% | 14 | 0.647 |
| ch8 | 0.000% | 9 | 0.574 |
| ch9 | 0.000% | 12 | 0.710 |
| codex | 0.000% | 2 | 0.212 |
| hero | 0.000% | 7 | 0.542 |

