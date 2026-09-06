# CHAPTER 1 · 始計 — SCENE SCRIPT

**Shǐ Jì · "THE COUNT" · Act I (計) · beats 1.0 – 1.8 · 900 vh**
**Ink budget: opens 0.020 · closes 0.031 (A) or 0.058 (B) · act ceiling 0.060**

Subordinate to `docs/_research/manifesto.md` (v1.0) and `docs/_research/canon-01-03.md`. Where this document disagrees with the manifesto, the manifesto wins. Technical figures are written against `direction-tech.md` §5–§8, `direction-audio.md` §3–§8 and `direction-ux.md` §1–§3, and do not relitigate them.

**Three open questions from the canon packet are closed here.** (1) Display edition for Act I is the 十一家注孫子 lineage; Yinqueshan variants appear in Codex only, never in the cinema frame. (2) The Yinqueshan citation is spoken in Chapter 1, at beat 1.2, once, and never again. (3) The Chengpu day-signs (戊辰 / 己巳) are **held** — not shown on screen until verified against a critical edition; the year 632 BC is secure and is shown.

**One deliberate departure from `direction-ux.md` §3, argued from the bible.** The node machine's `presented` row specifies one cut into node framing "caused by the reader arriving." In Chapter 1 that cut is **suppressed**: the camera holds and only the aperture tightens. Arriving is scroll, and the manifesto is explicit that cuts fire on reader action and never on scroll. Chapter 1 is where the reader learns the grammar, so the first cut of their life must be one they unambiguously performed — the commit. The machine's `presented` cut resumes from Chapter 2 onward, once that association is set. (`direction-ux.md` grants this: *"where this document conflicts with the bible, the bible wins."*)

---

## 1 · CHAPTER THESIS

> **The battle does not decide the war; it audits a count you already made, and it charges for the errors.**

**Directorial angle — what the scene is about emotionally.** This is not an establishing chapter and it is not a tutorial. It is the moment a reader who came for armies is handed a sheet of paper and a lamp and made to understand that they have arrived nine hours before anything they wanted to see. The feeling to engineer is *impatience curdling into unease*: the reader wants the battle, the chapter refuses, and somewhere around beat 1.3 they stop waiting for it because they have started watching two wet marks travel at different speeds and realised that this — a rate difference on damp paper — is the thing that decides it.

Chapter 1 therefore has one emotional job and one pedagogical job, and they are the same job. **It teaches the reader to weigh, by making weighing the only thing on screen, and it teaches the Ink Law by making every one of the five factors demonstrate a different clause of it.** By the end they should be able to look at a mark and infer the ground under it. Everything after this chapter assumes they can.

The chapter's threat is not defeat. It is innumeracy, and it is delivered without a single raised voice. Nobody dies in Chapter 1. Nobody is even armed. The most violent thing that happens is a stone pressed into cinnabar paste.

---

## 2 · THE ENVIRONMENT — THE COUNTING HALL

**The premise: the hall is not a place, it is the sheet seen from close enough to be architecture.** There is no room modelled beyond the reach of one lamp. If the camera could pull back — and it cannot, because 24mm has no jurisdiction in this chapter — it would find nothing.

### Scale and geometry

World scale is metres, 1 unit = 1 m, shared with every other chapter.

| Element | Real 3D? | Spec |
|---|---|---|
| **The sheet (宣紙)** | Yes — a displaced plane | 1.80 m × 0.90 m, 96 × 48 quads, lying at y = 0. Displacement from the 1024² tooth map at ±0.35 mm. Long axis on X. Fibre direction θ = **+6° from +X**, ±14° wander from a 2-octave FBM. This is the largest object in the chapter and it is 1.8 m across. |
| **The mat (筵)** | Yes | Woven rush, 2.60 × 1.40 m, y = −0.004. Its weave runs 90° to the paper fibre — the only place the reader sees a second direction, and it is there so the paper's anisotropy reads as a *choice*. |
| **Rammed-earth floor** | Yes, but 4 m² only | y = −0.05, vertex-AO baked, no texture beyond tooth noise. Falls off into fog by 1.6 m. |
| **Bronze standing lamp (豆)** | Yes, meshopt, ~1.4k tris | At (−1.35, 0.14, −0.30). Lit. Second, identical lamp at (+1.35, 0.14, −0.30), **unlit until beat 1.7**. |
| **Counting rods (籌)** | Yes — `InstancedMesh`, 96 instances | 12 cm × 4 mm bone/bamboo cylinders, 6-sided, 36 tris each. Laid, never thrown. |
| **Brush, inkstone, water dropper** | Yes, ~3k tris total | Stone at (+0.62, 0.01, −0.34). The brush is never held by a hand — hands are the one figurative element the chapter refuses. |
| **The world outside — two armies, a river, a season** | **No.** Ink on the sheet. | Chengpu exists only as strokes. There is no diorama, no terrain mesh, no painted backdrop. At 85mm with an 8° key, a wet stroke reads as a ridge; that is the entire trick and it is load-bearing. |
| **Backdrop** | Nothing | Beyond 1.6 m the fog term reaches 1.0. There is no horizon in Chapter 1. **The reader is not given a horizon until Chapter 9.** |

### Ink behaviour — 淡墨 only, and nothing dries

Every mark in this chapter is dilute and still moving. **M sits at 0.60–0.70 across the entire sheet for the whole chapter** — the fog of war rendered as the paper simply being damp everywhere. Nothing is committed, so nothing has a tide line until the reader makes one. `uSizing` is 0.0 across the sheet **except** for the fourteen feint patches in beat 1.4 (see §7).

Consequence for the shader author: the ink field's drying curve is **suspended** in Chapter 1 (`uDryRate = 0.0`) everywhere except inside a decision-node window, where it runs the full 4–12 s. Drying is a thing the reader causes. That is the chapter's second lesson and it is never stated in words.

### Lighting rig

| Light | Type | Position / direction | Colour | Intensity | Notes |
|---|---|---|---|---|---|
| **KEY — the lamp** | Point, inverse-square, no shadow map | (−1.35, 0.14, −0.30) → **8.0° elevation over the near sheet edge** | 2700 K, clamped into the paper ramp (`#F4F0E6` → `#DCD3BE`) | 1.0 | The grazing angle is the whole set. Every fibre casts a fibre-length shadow; the tooth becomes landscape. |
| **FILL** | Hemisphere, sky = paper `#E8E2D4`, ground = ink `#3E4A47` | — | — | 0.12 | Deliberately starved. Shadow side of a rod must go to `#3E4A47`, not to a lifted grey. |
| **RIM** | Directional, no shadow | From (+0.9, 0.30, +1.1) | 3100 K | 0.18 | Catches the *lip* of the seal impression in beat 1.7 and almost nothing else. It exists for one shot. |
| **VOLUMETRIC** | Exponential height fog, 6-tap | Confined to y ∈ [0, 0.30] | — | `fog = 1 − exp(−h(z)·(0.22 + 0.9·M))` | Because M ≈ 0.65 all chapter, the 30 cm above the mat is permanently slightly milky. The lamp's cone is visible in it. **No god-rays** (cut at engine level). |
| **CONTACT SHADOW** | 1× 1024 PCF, high tier only | Lamp | — | — | Rods and brush only. The paper does not cast; it *is* the receiver. |

**No gold on screen until the seventh comparison is answered in beat 1.2, and then exactly one hairline.** Accent coverage across the chapter never exceeds 3% of frame; the seal in beat 1.7 is capped at **2.1%** of frame area, which is the chapter's single largest accent event.

### Horizon and fog

There is none and it is deliberate. The fog closes at 1.6 m in every direction. The reader's world in Chapter 1 is 1.8 m wide, and the argument of the chapter is that this 1.8 m already contains the outcome.

---

## 3 · THE BEAT SHEET

**Frame coordinates** below are normalised inside the 2.39:1 letterboxed safe area: (0,0) top-left, (1,1) bottom-right. Optical centre is **(0.500, 0.435)**. Chinese sets in vertical RTL columns anchored right at x = 0.86; Latin translation sets on a horizontal baseline at y = 0.72. **The Historian never appears inside the frame** — his text sets on the lower mounting-silk bar, as a colophon (題跋) sets on the silk of a real scroll. That is not a workaround; it is the correct place for it.

| # | Beat | Scroll | vh | Lens | Move |
|---|---|---|---|---|---|
| 1.0 | THE EMPTY SHEET | 0.000–0.100 | 0–90 | 85mm | Held (4 mm breath) |
| 1.1 | 五事 — THE FIVE FIELDS | 0.100–0.320 | 90–288 | 85mm | Five arrested lateral tracks |
| 1.2 | 七計 — THE LEDGER | 0.320–0.450 | 288–405 | 85→40mm | Crane-and-widen (lens change on a move) |
| 1.3 | **THE DIFFUSION RACE** | 0.450–0.570 | 405–513 | 85mm | Pan-and-scan, right to left |
| 1.4 | 詭道 — THE FOURTEEN FEINTS | 0.570–0.665 | 513–599 | 85mm | Seven arrested micro-dollies |
| 1.5 | CHU'S FIRES | 0.665–0.720 | 599–648 | **180mm** | Locked. Listener does not move. |
| 1.6 | **THE NODE — THE NINETY LI** | 0.720–0.880 | 648–792 | 85mm → branch | Track → crane (A) *or* hard cut (B) |
| 1.7 | 廟算 — THE COUNT CLOSES | 0.880–0.960 | 792–864 | 40mm | Crane to 62° high-oblique |
| 1.8 | THREE DAYS OF GRAIN | 0.960–1.000 | 864–900 | 40mm | Held, then the transition hit |

**Chapter 1 uses three of the four focal lengths and never 24mm.** The widest thing in this chapter is a table. That is the point: scale is not yet a punishment, because nothing has been spent.

**Chapter 1 contains zero or one hard cuts, and which one is up to the reader.** With the `presented` cut suppressed (see head note), a reader who withdraws at the node **never experiences a single cut in this chapter, or in the site so far**. A reader who holds causes the first one, on the commit frame. The camera doctrine's rule — every hard cut is one the reader caused — is not merely honoured here, it is *taught*: the reader's introduction to the site's grammar is that choosing to fight is what makes the camera move without warning.

---

### BEAT 1.0 — THE EMPTY SHEET · 0.000–0.100

**CAMERA.** 85mm. Pos (0.000, 0.260, 1.050), target (0.000, 0.005, 0.100). **Held** — the only genuinely static shot in the chapter, with a 4 mm sinusoidal parallax breath at 0.09 Hz so it is not dead. Easing: none; the breath is `sin`.

**VISUAL.** The AVIF poster hands over to WebGL as a **match cut on ink** (§3 of the tech spec) — the poster is authored as the literal first frame, removed in the same rAF the renderer reports first-presented. `uD` mean = **0.0200**, the whitest the site will ever be. Lint drifts (see §7). The lamp's cone is visible in the 30 cm volumetric. Nothing else happens for roughly forty seconds of reading, and that is the design.

**TYPOGRAPHY.** Title card **始計** in 篆書, two glyphs, vertical, at (0.855, 0.16)–(0.855, 0.44), written in stroke order over 3.1 s — **not faded in, ever.** Below the frame on the silk: `SHǏ JÌ · THE COUNT · CHAPTER ONE OF THIRTEEN`. Then the opening line of the book, 楷書, vertical RTL, three columns from x = 0.86 to x = 0.70, entering as strokes over 6.4 s. Translation, editorial serif, baseline y = 0.720, x = 0.300, 22 words.

**AUDIO.** 4.0 s of **digital silence** after unlock (silence rule 1). Bed fades in from −∞ over 6 s: rammed earth, paper hiss, a 44 Hz standing-room mode, −34 dB. The Text block takes silence rule 2: bed to −∞ 180 ms before the first stroke, one guqin 泛音 at −26 dB, nothing until 600 ms after the last stroke. **THREAT is at −29.5 dB and is below the room floor — the reader will not hear the enemy in this chapter at all.**

**INTERACTION.** The audio offer, 「有聲」, one line of ink at (0.500, 0.880). Accepting it is the first gesture of the site. The bamboo-slip HUD writes its first slip.

---

### BEAT 1.1 — 五事 · THE FIVE FIELDS · 0.100–0.320

**CAMERA.** 85mm throughout. Five **arrested lateral tracks** — dolly along +X from x = −0.720 to x = +0.720 in five segments, y = 0.190, target 0.340 m ahead of the rig on the sheet plane. Each segment eases `power2.inOut` over 0.16 of chapter scroll and then *stops dead* for the last 22% of its segment while a character is written. The stop is the beat.

**VISUAL — the chapter's real teaching, one Ink Law clause per factor.** Each of the five is written in stroke order at 0.34 m glyph height and each demonstrates a different clause:

| 事 | Ink behaviour | Uniforms |
|---|---|---|
| **道** cohesion | Written **wet-into-wet**, 2.4 s, the slowest mark in the chapter. It blooms outward and keeps blooming after the stroke ends. Cohesion is the only factor that grows after you stop working on it. | `uMoistureLoad 0.88`, `uStrokeVel 0.10`, `uK∥ 0.16` |
| **天** heaven / season | Written **fast**, 0.6 s. The brush outruns its reserve and breaks: **the first 飛白 in the site.** Weather is a ragged mark. | `uStrokeVel 0.94`, `uReserve 1.0→0.07`, dropout against atlas G |
| **地** earth / ground | Brush held at **62°**, broad and low-moisture. It does not bleed at all — a hard, final edge on the first pass. Terrain is dry ink. | `uHoldAngle 62°`, `uMoistureLoad 0.21`, `uK∥ 0.10` |
| **將** the commander | Written normally, with one **0.18 s hesitation** at the seventh stroke that deposits a darker node. The only visible hesitation in the chapter, because the commander is the only factor that can hesitate. | `uPressure` step 0.44→0.79→0.44 |
| **法** method | Drawn **against a laid rule**: one machine-straight side, one brush side. Method is the only factor that touches a straight edge. | `uRuleEdge 1.0` on the −Z side of the stroke only |

Page density after the beat: **0.0231** (+0.0031).

**TYPOGRAPHY.** Each factor's canonical gloss enters as a single vertical column at x = 0.845 as the glyph finishes drying-that-isn't. The enumerating line 一曰道，二曰天… sets once at the top of the beat at (0.860, 0.110) and stays for the whole beat, greying by 6% as each factor is claimed. Translations, serif, y = 0.720, ≤ 24 words each.

**AUDIO.** Brush-on-paper granular foley, noise band 800 Hz → 7 kHz with stroke velocity. 飛白 on 天 is rendered as **amplitude dropout, never as filtering.** Guqin, 宮 on D, single notes at the head of each of the five segments only — five notes in 200 vh. No bed swell.

**INTERACTION.** None. This beat exists to be watched.

---

### BEAT 1.2 — 七計 · THE LEDGER · 0.320–0.450

**CAMERA.** **Lens change on a move, not a cut.** The rig cranes from (0.720, 0.190, 0.760) to (0.180, 0.520, 1.180) over 0.10 of scroll while `setFocalLength` ramps **85 → 40 mm** on the same eased curve. Because framing stays continuous, this is a move; the canon's "cuts to 40mm for the ledger" is honoured in meaning without spending a cut. Easing `power1.inOut`, 2.4 s equivalent at nominal scroll rate.

**VISUAL.** The Historian's hands are absent; the rods place themselves. 96 instanced 籌 laid in fourteen short columns — seven questions × two sides — over 9 s, each placement displacing **3–4 lint fibres** (the only coupling between the rigid-body layer and the particle layer in this chapter). **The camera never gets a clean top-down count.** There is no total, anywhere, ever. A score would let the reader believe the page is not the score.

The bamboo-slip HUD is brought into the frame's periphery for the only time in the site and the Historian explains it. `uD` mean **0.0249** (+0.0018 — apparatus is thin ink).

**TYPOGRAPHY.** The seven questions set as seven short vertical columns, 楷書, x from 0.870 to 0.640, top-aligned y = 0.150. As the seventh (賞罰孰明) completes, **one gold hairline** — 0.75 px at DPR 2, `#C9A227` — rules under the column set. It is the first non-ink pixel in the project. Historian's text on the silk.

**AUDIO.** Bamboo-slip clacks: 15–30 ms, tube resonance 380–900 Hz, pitch stepped by chapter index (index 1 = lowest), rate-limited to 22 Hz. Rod placements are the same family, 4 dB quieter, positional. Historian at +25° azimuth, 1.2 m, −19 LUFS short-term, 8% wet.

**INTERACTION.** The HUD becomes hoverable from here to the end of the site. **Scrubbing backward from this beat is the site's teaching moment for the two-clock model**: the marks are all still there, and the bamboo clacks play at −4 dB, low-passed 4 kHz. *Review is quieter than progress.* No words are spent explaining this.

---

### BEAT 1.3 — THE DIFFUSION RACE · 0.450–0.570 · **THE ONE IMAGE**

**CAMERA.** 85mm. **Pan-and-scan right to left**, x = +0.550 → −0.550 at y = 0.155, target locked 0.28 m ahead on the sheet, over the full beat. Constant velocity — `none` easing, deliberately, because the shot must not editorialise. The camera arrives at the left margin at scroll 0.548, **0.5 s before the leading stroke does**, so the reader is waiting at the finish line and does not know it.

**VISUAL.** The seven comparisons are already written as **fourteen pale strokes in two vertical columns** — Jin's answers rightmost (read first, per RTL), Chu's to their left. They are drawn identically: same brush, same D, same M, same length, same ink. **Nothing is announced.** Then they begin to wick.

The mechanism is a 512² R8 `uWickBoost` map giving a per-region K∥ multiplier: **Jin region 1.00, Chu region 0.61.** Over 4.0 s at K∥ = 0.14 UV/s, Jin travels 0.56 UV and reaches the left margin; Chu stops at 61% of the distance. Anisotropy is 6.4× along θ. FBM isocontour displacement active in the 0.02 < D < 0.28 band. **The answer to "who wins" arrives as a rate, not a number, and the reader must watch for four seconds to see it.** No highlight. No jade. No score.

Then — and this is why the beat matters twice — `uDryRate` briefly opens to 0.34 and **fourteen tide lines crystallise at the two stopping points.** The ratio stops being a duration and becomes permanent geometry. `uD` mean **0.0275** (+0.0026).

**TYPOGRAPHY.** No new type during the race. The fourteen strokes *are* the type — they are the seven 孰 questions' answers, set as 楷書 at 0.11 m and treated as landscape by the lens. The chapter's conclusion line 吾以此知勝負矣 sets at (0.855, 0.140) only **after** the last tide tick.

**AUDIO.** No music. **Physics only.** Two 1/f noise bands, one per column, panned to their screen positions: 2.4 kHz descending to 340 Hz, narrowing to Q 6, tracking each column's own bleed front — so the Jin band descends *more slowly* and the ear gets the ratio before the eye reads it. Fourteen tide ticks, 8 ms at 5.6 kHz, −24 dB, panned. They land in **two clusters, not fourteen events**, so the ear hears two answers.

**INTERACTION.** Deliberately none during the race, and the restraint is the point: the reader's hands are empty for the most important shot in the chapter. Scrubbing back replays the *field*, never the events (deposits are idempotent, keyed `(beat, strokeId)`); the tide lines do not stack.

**The mode switch is rendered for the first time at the close of this beat, after the last tide tick** — `direction-ux.md`'s landing rule ("you cannot be offered a second seat before you have sat in the first"), pinned to a precise frame. It never appears during the race. `幕 STORY / 案 CODEX` enters on the bottom silk at 0.940 opacity over 400 ms, and the reader who takes it immediately gets the 900 ms 平置 crane to orthographic with the ink **frozen at 0.0275** — Codex is a thing in a mind, and minds do not bleed.

---

### BEAT 1.4 — 詭道 · THE FOURTEEN FEINTS · 0.570–0.665

**CAMERA.** 85mm. **Seven arrested micro-dollies** of 0.14 m each along −Z (toward the sheet), each with a 0.9 s hold. Total travel 0.98 m; the camera ends closer to the paper than at any other point in the chapter, at 0.31 m. Easing `power3.out` on each push, `none` on the holds.

**VISUAL — the feint is a mark that cannot grow.** The fourteen operational lines are staged as seven pairs. Each pair is drawn with the same brush, at the same density. The *capability* half is drawn on ordinary damp paper and wicks normally. **The *display* half is drawn on a sized patch** — `uSizing` 0.82 under a 6 cm alum-treated region — so it takes a perfect, sharp, confident edge **and never spreads a micrometre.** It stays a shape. It never becomes a body.

This is the chapter's cleanest single idea, and it is the manifesto's invisible-sizing clause paying its first dividend: **sizing renders as nothing, and the reader learns what it is by watching ink refuse to go there.** They are being taught, in Chapter 1, the perceptual exercise that 軍形 will make the whole of Chapter 4 about.

`uD` mean **0.0286** (+0.0011 — half of these marks deposit almost nothing, which is the joke).

**TYPOGRAPHY.** 兵者，詭道也。 sets alone at optical centre-right, (0.780, 0.300), 楷書, 0.19 m glyph height, then holds while the fourteen set around it in a ring of short columns at 0.06 m. The four foundational feints (能而示之不能 / 用而示之不用 / 近而示之遠 / 遠而示之近) set at full weight; the remaining ten at 82% scale. Closing line 此兵家之勝，不可先傳也 on the last hold.

**AUDIO.** Brush foley only, and it changes audibly between the two halves of each pair: on sized ground the granular band is **narrower and shorter** — 1.1 kHz–4 kHz, 140 ms — because a stroke that cannot soak has nothing to say afterwards. Guqin absent for the whole beat. One tanggu at −20 dB under the closing line.

**INTERACTION.** None.

---

### BEAT 1.5 — CHU'S FIRES · 0.665–0.720

**CAMERA.** **180mm — the chapter's only use, and the site's first.** Locked: pos (0.000, 0.310, 1.300), target (−0.050, 0.020, −0.400). No move at all. The rig does not breathe here. The lens is reserved exclusively for the enemy and the reader must feel the room change.

**VISUAL.** At the far edge of the sheet, past the fog closure, a scatter of small warm marks: Chu's camp fires, rendered as **eleven pinpoints of `#C9A227` shadow-value gold at 0.4 px each, and nothing else** — under the accent cap by two orders of magnitude. Compressed by the long lens into a flat band. They do not flicker; they are ink on paper being lit, not fire. Depth of field: the near sheet goes to 4.1 px CoC, so the reader is looking *past* their own count at something they cannot reach.

`uD` mean **0.0290** (+0.0004).

**TYPOGRAPHY.** Nothing in the frame. This is the only beat in the chapter with no glyph on screen. The Historian speaks on the silk.

**AUDIO.** **The listener does not move.** Enemy sources frozen at 6.5× distance, collapsed toward mono at 18% width, low-passed 1.8 kHz with a −4 dB shelf above 800 Hz, **and given no reverb send from the reader's room.** You do not share acoustic space with the opposing force. What the reader actually hears is a distant, dry, wrong-sounding wind and nothing else — the mix's first genuinely uncomfortable moment.

**INTERACTION.** None. The 180mm is never interactive anywhere in the site.

---

### BEAT 1.6 — THE NODE · THE NINETY LI · 0.720–0.880

Full spec in §6. Summary row: 85mm, LOAD tightens the letterbox 2.39 → 2.76 over 700 ms, scroll locks, the Commander speaks for the only time in the chapter, and the branch determines whether the camera cranes or cuts.

---

### BEAT 1.7 — 廟算 · THE COUNT CLOSES · 0.880–0.960

**CAMERA.** 40mm. **Crane** from the branch's resting position to a 62° high-oblique: pos (0.060, 0.940, 0.620), target (0.000, 0.000, −0.060), over 0.05 of scroll, `power2.inOut`. The nearest the chapter comes to Codex's orthographic overhead — and it deliberately stops short, because the reader has not earned the map table yet.

**VISUAL.** The second bronze lamp lights (+1.35, 0.14, −0.30), and for eight seconds the sheet has two raking keys from opposite sides. **Every stroke in the chapter briefly casts shadows in two directions and the landscape read inverts and re-inverts.** It is the closest the chapter comes to a flourish and it is motivated: the count is being read back by a second party.

The rods are swept together — 96 instances animated to a single low pile over 1.6 s, 24 fps stepped — and then **the seal.** See §7 for the impression shader. Vermilion `#A82B23` with a `#C1352B` edge, beading proud at 2.5× viscosity, 0.4× bloom, **crossing three existing ink strokes and sitting on top of all three, unmixed.** Consequence never dissolves into the gloom.

`uD` unchanged — **vermilion is a separate medium and does not accumulate into D.** It counts against accent coverage only: 2.1% of frame.

**TYPOGRAPHY.** The chapter's conclusion, three columns, 楷書, x = 0.870 → 0.700, y = 0.130 → 0.780. The seal lands at (0.632, 0.688), overlapping the last column's tail by 14% of its area — seals certify, they do not garnish, and a seal that avoids the text is decoration.

**AUDIO.** The seal: five components, 340 ms, paste tack only on hover-hold, contact 22 ms broadband **at −3 dBTP — the loudest sample in the build** — pressure 60–140 ms, release peel at 1.5–3 kHz (*the lift is the part that says it is done*), and 1.1 s of rammed-earth tail with one guqin harmonic on 宮 at −26 dB. Then 400 ms of true silence. No transition hit within 1.2 s of the seal; the outgoing hit is scheduled for beat 1.8.

**INTERACTION.** Hover-hold on the seal plays the paste tack and nothing else. The seal is **not** a button here — it fires on scroll arrival, because the count closing is not the reader's decision; theirs was two beats ago.

---

### BEAT 1.8 — THREE DAYS OF GRAIN · 0.960–1.000

**CAMERA.** 40mm, held at the crane's end position. No move.

**VISUAL.** The second lamp goes out. Density holds. The sheet is the last thing on screen and it is 96.9% or 94.2% white depending on what the reader did.

**TYPOGRAPHY.** One Historian block on the silk. No Chinese. The chapter's last frame has no glyph in it.

**AUDIO.** Chapter transition hit: sine glide **46 → 31 Hz over 900 ms** settling at D1 (36.71 Hz) at t = 400 ms, 12 ms attack, 380 ms body, 2.6 s exponential decay, peak −6 dBFS. Tanggu mallet transient placed **8 ms ahead of the sub**. Sidechain: BED −12, TERRAIN −9, THREAT −9, NARRATION −9; UI/FOLEY never ducked.

---

## 4 · THE SCENE SCRIPT

> Voice key: **【經】** the Text — written, never spoken · **【史】** the Historian — the only human voice · **【將】** the Commander — no voice at all, ink and percussion only.

### 1.0 · TITLE AND OPENING

**【經】** 始計
*Shǐ Jì* — the initial reckoning.

**【經】** 兵者，國之大事，死生之地，存亡之道，不可不察也。
*Bīng zhě, guó zhī dà shì, sǐ shēng zhī dì, cún wáng zhī dào, bù kě bù chá yě.*
**War is the state's largest undertaking: the ground on which people live or die, the road on which a country continues or ends. You are not permitted to look away from it.**

**【史】** Six thousand characters. Thirteen chapters. Fewer words than a long magazine feature — and the first noun is 兵, which means the soldiers, and the weapons, and the war, and does not distinguish between them.

### 1.1 · THE FIVE FIELDS

**【經】** 故經之以五事…一曰道，二曰天，三曰地，四曰將，五曰法。
*Yī yuē dào, èr yuē tiān, sān yuē dì, sì yuē jiàng, wǔ yuē fǎ.*
**Weigh it by five things. First, cohesion. Second, season. Third, ground. Fourth, the commander. Fifth, method.**

**【經】** 道者，令民與上同意也，可與之死，可與之生，而不畏危。
**Cohesion is the people holding the same intent as the ruler — so that they will die with him, live with him, and not fear the danger.**

**【史】** Giles translated 道 as the Moral Law, and a century of readers have been reading a sermon into a measurement. The text defines the word on the spot, in one clause, and the definition is political, not ethical: will they go. It is a quantity. Count it or lose it.

**【經】** 天者，陰陽、寒暑、時制也。
**Season: light and shade, cold and heat, the constraint of time.**

**【經】** 地者，遠近、險易、廣狹、死生也。
**Ground: far and near, broken and open, wide and narrow, the ground that keeps men alive and the ground that does not.**

**【經】** 將者，智、信、仁、勇、嚴也。
**The commander: judgement, credibility, humanity, courage, severity.**

**【經】** 法者，曲制、官道、主用也。
**Method: the shape of the units, the chain of command, the administration of supply.**

**【史】** Note the order. The man is fourth. The paperwork is fifth, and it is the one the other four are carried in.

### 1.2 · THE SEVEN COMPARISONS

**【經】** 主孰有道？將孰有能？天地孰得？法令孰行？兵眾孰強？士卒孰練？賞罰孰明？
**Which ruler has cohesion? Which commander has ability? Which side has the season and the ground? Whose regulations are actually carried out? Whose army is stronger? Whose officers and men are better trained? Whose rewards and punishments are clear?**

**【經】** 吾以此知勝負矣。
**By these I know who wins and who loses.**

**【史】** 廟算 is not a metaphor. It is an operation, performed with 籌 — short lengths of bamboo or bone laid on a mat in the ancestral temple, one column per factor — and it produces a number. In April 1972, at Yinqueshan in Shandong, two Han tombs gave up a library written on bamboo strips of the same manufacture, the *Sunzi* among them, in fragments, roughly a third of the received text. That is why the ledger at your left is bamboo. It is not a decorative choice. It is the format the book was found in, and it is the only reason we can say the received thirteen chapters are a reconstruction rather than a rumour.

### 1.3 · THE RACE

*(No new text during the four seconds. This is the one place in the chapter where the Historian is silent while something important happens.)*

**【史】** He does not say who wins. He says the answers are knowable, and that a man who has them does not need the battle to tell him. The output of this chapter is a margin, not a plan.

### 1.4 · THE DECEPTION CATALOGUE

**【經】** 兵者，詭道也。
*Bīng zhě, guǐ dào yě.*
**Warfare is a practice of misrepresentation.**

**【經】** 故能而示之不能，用而示之不用，近而示之遠，遠而示之近。利而誘之，亂而取之，實而備之，強而避之，怒而撓之，卑而驕之，佚而勞之，親而離之。攻其無備，出其不意。
**Able — show inability. Active — show inactivity. Near — show far. Far — show near. Offer a profit and draw him. Take him where he is disordered. Where he is solid, prepare. Where he is strong, avoid. Anger him and wear him out. Appear low and make him proud. Rest, and make him toil. Where he is close, separate him. Attack where he is not ready; appear where he does not expect you.**

**【經】** 此兵家之勝，不可先傳也。
**This is the strategist's victory, and it cannot be settled in advance.**

**【史】** These fourteen lines are the most quoted passage in the book and the least understood position in it. Giles rendered 詭道 as "All warfare is based on deception," which promotes a method to a foundation. 道 here means *way* in the sense of *how you do a thing*. The list comes after the count, not instead of it, and its entire function is to spoil the enemy's arithmetic. It does nothing whatever for yours. A liar with a bad count is just a liar.

### 1.5 · CHU'S FIRES

**【史】** Chu is encamped roughly a day's march south, with its back to a mound. Seven hundred chariots on the Jin side; the Chu number is not recorded. Four horses to a chariot, three men aboard, and by the conventions of the period a file of foot attached — call it seventy to a hundred mouths fed for every vehicle. You cannot make out a single one of them from here. That is what this lens is for, and you will see it twelve more times.

### 1.7 · THE COUNT CLOSES

**【經】** 夫未戰而廟算勝者，得算多也；未戰而廟算不勝者，得算少也。多算勝，少算不勝，而況於無算乎！
**He who counts in the temple before the fighting and wins has obtained many rods. He who counts and does not win has obtained few. Many rods win; few rods do not win; and how much worse, no rods at all.**

**【史】** 算 is the count and it is also the rod: the language does not separate the arithmetic from the object you do it with. The sentence ends on 乎, a particle of contempt, and the contempt is not aimed at the man who counted badly. It is aimed at the man who never laid out the rods.

### 1.8 · CLOSE

**【史】** The Jin army stayed three days on the field and ate Chu's stores, and then went home. What that cost — the grain, the carts, the thousand pieces of gold a day — is the next chapter, and it is the one nobody quotes.

---

## 5 · THE HISTORICAL VIGNETTE — NINETY LI OF GIVEN GROUND

**Chengpu, in the fields of Wey. Fourth month, 632 BC.**
**Source: *Zuozhuan*, Lu, Duke Xi, years 23–28.**
**Record vs legend, in one line:** the *Zuozhuan* records the events — the promise, the ninety li, Xian Zhen's purchase of Qi and Qin with other men's farmland, King Cheng's order to disengage and Ziyu's refusal, the tiger skins, the two banners, the dragged brushwood, the three days of eating Chu's grain, and the suicide at Lian'gu — but it was compiled generations later and gives every actor a finished speech, so the **dialogue is the tradition's argument about the battle, not a transcript**; the site of Chengpu itself is disputed between candidates in modern Shandong and Henan.

---

Seven hundred chariots stand in column at first light and not one of them is moving forward.

Duke Wen of Jin walks the line while it is still cold enough to see his breath, and what he is looking at is straps. Breast-strap, trace, crupper, girth — the *Zuozhuan* bothers to name all four, which tells you what the compiler thought mattered. A chariot that throws a trace at the gallop kills the three men riding it and opens a gap that kills a hundred more. He has been in exile nineteen years learning what small things cost. In one of those years he asked a farmer at Wulu for food and was handed a clod of earth. He has been married among the Di, fed by states that wanted something from him, and turned out of states that did not. He knows the price of every friendship on this field to the copper.

He gives the order to withdraw.

Ninety li. Three marches — three 舍 — back from ground his own officers surveyed yesterday and liked. They protest, and the protest is arithmetic too, because shame is a quantity in an army: *our ruler is retreating from a subject.* Ziyu is a minister of Chu. A duke does not give ground to a minister, and every man in the column can count the li as they walk them backward.

Hu Yan answers for the Duke, and the answer has nothing to do with honour. *An army in the right is strong; an army in the wrong is old.* Twenty years earlier, at King Cheng's table in Chu, an exile with no state was asked what he would give in return for his keep, and he said: if our armies ever meet, I will withdraw three stages. He is not now paying a debt. He is buying, at the only moment the purchase is possible, the one factor on Sun Tzu's list that cannot be manufactured or requisitioned — 道, the thing that lets a man send farmers at a wall of bronze and have them go.

And the ninety li is a lever with two ends. Every li Jin gives up, Chu takes, and Chu takes it away from its own grain and away from its king. King Cheng has already pulled back to Shen and sent word that the campaign is finished — that Chong'er has had nineteen years of hardship, that heaven has given him the years, and that heaven's placement is not a thing a minister overturns. Ziyu reads the message and asks for battle anyway. The king, furious, sends him a fraction of what he asked for: the household companies, and the six companies of the Ruo'ao clan. So the general who is about to advance ninety li past his sovereign's written instruction does it in a temper, with a reduced army, against a coalition.

Because that is the other half of the count, and it was made in a tent months ago by a man who never touched a weapon that spring. Xian Zhen's plan: take the ruler of Cao, cut up the lands of Cao and Wey, hand them to Song. Then have Song go to Qi and to Qin with gifts and ask them to mediate with Chu. Chu will refuse, because Chu is fond of Cao and Wey. And two great states that have accepted a bribe and then been made to look foolish do not stay neutral. *Delight them with gifts, enrage them with obstinacy, and see whether there is not a battle.* Qi is on the field this morning. Qin is on the field this morning. Sun Tzu's seventh question — whose rewards and punishments are clear — was answered months ago by two kings who are not here.

The Jin army forms up north of Xin. Chu camps with its back to a mound.

Then the lying begins, and it is astonishingly cheap. On the Jin lower wing, Xu Chen has his chariot horses dressed in tiger skins and drives them straight at the Chen and Cai contingents holding the Chu right — allied levies, the least committed troops on the field, chosen for exactly that. Horses that have never smelled a tiger will not stand in front of one. Chen and Cai break. The Chu right dissolves before the main lines have touched.

On the other wing Hu Mao raises two great banners and pulls them back — the sign of a commander's standard leaving the field — while Luan Zhi's chariots drag cut brushwood through the dry ground behind him and run. It is a rout manufactured out of dead sticks and one afternoon of wind. Ziyu's left wing goes after it at the gallop, stretches itself thin, and Xian Zhen and Xi Zhen take it in the flank with the ducal companies of the centre while the Hu brothers close the other jaw.

Both Chu wings are gone. Ziyu holds his centre together and walks it off the field intact, which is the only reason the word for this is a defeat and not an annihilation.

The Jin army eats Chu's stores for three days and goes home. Duke Wen is hegemon before the year is out. Ziyu reaches Lian'gu, is asked what he intends to say to the fathers of Shen and Xi whose sons he has spent, and kills himself. When the news reaches Duke Wen he says the only unguardedly happy thing in the entire account, and it is five characters long: 莫余毒也已 — *now no one can poison me.*

Nobody in this story out-fought anybody. Two wings collapsed because of a tiger skin and a bundle of firewood, and the battle was over before either, decided in a tent by a man dividing other people's farmland.

### How it is staged

**Beats occupied: 1.3 (the count), 1.5 (Chu's fires), 1.6 (the node), 1.6-READ (the verdict).** The vignette is not a separate sequence; it is the content of the chapter's spine, and the reader is told the story only in fragments the Historian releases as the ink demonstrates them.

**Depiction: ink on the sheet. No diorama, no silhouette theatre, no map.** Armies are strokes. Chengpu is fourteen marks in two columns at beat 1.3 — those marks *are* Jin's and Chu's answers to the seven questions, and Xian Zhen's tent is not shown because the tent is the sheet. The ninety li is a single stroke retracing its own path at beat 1.6.

**The one figurative concession, and it is a physics pun.** The tiger skin and the dragged brushwood are the only two events depicted as themselves — and both are rendered as **飛白**, dry-brush drag, because a bundle of brushwood dragged through dust *is literally what a feibai stroke looks like*. The trick that won Chengpu and the ink behaviour that describes exhaustion are the same mark. The Historian never points this out.

**Scoring.** Guqin alone, 宮 on D, and nothing else pitched — **guzheng is banned in Act I, erhu is rationed to three appearances site-wide and none is here, suona appears twice in the site and neither is here.** Chapter 1's entire pitched palette is guqin plus one bianzhong at the node's restraint outcome. Everything else is foley, physics noise and room. The vignette's most dramatic moment — both wings collapsing — is scored with the bleed noise band and fourteen tide ticks, and no instrument at all.

---

## 6 · THE TACTIC DECISION NODE — "THE NINETY LI"

**Beat 1.6 · scroll 0.720–0.880 · phases LOAD → MARK → BLOOM → DRY → READ**

### LOAD · 0 – 1.6 s

**Scroll ends rather than locking.** `NodeSection` renders `height: calc(var(--beats) * 100svh)` with `--beats = 1` while unresolved; there is nothing below to scroll to, so momentum, rubber-band, scroll restoration, keyboard paging and screen readers all behave normally. No `preventDefault` on touch, no `position:fixed` on `<body>`. `scroll.locked = true` is published for the render loop only; the `<fieldset>` is focus-trapped. Height grows to `--beats = 3` after commit, deferred until `scroll.atRest`, and it grows *below* the reader so nothing shifts.

The letterbox tightens **2.39:1 → 2.76:1 over 700 ms**, GSAP `--ease-silk`, on the DOM element — the mounting silk closes on the choice, and **the bars physically grow**, which is the reader's first warning that a decision is closing. Each blocked scroll attempt past the section end is read as pressure and tightens the aperture a further 0.02 (cap 2.82); after two, one line of Commander: *"Nothing moves until you do."*

All stems duck 6 dB over 700 ms; **stereo width closes 100% → 46%**; bed low shelf +2 dB below 90 Hz; one tanggu at −14 dB; then 900 ms of bristle-in-water, positional, at the reader's own head position. Camera **holds** 85mm at (0.000, 0.205, 0.880) — no cut, per the head note — and tracks a 3.5° arc with ±0.04 m of dolly for as long as the reader deliberates. **The camera tracks while you think.** The HUD goes `data-hud="quiet"` and retracts physically: the cord rolls to an 8 px bamboo edge, the title block slides behind the top bar. It does not fade; nothing in this world fades.

**【將】 Situation copy** — tracked small-caps in jade `#5C9A86`, with the operative term in 行草:

> Ziyu is coming, and he is angry. You promised this ground away twenty years ago at another man's table, and your officers can count the li. **退避三舍** — give it, or hold it.

**OPTION A** · 退避三舍 — **YIELD NINETY LI.** Fall back three marches. Concede the surveyed ground; keep the count.
**OPTION B** · 據 — **HOLD.** Refuse the gesture. Make him come to the slope you chose, today, with seven hundred chariots dressed and waiting.

Header `擇 · CHOOSE`, state line *"You have spent nothing yet."*

**Hover parity is mandatory, and Chapter 1 is where it is hardest — solve it here or it is wrong twelve more times.** Audio parity is easy: A = a paigu head touched with the palm at centre, 110 Hz damped, 180 ms; B = **the same drum, the same hand, touched at the rim**, ≈240 Hz, 140 ms. Both at −20 dB.

Visual parity is the trap. The machine specifies hover-preview as 淡墨 at ~0.35 of final D into a preview buffer never accumulated into D — **but Option A's final D is zero**, so a literal implementation makes withdrawal preview as *nothing* and hold preview as a bold dark mark, and the node silently recommends fighting. **Ruling: parity is on preview *area*, not on density.** Option A previews its **three tide lines** at 0.35 alpha in the preview buffer, over the same footprint of frame that Option B's deposit occupies. Equal area, equal audio level, equal type weight, nothing brighter for either. The reader must not be able to tell from the preview which branch spends ink; they have to reason about it. That is the whole chapter.

### COMMIT

Seal press, 340 ms, `start(ctx.currentTime + 0.005)` synchronously in the `pointerup` handler. Then **400 ms of true silence.** The Commander does not speak after the choice; **the seal is its "yes."** Commander line on commit: *"The mark is yours. It does not lift."*

**Where the one cut lands, and why not a frame later.** `direction-ux.md` requires that the camera "tracks, never cuts" through `simulating` (MARK → BLOOM). Chapter 1's canon requires Option B to be a hard cut. Both are satisfied by placing the cut **on the commit frame itself** — the `pointerup`, before MARK opens — after which the camera tracks unbroken through BLOOM, DRY and READ. The cut is the reader's finger, not the simulation.

### MARK → BLOOM → DRY

| Phase | Window | Branch A — WITHDRAW | Branch B — HOLD |
|---|---|---|---|
| **MARK** | 0 – 0.4 s | No new deposit. `uDeposits[0].amount = 0.0`. | Deposit at the ridge line, `uDeposits[0].amount = 0.14`, 濃墨, in one frame. |
| **CAMERA** | 0 – 2.8 s | **Crane back on rails**, dolly −0.55 m along +Z, 85mm held, `power2.inOut`. **No cut, in this chapter or anywhere before it.** | **Hard cut on the commit frame** — the chapter's only one, and the reader's finger caused it. New setup, 85mm, (0.240, 0.140, 0.560) → target (−0.120, 0.010, −0.180). Thereafter the camera tracks unbroken. |
| **BLOOM** | 0.4 – 4.0 s | Your own mark **retreats along its own stroke** — the only reverse motion in the chapter — at K∥ 0.16. Chu's mark follows and lengthens ninety li, thinning as it goes: you have traded your ink for his. | Bloom at K∥ 0.16 around the deposit; the front reaches 0.09 UV and stops against the ridge's dry ground. The 180mm plate does not change. The enemy does not move, because he does not have to. |
| **DRY** | 4.0 – 11.5 s | **Three tide lines** crystallise where your camps stood: bright, hard-edged, permanent — the first 水痕 the reader ever sees, and they mark ground *given*, not taken. Stroke head thins to 淡墨. The two allied strokes at the frame edge, Qi and Qin, turn **gold** `#C9A227`: unratified intention becomes order. | One tide line, at the ridge. Qi and Qin stay **淡墨, and are never gilded** — and at the moment of contact they are simply not in the frame. You fight with three fifths of the army the ledger promised. |
| **Density after** | | **0.0310** | **0.0580** — the act's ceiling, reached in Chapter 1, before anyone drew a weapon. |
| **Outcome audio** | | **RESTRAINT:** one bianzhong 正鼓, **6–9 s of protected decay**; the duck does not release until the tail passes −48 dB. Nothing in the mix may move while it rings. No reward tone. The reader must wait out the bell. | **EXPENDITURE:** tanggu + sub hit, and **the THREAT stem is raised +1.5 dB permanently for the rest of the session and never lowered.** A heavy reader arrives at Chapter 13 in a mix they made. |

**Neither branch reconverges, and the divergence outlives the chapter.** Branch A leaves three tide lines, two gold hairlines and a thinned stroke head. Branch B leaves a 0.14 local deposit, a hard cut in the reader's camera history, and **two pale strokes at the frame edge that stay 淡墨 for the remaining twelve chapters** and appear, still ungilded, on the returned scroll at the ending. That is a permanent, visible, twelve-chapter consequence purchased in the first ten minutes.

### READ — legal only at M ≤ 0.03, and not before the last tide tick

Letterbox opens 2.76 → 2.39 over 900 ms. Scroll unlocks on the Historian's first word; focus moves to the analysis region.

**【史】 Shared verdict.** Sun Tzu, this chapter: 卑而驕之，佚而勞之，親而離之 — appear low to make him proud; rest, and make him toil; be close, and separate him. The ninety li is all three at once, and it is paid for in pride, which does not appear on the ledger. **Both options were taken at Chengpu, by the two men facing each other across it.**

**【史】 If A.** You did what Chong'er did. He withdrew ninety li in the fourth month of 632, and the *Zuozhuan* gives his uncle Hu Yan the reason, which is not honour: *an army in the right is strong; an army in the wrong is old.* The withdrawal bought three things, not one. It kept a promise made in exile, and so kept 道. It drew Cheng Dechen three marches from his grain and past his king's explicit order to disengage. And it put Qi and Qin on the field, which Xian Zhen had already paid for, months earlier, with Cao and Wey's farmland. Your page is at **0.031**. You have half the act's allowance left and twelve chapters to spend it in.

**【史】 If B.** You did what Cheng Dechen did. He had the better ground and a written order from his king to break off. He demanded battle instead, was sent a fraction of the troops he asked for — the household companies and the six of the Ruo'ao — and advanced with them anyway. Both his wings were gone before the centres met: the right to horses dressed in tiger skins driven at the Chen and Cai levies, the left to two banners lifted and withdrawn and a bundle of brushwood dragged through the dust. Nothing on that field out-fought him. He was beaten by a count made in a tent months earlier by a man dividing other people's farmland. He reached Lian'gu, was asked what he would say to the fathers of Shen and Xi whose sons he had spent, and killed himself. When the news reached Duke Wen, he said five characters — 莫余毒也已, *now no one can poison me* — and the record does not make him say anything kinder. Your page is at **0.058**. The act's ceiling is 0.060. You reached it in the first chapter.

**Resolution back into the scroll.** No summary card, no continue button. During DRY the cord returns showing the new density, and the state line updates to *"What it cost: 0.002 of the sheet"* (A) or *"What it cost: 0.029 of the sheet"* (B). At READ the letterbox opens 2.76 → 2.39 over 900 ms, the section height is already 3 beats, the Historian's block sets on the silk, `scroll.locked` releases, and the next downward gesture carries the reader into beat 1.7 with the rods already being swept. `aria-live` (polite) narrates the ink for non-visual readers — *"Your stroke retreated along its own path and left three tide lines. The page is now 3.1 percent ink."*

**Persistence and revisits.** Stored as `{ chapter: 1, option: 'A'|'B', at, inkSpent: 0.002|0.029, tideCount: 3|1, beatsSeen }`. On a second visit the node rehydrates at READ: ink already at high-water, slip already stamped, **aperture never tightens and no seal sounds** — a seal is a thing that happens once. The state line reads *"You chose this. The other branch was never run."* In Codex the untaken branch appears as a **jade `#5C9A86` outline with no fill** — a thing in a mind, never re-playable footage. The only way to clear it is **Begin again**, which resets `decisions`, `inkHigh` and `visited` together: you cannot un-spend one stroke and keep the rest.

---

## 7 · SHADER & PARTICLE CALLOUTS

**On the brief's "ink-dissolve":** it is built as **pass 2 of the ink field — dispersion with the accumulated dark rim** — and there is no dissolve in the cross-fade sense anywhere in this chapter. A `smoothstep` front crossed with a mask is a PowerPoint dissolve; real ink is darkest *at* the edge because evaporation is fastest at the pinned contact line. A rim that fades is a bug in the Ink Law, not a look.

| # | System | File | Key uniforms | Visual outcome |
|---|---|---|---|---|
| **S1** | **Ink field sim** (shared singleton, never unmounts) | `src/three/InkField.tsx` | `uPrev, uSizing, uFibre, uWind, uK (K∥ 0.10–0.16 / K⊥ 0.018–0.032), uDt, uDeposits[8]`; **Ch1 override `uDryRate = 0.0` outside node windows** | Damp paper, everywhere, all chapter. Nothing dries until the reader causes it. 1.4 ms @ 2048². |
| **S2** | **Ink wick / dispersion + dark rim** | `src/shaders/inkDissolve.ts` (extend) | `uFront, uScale, uRimWidth 0.018–0.034, uRimGain 0.6–1.1, uCore` | The mark is darkest at its travelling edge. FBM displacement only in 0.02 < D < 0.28. Rim adds to **D**, never to alpha. 0.6 ms. |
| **S3** | **Wick-race controller** — the chapter's signature | `src/shaders/wickRace.ts` (new) | `uBoostMap` (512² R8: Jin 1.00 / Chu 0.61), `uRaceT 0→4.0s`, `uAniso 6.4` | Two identical strokes travelling at different rates. The answer to "who wins" as a diffusion rate. **Must run at true 60 Hz on tier 1** or the ratio stops being legible. |
| **S4** | **Seal impression (印)** | `src/shaders/sealImpression.ts` (new) | `uSealSDF` (256² R, UASTC), `uPressure 0→1 over 60–140 ms`, `uPasteLoad 0.62–0.88`, `uToothCut 0.31–0.44`, `uDent 0→0.0009 world`, `uViscosity 2.5`, `uBloomMask 0.4` | **Not a decal.** Paste transfers only where the carved face clears the paper's tooth height, so the impression is broken and asymmetric. The paper is physically depressed, so the 8° key finds a shadowed lip at the perimeter *after* the paste settles. Vermilion beads proud and sits **on** the ink it crosses, unmixed. |
| **S5** | **SDF stroke writer** | `src/three/StrokeWriter.tsx` | `uStrokeVel, uPressure, uReserve, uHoldAngle, uRuleEdge, uMoistureLoad` | Stroke-order writing, `fwidth` analytic AA, pressure-modulated width, 飛白 as amplitude dropout against the brush atlas G channel. **Glyphs stamp into `uDeposits` rather than compositing over the field** — that is what makes "if it cannot get wet, it is not a glyph" true in code. 0.2 ms. |
| **S6** | **Sizing-resist mask** (the feints) | folded into S1 via `uSizing` | 1024² R UASTC; feint patches at **0.82**, sheet elsewhere **0.0** | Fourteen marks, seven of which take a perfect edge and never spread. Fortification rendered as nothing, seen only where ink refuses to go. |
| **S7** | **Tide-line crystalliser** | folded into S1 pass | `uTideGain 0.7–1.0`, `uTideWidth 1.4 px` | Bright, hard-edged, permanent lines where ∂M/∂t crosses zero. In Ch1 they fire only at 1.3 and at the node. |
| **S8** | **Raking paper BRDF** | `src/shaders/paperRake.ts` (new) | `uToothMap, uLampDir (8.0°), uFibreTheta 6°±14°, uSheen 0.06` | The tooth reads as landscape. Anisotropic sheen along θ only, no isotropic specular. This shader is why a flat plane can play a mountain range. |
| **P1** | **Xuan lint** — the only particle system | `src/three/FibreLint.tsx` | 1,400 `Points`, vertex-shader motion, `pos = f(hash(id), uTime)` | 0.4–1.2 mm cellulose fibres lifted by the lamp's convection, **drifting along the fibre vector field θ** — the air previews the anisotropy before any ink demonstrates it. No history, no simulation, one draw call. **No airborne ink anywhere: banned.** |
| **P2** | **Counting rods** | `src/three/CountingRods.tsx` | `InstancedMesh`, 96 instances, CPU matrix write | Rods laid, never thrown; each placement kicks 3–4 lint fibres via a one-shot impulse into P1's hash offset. Under 0.3 ms. |
| **PP** | **Post stack** | `src/three/Composer.tsx` | DOF → bloom (**MRT-masked: vermilion 0.4×, gold never**) → ink composite in paper space **after** DOF → AgX → grain+vignette+letterbox mask, one blit at 1:1 device pixels | Gold never blooms — a luminance-threshold bloom would, which is a doctrine violation implemented as a shader bug. Grain is paper tooth in paper space, static, never animated. |

---

## 8 · PERFORMANCE NOTES

**The expensive thing is beat 1.3, and it is expensive for a reason no profiler will explain.** The wick race needs the ink sim at a true **60 Hz across the full 2048² field for four continuous seconds** with fourteen live deposits, because the entire meaning of the beat is a *rate difference* between two regions. Everything else in Chapter 1 is close to free: one shadow-casting light, ~5k triangles of props, one particle system of 1,400 points, no terrain, no fluid, no embers, no water. Chapter 1's frame budget is spent almost entirely on one pass of one shader for one shot.

**The invariant that must survive every degradation: the *ratio* 1.00 : 0.61 and the *wall-clock* 4.0 s.** If tier 2 halves the tick rate and nobody scales K, the race becomes a different race and the chapter's thesis is wrong on that device.

| | **Tier 1 (high)** | **Tier 2 (medium)** | **Tier 3 (low)** |
|---|---|---|---|
| Ink FBO | 2048² RGBA16F | 1024² RGBA16F | 1024² RGBA8, D packed across R+G as 16-bit fixed, manual bilinear |
| Sim tick | 60 Hz | 30 Hz, **K∥ scaled ×2 so wall-clock rates are identical** | 20 Hz |
| **Beat 1.3 race** | Live sim | Live sim, 5-tap diffusion | **Pre-baked**: 24-frame 512² R8 KTX2 flipbook (2 columns × 12 frames, 96 KB) blitted into the field. The *result* is bit-comparable; the physics is not live. |
| Lint (P1) | 1,400 | 700 | 300 |
| Rods (P2) | 96 instanced, contact shadow | 96 instanced, no shadow | Baked into the mat albedo; loses the 3–4 fibre displacement |
| Lamp | Point + 1024 PCF contact shadow | Point, baked AO only | Point, baked AO only |
| Fog | 12-tap | 6-tap | Analytic |
| Post | DOF + masked bloom + grain | Masked bloom + grain | **Grain only**; seal gets a baked 3 px vermilion halo sprite |
| Beat 1.7 second lamp | Real second light, 8 s | Real second light, 4 s | **Cut** — the double-shadow inversion does not survive tier 3 and nothing else in the chapter depends on it |

**Never degrades, at any tier: the seal.** S4's tooth-broken transfer and the 0.0009 dent are 0.05 ms and they are the chapter's most important image. A tier-3 device gets a worse bloom and the same impression.

**Reduced motion** (`prefers-reduced-motion`, and the default in the test suite). The sim runs **180 substeps off-screen in one frame** and presents the settled state. Beat 1.1's five writings become five finished glyphs with their five different edge behaviours fully legible — the pedagogy survives intact, because the differences were always spatial, not temporal. Beat 1.3 presents its **end state**: two columns stopped at two distances, with their tide lines already crystallised, so the ratio reads as geometry rather than duration. The node's letterbox change is instantaneous. `aria-live` carries what the four seconds carried: *"The right column reached the margin. The left stopped two thirds of the way."* Grain stays — it is the substrate, not an effect.

**No WebGL, or context lost.** `FallbackPlates` serves an authored plate book — **nine dried AVIF plates, one per beat, rendered from the real simulation at build time, never a screenshot of a failure.** Beat 1.3's plate is its end state; beat 1.7's plate carries the seal impression at full quality, because that is the frame that matters. Notice on the silk: *"This device will not run the ink. The plates are the finished state of the same argument."* The node still works — it swaps plates instead of simulating, still spends ink in the ledger, and still stamps the slip. Context loss mid-read restores to the plate book at the current beat without reloading. **Chapter 1 is the correct chapter to build this path in**, because it has the fewest moving parts and the plate book is nine images.

**Budget compliance.** Chapter 1 against `direction-tech.md` §4's 1.70 MB Act I allowance: textures 0.86 MB (tooth 1024² UASTC, fibre θ 512² RG, sizing 1024² R, seal SDF 256² R, race flipbook 512² R8 tier-3 only) · geometry 0.13 MB meshopt (lamp ×1 reused, mat, rod, brush, inkstone, dropper) · glyph SDF 0.10 MB (~180 characters, subset by `unicode-range` from this document's canon) · audio 0.55 MB. **Total 1.64 MB.** Two new programs (S3, S4) — at the CI cap of two per chapter, so any further Chapter 1 shader must be folded into an existing one.

---

## 9 · THE ONE IMAGE

**Beat 1.3, at t = 3.6 s: the moment the leading column reaches the margin and the trailing one has visibly stopped.**

> Extreme close-up on cream xuan paper filling the frame, raked by a single warm lamp eight degrees above the surface so every paper fibre casts a long shadow and the sheet reads as a landscape. Two vertical columns of pale grey ink brushstrokes, identical in weight, wick outward along the fibre — the right column has reached the paper's edge, the left has halted two thirds of the way and crystallised a bright hard tide line. Monochrome. One gold hairline. 2.39:1.

---

**END · CHAPTER 1 · 始計**
*Next: `scene-ch02.md` — 作戰, the price of a day, where the reader is finally shown 24mm and it is used as a punishment.*
