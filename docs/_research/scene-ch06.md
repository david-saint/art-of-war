# CHAPTER 6 — 虛實 · SCENE SCRIPT

**Xū Shí · "Weak Points and Strong" · production title: MAKING HIM MOVE**
**Act II — THE SHAPE · chapter 3 of 3 · the act's payoff and its ceiling**
**v1.0 · subordinate to `manifesto.md`, `direction-tech.md`, `direction-audio.md`, `canon-04-06.md`. Where they disagree, the manifesto wins.**

Chapter entry state: mean page density **0.149** (Act II doctrinal path). Act II ceiling: **0.180**.
Chapter length: **10 viewport-heights** (9 beats; the node consumes 2vh of pinned scroll).
Payload budget: **2.35 MB** (Act II allocation, §4 of `direction-tech.md`).

---

## 1. CHAPTER THESIS

**The dictum, one sentence:**
> Do not go looking for his weak point — manufacture one, by attacking the thing he cannot afford to ignore, and then arrive at the place his answer just emptied.

**What the scene is about, emotionally.**

This is the only chapter in the thirteen where being clever feels *good*, and the chapter is built to let it feel good for eleven minutes and then hand the reader the invoice.

Chapters 4 and 5 were about *withholding* — the fortress made of refusal, the boulder you must not drop yet. Both are exercises in the reader sitting on their hands. Chapter 6 is the release of that pressure into something that is not violence: the first time in the site the reader is the one **setting the appointment** rather than keeping it. The dominant sensation for the first two-thirds is a kind of low, illicit pleasure — the feeling of watching a much larger thing walk itself apart on your behalf while you stand still in the rain. Nothing you did was expensive. Nothing you did was even visible. The page barely darkens and the enemy destroys himself six hundred *li* away, and the reader will catch themselves enjoying it.

Then the chapter charges for it, twice.

The first charge is physical and it is the Ink Law doing the argument: the entire sheet is wet, edge to edge, for the whole chapter, and on wet ground **nothing keeps its identity** — not his marks, and not yours. You are being clever inside a medium that dissolves cleverness. The second charge is Pingling. Formlessness is not free and it is not clean; somebody paid for the picture you painted, and in 353 BC it was two of your own city commanders, thrown at a place you had already said could not be taken, without being told what they were buying. The chapter's last vermilion is not the enemy's blood.

So: **the emotional shape is delight, then the cold recognition that the delight was purchased.** Not remorse — the site does not do remorse, and it does not do inspiration. Recognition. The reader should finish Chapter 6 having learned to enjoy this, which is exactly the condition in which Act III's grinding will hurt.

**Directorial rule for the whole chapter, from which everything else follows:** *the enemy is never depicted while stationary.* You do not get a shot of his camp, his siege lines, his strength. The single image of him in this chapter is of him **running**, at 180mm, after the reader made him run. Before that he exists only as a stain bleeding onto the western edge of the sheet from beyond the frame, and as a held 笙 cluster. You are not permitted to look at 實. You are only permitted to watch it become 虛.

---

## 2. THE ENVIRONMENT

**The set: a flooded lowland at night, and the sheet is backlit.**

Standing water over a river-delta irrigation grid between the fifth and the eighth month. Roads here are not surfaces; they are the six inches by which a dike stands above the water. This is the only chapter in the thirteen where **M holds 0.60–0.75 edge to edge**, so the fog term (`fog = 1 − exp(−h(z)·(0.22 + 0.9·M))`) is at its site maximum for the entire runtime.

"Night" here is a **value, not a hue.** There is no blue hour, no moon, no cool grade. The scene is dim warm paper with dim warm ink on it, and every light in the rig is ≥ 3200 K. If a lighting artist reaches for a cool key to say "night," the shot is rejected.

### 2.1 World scale and layout

One world unit = one metre. The sheet spans **X ∈ [−800, +800], Z ∈ [−335, +335]** (2.39:1 at the paper plane), water plane at **Y = 0**.

| Location | World position | Notes |
|---|---|---|
| Qi / Linzi (reader's origin) | (+1150, 0, +90) — **off-sheet** | Never shown. The crane starts above the road from it. |
| **Guiling** (the dry patch) | (+140, 0, +40) | On the return road. Reads as unremarkable until beat 6.7. |
| **Daliang** — gate, granary, treasury | (−260, 0, −120) | The named factor. 85mm subject for beat 6.4. |
| Handan (the siege) | (−820, 0, −520) — **off-sheet** | Never in frame. Present only as ink bleeding in from the west edge. |
| Pingling (the feint) | (+480, 0, −210) | Unlit and unnamed until beat 6.8. |

### 2.2 What is real 3D and what is a painted plane

| Element | Build | Budget | Notes |
|---|---|---|---|
| **The sheet / terrain** | Displaced plane, 256×110 segments, driven by a **KTX2 R16 heightmap 1024²** | 28k tris | Total relief **±0.9 m over 1600 m**. This is the flattest terrain in the site by an order of magnitude — and it must be, because the whole argument is that water goes to the low ground and here the low ground is everywhere. |
| **Standing water** | Single plane at Y = 0, `ch6-water` material | 2 tris | Not a mesh feature. A shader (§7). |
| **Causeway / dike network** | 9 extruded ribbons from splines, glTF + meshopt | 14k tris | 0.35–0.55 m proud of the water. **The only straight lines in the chapter.** |
| **Daliang gate + granary block** | One diorama, 85mm subject only | 31k tris, **stepped 24 fps** | Rammed earth, timber granary frames, one bronze-bound gate leaf. No people. |
| **Reed clusters (3)** | Cross-quads, alpha-tested against the brush atlas G channel | 900 tris | Exist for exactly one purpose: the two wipes (§3, beat 6.5). |
| **Far range** | **Painted plane.** One 2048×512 UASTC card at Z = −900 | 2 tris | Three strokes and no more. Fogged to 0.86 at all times; it is a rumour of a horizon, not a mountain. |
| **The "sky"** | **Not a sky.** A gradient card at Z = −1400 that is the *back of the paper* — the diffuser in front of the backlight. | 2 tris | If anyone models a cloud, cut it. |
| **The cart** | 9k tris, lacquered frame + canvas | **Not in the Story world at all** — see §5.4 | Lives only inside the Historian's 40mm slip inset. |

**Total chapter geometry ≈ 76k triangles.** Armies are strokes. There is not one soldier mesh in this chapter and there must never be one.

### 2.3 Ink behaviour

- **M (moisture) — this chapter owns it.** 0.60–0.75 across the entire sheet, all beats, no exceptions. Deposits do not get a dry edge anywhere except at Guiling.
- **D is monotonic, and this is the chapter where that clause does the arguing.** A mark that has divided can never gather. Ten pale segments can march back toward each other and they will overlap into a *wider, paler stain*, never again into one dense mark. **敵分為十 is not a metaphor here; it is a consequence of a `max()`.** If a build is ever seen re-concentrating a divided mass, the build is wrong.
- **S (sizing) is near zero everywhere.** Two exceptions: a small high-S ring at the Daliang wall (S 0.72) — the one place in the chapter ink refuses to go — and **Guiling, which is not sized but simply dry** (M 0.06 in a 40 m patch). The dry patch is on screen from beat 6.0. Nobody will notice it. That is the design.
- **A (age).** The oldest ink visible in the site to this point is here: the Handan siege ink, laid down before the chapter opened, warm and oxidised. The present — the reader's own mark — is the blackest thing on screen and by far the smallest.
- **G (grain).** Fibre θ runs 14° off horizontal with ±16° wander, but in this chapter it is *outvoted* by the flow field (§7, `ch6-flow`): where the vorticity solver's velocity magnitude exceeds 0.22, advection dominates anisotropy. This is the visual statement of 兵無常勢 — the paper's own preference stops mattering once there is enough water moving.

### 2.4 Lighting rig

Four terms. Three chapters, three lighting models, identifiable at thumbnail size: Ch4 shadowless, Ch5 raked, **Ch6 lit from behind the paper.**

| Term | Type | Colour temp | Intensity | Purpose |
|---|---|---|---|---|
| **BACK (the key)** | Not a light — a **transmission term** in the paper material: `L = uBacklight · exp(−uAbsorb · D)` | 3400 K | `uBacklight` 0.70 → 0.92 across the chapter | Reserved paper reads 0.86 luma; ink reads as **opacity against a lamp.** This is why the enemy's concentrated mass is the only opaque thing in the frame: he is visible *because* he is solid, and his solidity is the thing being punished. |
| **FILL** | Hemispheric ambient, no direction | 3600 K | 0.18 | Keeps causeway tops off pure silhouette. |
| **RIM** | One grazing directional, screen right, **4° above the sheet** | 3200 K | 0.35 | Its only job is to catch the **fibre swell** of saturated xuan (§7, `ch6-swell`) so the reader can see the paper has physically lifted where it is wet. The only specular in the chapter. |
| **VOLUMETRIC** | Height fog, density = f(M). **No god-rays** (banned). | Fog colour `#DCD3BE` — aged paper, never grey | 12-tap high / 6-tap medium / analytic low | At M ≈ 0.7 the fog is at its site maximum. Near plane clear to ~40 m; by 300 m contrast is 22% of near. The 180mm shot at the node reads *through* this, which is why the enemy is legible as a value and never as a shape. |

**Practicals: zero.** No lanterns, no torches, no fires. Fire is Chapter 12's and it is not lent out.

### 2.5 The horizon

**The chapter earns its horizon.** For beats 6.0–6.2 the crane is high enough and pitched steeply enough that there is no horizon in frame at all: there is only paper, and the reader is looking at a *surface*, not a *world*. The horizon enters from the top edge during beat 6.3 — the beat in which the enemy becomes legible — and settles at **34% from the top of the 2.39:1 frame** by 6.8, where it stays.

It is never a line. The fog term at that band reaches 1.0, so the join between wet grey lowland and lit warm paper is a **soft 40 px transition**, and the only hard horizontal anywhere in the chapter is the far causeway at Z = −280.

---

## 3. THE BEAT SHEET

### 3.1 The crane

**One continuous descending crane for the whole chapter, 85mm, zero cuts in Story.**

Arc-length-parameterised spline, `P₀ = (+620, 78, +320)` → `P₈ = (−40, 5.5, −60)`. Monotonically descending in Y. Target rides the sheet, so the pitch flattens naturally from −41° to −9°.

**Easing: none. Constant arc-length velocity for ten viewport-heights — the only unaccelerated camera move in the site.** Chapter 5 owned acceleration and spent it. This chapter's argument is *inevitability*, not force: water is not dramatic about where it goes.

```ts
// The crane is driven by a third high-water mark, local to the chapter.
// tCamera is bidirectional — but the crane's descent is not.
craneS = Math.max(scrollDrivenS, nodeRealtimeS);
```

**The rule this exists to enforce:** during the decision node, scroll is pinned — and the crane **keeps moving anyway**, on a real-time clock. The one moment the reader stops is the one moment the camera proves the tempo was never theirs. It stops exactly once in the chapter, on branch A, and that stillness is the tell.

**Lens jurisdiction.** 85mm throughout Story. 40mm appears only inside the Historian's slip inset (§3.2, beat 6.2), which is a composite over the frame, not a camera change. 180mm appears **once**, at the node's B branch, entered and left by wipe. **No 24mm anywhere in Act II.**

**The wipe budget: two, both on foreground reed masses, both ≤ 200 ms, both inside the node.** A reed cluster at 0.4 m from the lens occludes 100% of frame for ~11 frames as the crane passes it; the focal length is swapped inside the occlusion. This is how we reach 180mm without a hard cut, and it is the only lens change in the chapter.

### 3.2 Summary

| # | Beat | Scroll | vh | Lens | Move | Horizon |
|---|---|---|---|---|---|---|
| 6.0 | STANDING WATER | 0.00–0.10 | 0.0–1.0 | 85 | Descending crane, top of arc | none |
| 6.1 | 致人 · THE APPOINTMENT | 0.10–0.21 | 1.0–2.1 | 85 | crane + slow pan-and-scan left | none |
| 6.2 | THE CART | 0.21–0.33 | 2.1–3.3 | 85 (+40 inset) | crane; slip inset opens lower-left | none |
| 6.3 | 無形 · GIVE HIM A SHAPE | 0.33–0.44 | 3.3–4.4 | 85 | crane; horizon enters top edge | enters |
| 6.4 | 其所必救 · WHAT HE MUST RESCUE | 0.44–0.55 | 4.4–5.5 | 85 | crane, tracking onto the granary | 0.28 |
| 6.5 | **NODE — WHERE HE IS NOT** | 0.55–0.75 | 5.5–7.5 **pinned** | 85 → 180 → 85 | crane on real-time clock; aperture 2.39→2.76; two reed wipes | 0.31 |
| 6.6 | 十攻其一 · TEN AGAINST ONE | 0.75–0.85 | 7.5–8.5 | 85 | crane, low now | 0.33 |
| 6.7 | GUILING | 0.85–0.93 | 8.5–9.3 | 85 | crane, held frame at 5.5 m | 0.34 |
| 6.8 | 水無常形 · THE BILL | 0.93–1.00 | 9.3–10.0 | 85 | crane runs out of arc and simply continues past frame | 0.34 |

---

### BEAT 6.0 — STANDING WATER

| | |
|---|---|
| **Scroll** | 0.00–0.10 · vh 0.0–1.0 |
| **Camera** | Pos `(+620, 78, +320)` → `(+520, 68, +254)`. Target `(+250, 0, +120)`. **85mm.** Descending crane, constant arc-length velocity, no ease-in — the move is already at speed on frame one, because it inherits the Chapter 5 match cut. |
| **Visual** | **The chapter opens on a match cut on ink** (§8.1) — the last dense mark of Chapter 5's fall is the first dense mark here, touching water. `ch6-rings` fires one capillary ring at the contact point, radius `r(t)=√(k·t)`, k = 0.42, amplitude decaying 1/r, writing into **M**, not colour. `uBacklight` 0.70. `uAbsorb` 3.4. `uK` = (0.148, 0.030) — near the top of the permitted band, because everything here is wet. Whole-sheet M initialised 0.66 ±0.05 from the fibre FBM. `uFogM` at max. The dry patch at Guiling (M 0.06) is on screen and unremarked. |
| **Typography** | **篆書 chapter title 虛實**, written in stroke order over 2.4 s, vertical, right column at x = 0.86, y 0.10 → 0.44. It obeys the Ink Law: it is written onto wet ground, so it **blooms as it is written** and the two characters' strokes bleed into each other by the fourth stroke — the only chapter title in the site that becomes partly illegible in the act of being written. Beneath it, small, gold hairline rule + `06 / 十三`. No fade, ever. |
| **Audio** | Transition hit at the boundary — **modified**: the Ch5 sub is allowed to run across the cut uninterrupted and only the tanggu transient fires (§8.1). Then BED at −34 dB, and **rain on lacquer at the highest gain it reaches anywhere in the project**, because rain gain is a direct function of M. One positional source, azimuth +140°, 8 m behind and right of the reader. There is no object there. |
| **Interaction** | None. |

---

### BEAT 6.1 — 致人 · THE APPOINTMENT

| | |
|---|---|
| **Scroll** | 0.10–0.21 · vh 1.0–2.1 |
| **Camera** | Pos → `(+402, 59, +198)`. **85mm.** Crane continues; a slow pan-and-scan left at ~1.8°/10 s layers over it. |
| **Visual** | Two 淡墨 marks appear on the sheet, ~180 m apart: one already there and dry-ish at the edges (M 0.31 — *it arrived first and has been sitting*), one still wet and elongated (M 0.74 — *it is hurrying*). `ch6-flow` comes online: `uAdvect` 0.0 → 0.55, `uVort` 0.0 → 0.6. The hurrying mark visibly **loses shape as it travels**, because it is travelling through moving water. The resting mark does not move and does not change. This is 以佚待勞 as a two-second physics demo, before a single word is on screen. |
| **Typography** | **TEXT block 1.** Chinese vertical RTL, column at x = 0.79, y 0.13 → 0.72, 楷書, written in stroke order at 2.1 strokes/s. Translation on optical centre, y = 0.60, two lines, 21 words. Exits by **drying, not fading** — the block stays on the sheet and the camera leaves it behind. |
| **Audio** | Bed ducks to −∞ 180 ms before the first stroke. One 古琴 泛音 (7th node, 2.6 s decay) at −26 dB. Then nothing until 600 ms after the last stroke dries: **7.1 s of hole in the mix.** No music. |
| **Interaction** | None. |

---

### BEAT 6.2 — THE CART

| | |
|---|---|
| **Scroll** | 0.21–0.33 · vh 2.1–3.3 |
| **Camera** | Pos → `(+248, 47, +126)`. **85mm** Story camera, unchanged. |
| **Visual** | The Historian's **slip inset** opens in the lower-left third: a 480×200 render target, 2.39:1, DOM-framed with a 1 px gold hairline, inset "like a slip on a desk." Inside it, a **40mm level insert**: the Yinqueshan bamboo slips laid out on plain paper, and behind them, three-quarter, **the cart** — canvas over a lacquered frame, backlit to a silhouette with a warm rim, stepped at 24 fps while everything else runs at 60. The curtain moves exactly once, on the Historian's word *cart*, and never again. **We never see who is inside.** |
| | Story-layer ink continues underneath: `uPsiDrift` 0.006 → 0.012, dark motes (`ch6-motes`, 240 instances) begin drifting west-southwest, showing the reader the gradient several beats before they will be asked to use it. |
| **Typography** | **HISTORIAN**, apparatus grotesque, ragged-right at 64 characters, **in the margin, never inside the cinema frame** — right margin, x 0.72–0.97, under a gold hairline rule. Citations sealed in gold. Two blocks (H2, H3 in §4). |
| **Audio** | Narration stem at −19 LUFS short-term, fixed at **+25° azimuth, 1.2 m** — beside you at a table, never in your head. TERRAIN rain continues under him. **The rain-on-lacquer source is at the cart's world position, and the cart is not in the Story world.** You can hear him. You cannot see him. This is the chapter's central staging decision, and it is a sound. |
| **Interaction** | The slip inset is hoverable: hovering a slip raises a one-line provenance label. Non-committal, no ink cost, no drum. |

---

### BEAT 6.3 — 無形 · GIVE HIM A SHAPE

| | |
|---|---|
| **Scroll** | 0.33–0.44 · vh 3.3–4.4 |
| **Camera** | Pos → `(+96, 36, +54)`. **85mm.** Crane; the horizon enters frame from the top edge and descends to 0.22. |
| **Visual** | The western edge of the sheet begins to **bleed inward from beyond the frame**: 濃墨, warm with age (`uAge` 0.42), advancing at K∥ from off-paper. This is Handan, and it is the only representation of the enemy's strength in the chapter — **an off-screen stain with a hard leading edge and a 4-octave FBM isocontour in the 0.02 < D < 0.28 band.** He is not shown. He is *implied by his own overflow*. |
| | Simultaneously the reader's own dispositions **stop being drawable**: any mark the reader's cursor would leave is rendered at D 0.02–0.04, below the ink field's deposit threshold. Move the pointer across the sheet and you make no mark at all. 無形 is implemented as *the reader temporarily losing the ability to leave a trace.* |
| **Typography** | **TEXT block 2** (形人而我無形) — Chinese column x = 0.81. Then, hard against it, **TEXT block 3** (無所不備，則無所不寡) at x = 0.68, so the two vertical columns sit side by side and the second is read *after* the first by the eye moving right-to-left. Translation at optical centre, one line, 14 words, held 4 s. |
| **Audio** | **The 笙 enters, and this is the chapter's best sound.** One held sheng cluster (A–B–E, 徵 on A), no melodic intent, no vibrato, −22 dB: *a disposition is a chord that does not move.* It represents the enemy's concentration. It will not change volume for the rest of the chapter — only its internal tuning will. Under it, THREAT stem gain = −30 dB + 26 dB · meanPageDensity = −26.1 dB. |
| **Interaction** | None. The pointer is deliberately inert (see Visual). |

---

### BEAT 6.4 — 其所必救 · WHAT HE MUST RESCUE

| | |
|---|---|
| **Scroll** | 0.44–0.55 · vh 4.4–5.5 |
| **Camera** | Pos → `(−48, 27, −6)`. Target swings to Daliang `(−260, 0, −120)`. **85mm** — the named factor at its own lens. Horizon settles at 0.28. |
| **Visual** | The Daliang diorama resolves out of the fog for the first time: gate leaf, rammed-earth wall, and behind it the granary block. The wall carries the chapter's only meaningful **S**: a high-sizing ring at 0.72, which renders as **nothing at all** until it is tested. The reader is looking at a blank and being asked to guess where the strength is. There is none. That is the joke, and it will not be revealed until the verdict. |
| | `ch6-water` reaches full parameters here: `uRefract` 0.004 → 0.011 in paper-space UV, dual-scrolling normal derivative from the 512² RG map. The reflection of the gate in the standing water is **not a reflection** — it is the ink of the gate, seen from behind through wet paper. No Fresnel, no tint, no blue. |
| **Typography** | **TEXT block 4** (故我欲戰…攻其所必救也) — the operative line of the chapter, and the longest. Chinese column x = 0.83, 24 characters, written over 9 s. Translation at optical centre, **two lines, 24 words — the hard ceiling.** Below it a **HISTORIAN** block (H4) in the right margin, on the arithmetic of a granary. |
| **Audio** | Sheng cluster holds. One 古琴 partial on the Text. The rain thins over the walled area only — a spatialised hole in the weather, because the wall is the one dry thing in frame — and this is the only diegetic sound cue that the fortification exists. |
| **Interaction** | None. The node is next and the reader should arrive at it without having touched anything for four beats. |

---

### BEAT 6.5 — **THE NODE: WHERE HE IS NOT**

Full specification in §6. Summary row:

| | |
|---|---|
| **Scroll** | 0.55–0.75 · vh 5.5–7.5 · **scroll pinned** |
| **Camera** | Aperture **2.39:1 → 2.76:1** over 700 ms (GSAP, DOM letterbox). The crane **keeps descending on a real-time clock** through the pin. On commit-B: reed wipe → **180mm**, held 11 s, reed wipe → 85mm. On commit-A: **the crane stops.** |
| **Audio** | LOAD: everything ducks 6 dB / 700 ms, stereo width 100% → 46%, one tanggu at −14 dB, bed low shelf +2 dB below 90 Hz, then 900 ms of bristle-in-water at the reader's own head position. Commit: the seal, then **400 ms of true silence.** |
| **Interaction** | Two options. Keyboard-reachable `<fieldset>` in the SSR article. Hover A = paigu head touched with the palm (110 Hz, damped, 180 ms); hover B = **the same drum, same hand, at the rim** (≈240 Hz, 140 ms). Both −20 dB. Neither predicts outcome. |

---

### BEAT 6.6 — 十攻其一 · TEN AGAINST ONE

| | |
|---|---|
| **Scroll** | 0.75–0.85 · vh 7.5–8.5 |
| **Camera** | Pos → `(−34, 11, −44)`. **85mm.** Crane resumes scroll-drive from wherever the node's real-time clock left it (`craneS = max(scrollDrivenS, nodeRealtimeS)`). |
| **Visual** | The consequence of the node, laid down permanently. On branch B this is the dispersion residue: **ten pale segments where there was one dense mark**, plus the hard-edged baggage shed on dry ground at the head of the western road (the siege train, which does not come back), plus the 飛白 flecking where the column's velocity outran its reserve. On branch A this is a wide grey remixed middle in which two armies are no longer distinguishable. Either way, `uSplitPhase` has run 0→1 and **cannot be run backwards.** |
| | The reader may scroll back here. `tCamera` will restore the shot. `tInk` will not restore the sheet. This is the beat where that lesson lands, and it should land without a word of UI. |
| **Typography** | **TEXT block 5** (我專為一，敵分為十，是以十攻其一也). Chinese column x = 0.80. The character 十 is written **twice**, once in each half of the line, and the two are rendered at different densities — the first (his ten) at D 0.31, the second (your ten-against-one) at D 0.78 — so the same glyph carries opposite weight in the same sentence. Translation at optical centre, 22 words. |
| **Audio** | **The sheng cluster splits into ten.** Total energy unchanged, gain unchanged: the single held cluster is replaced over 6 s by ten near-unison voices detuned across ±19 cents, and the beating between them *is* the sound of dispersion. He did not get quieter. He got wider. |
| **Interaction** | None. |

---

### BEAT 6.7 — GUILING

| | |
|---|---|
| **Scroll** | 0.85–0.93 · vh 8.5–9.3 |
| **Camera** | Pos → `(−40, 6.4, −56)`. **85mm.** The crane's descent has effectively bottomed out; the move continues but reads as a held frame at 6 m above the water. |
| **Visual** | The head of the returning column reaches `(+140, 0, +40)` — **the dry patch that has been on screen since beat 6.0.** A wet, elongated, pale mark meets ground with M 0.06 and a mark that has been sitting on it, dry, since before he started walking. There is no bleed. There is a **hard, final, terminal deposit**, D +0.31 locally, and along the whole halted front a **tide line** crystallises: bright, hard-edged, permanent. Total local area: 40 m of a 1600 m sheet. It is the smallest dark thing in the chapter and the only one. |
| | **We cut away at contact, as always.** The battle is 700 ms of scheduled silence and a change in the ink. |
| **Typography** | **HISTORIAN** (H6), right margin. Four characters of the *Shiji* — 大破梁軍 — set as an inline citation in 楷書 with a gold seal-rule, and the note that this is the entire account. |
| **Audio** | Every tide-line crossing fires an **8 ms tick at 5.6 kHz, −24 dB, panned to its screen position.** There are eleven of them over 4 s. Then 700 ms of true silence at contact. The sheng's ten voices do not resolve; they are simply gone by the time the silence ends. |
| **Interaction** | None. |

---

### BEAT 6.8 — 水無常形 · THE BILL

| | |
|---|---|
| **Scroll** | 0.93–1.00 · vh 9.3–10.0 |
| **Camera** | Pos → `(−40, 5.5, −60)` and **onward past the spline's nominal end**. The crane does not arrive anywhere. It runs out of chapter and keeps going. |
| **Visual** | The camera passes over Pingling `(+480, 0, −210)` — a location that has been in frame, unnamed, for the whole chapter — and **two vermilion beads** are set there. Cinnabar, ~2.5× viscosity, ~0.4× bloom, beading proud of the fibre, **never blending**, because consequence never dissolves into the gloom. They are two of Qi's own city commanders. Page density gain: +0.0009. They are the smallest marks in the chapter and the only saturated pixels in it. Accent coverage at this frame: **0.4% of frame.** |
| **Typography** | **TEXT block 6** (夫兵形象水…) — the water line, the one everybody quotes. It is placed **last**, after the reader has already watched the mechanism, so that they read it as a specification and not as a poem. Then, on a separate beat of 1.4 s, 故兵無常勢，水無常形. Below, **HISTORIAN** (H7, H8) in the right margin: Pingling, and Maling twelve years on. |
| **Audio** | Guqin, 徵 on A, sparse, single notes with full decay. The rain has not changed volume once in ten viewport-heights and does not now. Chapter boundary hit fires at 1.00. |
| **Interaction** | None. **Codex is available and it is the chapter's real reward:** switching to Codex here flips to orthographic 16:9 and, for the first time, **shows the whole board** — Linzi, Handan, Daliang, Guiling, Pingling on one flat map table. Story never gave the reader a god view, because 無形 means you do not get one either. Codex is where you find out what you were standing in. |

---

## 4. THE SCENE SCRIPT

**Voice discipline for this chapter.** The Text appears six times and is never spoken in any language. The Historian speaks eight times, all in the margin, none inside the cinema frame. **The Commander speaks exactly once — at the node — and says nothing at commit, because its "yes" is a seal press.**

### 4.1 THE TEXT (經)

**T1 — beat 6.1**
> 凡先處戰地而待敵者佚，後處戰地而趨戰者勞。
> 故善戰者，致人而不致於人。
>
> *Fán xiān chǔ zhàn dì ér dài dí zhě yì, hòu chǔ zhàn dì ér qū zhàn zhě láo.*
> *Gù shàn zhàn zhě, zhì rén ér bù zhì yú rén.*
>
> **Whoever reaches the ground first and waits is rested. Whoever arrives second and must hurry is spent. So: bring him to you. Do not be brought to him.**

**T2 — beat 6.3**
> 形人而我無形，則我專而敵分。
>
> *Xíng rén ér wǒ wú xíng, zé wǒ zhuān ér dí fēn.*
>
> **Give him a shape and keep none, and he divides while you gather.**

**T3 — beat 6.3, immediately right of T2**
> 無所不備，則無所不寡。
>
> *Wú suǒ bù bèi, zé wú suǒ bù guǎ.*
>
> **Strong everywhere is the definition of thin everywhere.**

**T4 — beat 6.4**
> 故我欲戰，敵雖高壘深溝，不得不與我戰者，攻其所必救也。
>
> *Gù wǒ yù zhàn, dí suī gāo lěi shēn gōu, bù dé bù yǔ wǒ zhàn zhě, gōng qí suǒ bì jiù yě.*
>
> **If I want the battle, he comes out from behind high walls and deep ditches and gives it to me — because I have gone at the thing he cannot leave alone.**

**T5 — beat 6.6**
> 我專為一，敵分為十，是以十攻其一也。
>
> *Wǒ zhuān wéi yī, dí fēn wéi shí, shì yǐ shí gōng qí yī yě.*
>
> **I am one. He is ten. Every fight after that is ten against one.**

**T6 — beat 6.8, in two parts**
> 夫兵形象水，水之形，避高而趨下；兵之形，避實而擊虛。
>
> *Fū bīng xíng xiàng shuǐ, shuǐ zhī xíng, bì gāo ér qū xià; bīng zhī xíng, bì shí ér jī xū.*
>
> **An army takes the shape of water. Water refuses height and takes the low ground, every time, without exception, without courage. So does an army worth the name: not at what is full — at what is not there.**

> 故兵無常勢，水無常形。
>
> *Gù bīng wú cháng shì, shuǐ wú cháng xíng.*
>
> **No fixed configuration. No fixed shape.**

### 4.2 THE HISTORIAN (史)

**H1 — beat 6.0**
> The delta floods between the fifth month and the eighth. Roads in this country are not surfaces. They are the six inches by which a dike stands above the water. An army that leaves them does not fight badly — it arrives late.

**H2 — beat 6.2**
> In 353 BC the state of Wei had spent eleven months taking Handan. Everything sharp Wei owned was standing in front of that city. Its own capital, Daliang, held the treasury, the granaries and the king's household, and no field army — because capitals in this period were not garrisoned against a threat nobody had made.
> Qi's commander was Tian Ji. The man who told him where to go rode in a covered supply cart, because Wei had cut his kneecaps away and tattooed his face some years earlier, on the recommendation of a fellow student who had read the same books beside him.

**H3 — beat 6.2, the slip inset**
> In April 1972 a work team levelling ground for a hospital at Yinqueshan, outside Linyi, opened two Han tombs and found roughly four thousand nine hundred bamboo slips in the mud. Among them were two military texts, not one: a *Sunzi*, and a separate *Sun Bin Bingfa* — listed in the Han imperial bibliography and gone from the catalogues by the Sui. Lost, that is, for something like thirteen hundred years.
> The find did not date the *Sunzi*. It ended a different argument: whether Sun Wu and Sun Bin were the same man. They were not.
> Our progress scroll is bamboo because of that hole in the ground. It is an artefact, not a decoration.

**H4 — beat 6.4**
> A Warring States field army of a hundred thousand consumed on the order of a thousand piculs of grain a day and could not carry more than a few weeks of it. A granary is not a symbol of the state. It is the number of days the state has left.
> That is what "the thing he cannot fail to rescue" means. It is not sentiment. It is a shelf life.

**H5 — beat 6.6**
> Handan to Daliang is roughly six hundred *li* — about two hundred and fifty kilometres. An army on ordinary march made thirty *li* a day. Pang Juan did it by 倍道兼行, double marches: he left the siege train, took the fast column, and covered the ground in days instead of weeks.
> Every hour of that run converted an army into a queue. The text's word for a man who does this to himself is 勞 — spent. The whole of this chapter is a method for getting him to do it without being asked.

**H6 — beat 6.7**
> Guiling. The *Shiji* gives the battle four characters: 大破梁軍 — the Liang army was broken. There is no account of the fighting because there was very little to account for. The work had been finished weeks earlier, six hundred *li* away, by a decision not to go somewhere.

**H7 — beat 6.8**
> The excavated slips add something Sima Qian does not. Before the light chariots went insolently up to Daliang, Sun Bin sent the army at Pingling — a place he had already told Tian Ji was not takeable, with hostile districts on both flanks and a supply road that could be cut. Two of Qi's own city commanders, from Qi and from Gaotang, were sent into it and destroyed.
> The picture Pang Juan believed was written in the only ink he would have believed. This is what formlessness costs, and the men who paid it were not told what they were buying.

**H8 — beat 6.8, closing**
> Pang Juan survived Guiling. Twelve years later he ran the same road again, faster, toward a place called Maling, and the man in the cart counted his cooking fires as he came — a hundred thousand, then fifty, then thirty — and Pang Juan read it as desertion, and hurried.
> He did not survive that one. He was shaped twice by the same person. The second time cost less than the first.

### 4.3 THE COMMANDER (將)

Tracked small-caps in jade `#5C9A86`; the operative term in 行草. Appears only in §6.

---

## 5. THE HISTORICAL VIGNETTE — **THE ROAD TO DALIANG**

**353 BC · Linzi in Qi, then the Wei heartland, then a place called Guiling.**
**Sources: *Shiji* 65 (孫子吳起列傳); *Zhanguo Ce*, Qi strategies; *Sun Bin Bingfa* 擒龐涓, Yinqueshan slips, excavated 1972.**

### 5.1 The prose

Rain on lacquer. For a long time that is the only thing.

The cart is at the back of the column with the grain carts, canvas stretched over a lacquered frame, and it has been raining on it since Linzi. The men who lever it out of the ruts know two things about it: that it is heavy for its size, and that it is never opened after dark. Nobody has told them what is inside. Inside, a man who cannot stand is doing arithmetic.

He was a student in Wei once, with another student, and the other student understood early that there was room for one of them. So Wei took his kneecaps and put characters on his face, and now he travels lying down. The other student's name is Pang Juan. He is six hundred *li* west, finishing the eleventh month of a siege.

Zhao's envoys have been in the hall at Linzi since spring, every morning, before anyone has eaten. King Wei of Qi has been in no hurry — the court's advice was to let Wei and Zhao grind each other down and take the field when both were worn — and the grinding is now complete. Tian Ji has the army. The cart has the plan.

Tian Ji's plan is the plan any competent man makes, and there is nothing wrong with it. March west. Relieve Handan. Meet the Wei field army in front of the city it has spent a year taking, with the survivors coming out to join you.

From inside the cart, without preamble:

*A man untangling a knot does not haul on the cord. A man breaking up a fight does not step in swinging.*

And then, flatly, the sentence that is this chapter with the poetry removed — 批亢搗虛. **Strike at the throat. Pound into the void.**

The reasoning takes about ten seconds and is entirely accounting. Everything sharp Wei owns is at Handan. What is left at home is the old and the tired. Daliang holds a treasury, a granary, a king's household and no army. So do not go to Handan. Go and stand on the roads of Daliang, in the place where he is hollow, and he will come back to you — and he will come back *fast*, which means he will come back strung out, and he will arrive having marched instead of having chosen. **One movement lifts the siege and collects the wreckage.**

Tian Ji does it.

And then — this is the part the *Shiji* leaves out and the buried text supplies — the Qi army spends the first phase of the campaign deliberately looking like fools.

They go at Pingling first. Sun Bin tells Tian Ji plainly, before they go, that Pingling is hard: hostile districts on either flank, a supply road that can be cut. They attack it anyway. Two of Qi's own city commanders, the magistrates of Qi and of Gaotang, are sent in, and are destroyed, and that is the message. It is written in the only ink Pang Juan will believe. It is written in Qi's dead.

Then light chariots go west and rush the outskirts of Daliang in the open, insolently, without cover. And behind them the Qi main body **thins itself on purpose** — detaching, dispersing, presenting to every Wei scout a picture of a small, badly led, overconfident force poking at a capital it could not possibly hold.

Six hundred *li* west, Pang Juan is handed all of it at once. The capital threatened. The enemy contemptible. The enemy's generals apparently idiots.

He does the thing he must do and the thing he wants to do, and they are the same thing, and that is how you know he has been shaped.

He abandons the heavy baggage. He takes the fast column. He runs for home by double marches, and every hour of that run converts an army into a queue: fast elements outrunning slow, the column elongating along the road, the tail losing contact, everything that made him formidable at Handan left in the mud with the siege engines because it could not keep up with his fear.

They are waiting at Guiling.

There is no drama in the ambush and the sources give it none — 大破梁軍, the Liang army was broken. Four characters. What there is instead is arithmetic that has been running since a covered cart in Linzi. Pang Juan brought his best men to a battlefield chosen by a man he had crippled, at an hour chosen by that man, on legs that had been marching for days, to defend a city that was never actually attacked, having abandoned the prize he spent a year taking.

Nobody at Guiling out-fought anybody. Wei was simply, by then, in ten pieces, and Qi was in one.

Handan, which had fallen to Wei anyway, went back to Zhao two years later at the covenant on the Zhang River. Wei held the city for about as long as it took to lose a war for it.

Twelve years later Pang Juan will run the same road again, faster, at a place called Maling. That time the man in the cart will count his cooking fires as he comes, and let him read the falling number as desertion, and let him hurry. That time Pang Juan does not come back.

> **Record vs. legend.** *Shiji* 65 records the mutilation, the covered cart, Tian Ji in command with Sun Bin advising, the knot-and-fight speech, the march on Daliang instead of Handan, Wei's abandonment of the siege, and the defeat at Guiling in 353 BC. The Pingling feint, the two sacrificed city commanders, the light chariots and the deliberate thinning come from **擒龐涓**, the opening chapter of the *Sun Bin Bingfa* excavated at Yinqueshan in 1972 — an early and independent witness, but one whose own title claims Pang Juan was *captured* at Guiling, which cannot be reconciled with the *Shiji*'s account of his death at Maling in 342 BC. The scholarship has not resolved it and neither do we.

### 5.2 How it is staged

**Not silhouette theatre. Not a diorama. Not a map.** The vignette is staged as **ink on the sheet and nothing else**, because the chapter's entire discipline is that nothing here leaves the paper. There is no airborne particle in Chapter 6 and no cutaway to a dramatised set.

| Element of the vignette | Beat | How it appears |
|---|---|---|
| Rain on lacquer / the cart's presence | 6.0 → all | **Audio only in Story.** One positional source, azimuth +140°, 8 m, with no visible object. It is running before the Historian has said the word *cart*. |
| The cart itself | 6.2 | **Only inside the 40mm Historian slip inset**, three-quarter, backlit to silhouette, stepped 24 fps. Curtain moves once. Occupies 8.6% of frame for 14 s and never returns. |
| Sun Bin | — | **Never depicted.** The one named human in the site who has no representation of any kind. He is 無形; the camera obeys him. |
| Handan / the siege | 6.3 | An aged, off-frame stain bleeding in from the western edge. Never a location, never a shot. |
| Daliang | 6.4 | The chapter's only diorama. 85mm. Empty of people. |
| The Pingling feint | 6.8 | Two vermilion beads. No scene. No narration over the act itself — the Historian describes it after the fact, in the margin, in past tense, at M ≈ 0. |
| The forced march | 6.5-B / 6.6 | The 180mm dispersion. The only image of the enemy in the chapter. |
| Guiling | 6.7 | One dry patch, one hard deposit, eleven tide-line ticks, 700 ms of silence. |

**Scoring.** 徵 zhi on A throughout (Act II mode). 古琴 for the Text's punctuation and for the Historian's spaces — never under him. 笙 for 形: one held cluster from beat 6.3, unchanged in gain for the rest of the chapter, splitting into ten detuned near-unisons at 6.6. **Rain gain = f(M), and M is at its site maximum, so this is the wettest-sounding chapter in the project.** No guzheng (it is an instrument of display, and this chapter's whole argument is against display). No erhu — nobody here is being counted as a person until the vermilion at 6.8, and by then the mix has already stopped.

---

## 6. THE TACTIC DECISION NODE — "WHERE HE IS NOT"

**Beat 6.5 · scroll 0.55–0.75 · scroll pinned · aperture 2.39:1 → 2.76:1**

### 6.1 Situation copy (Commander)

> YOUR ALLY'S CAPITAL HAS BEEN UNDER SIEGE FOR ELEVEN MONTHS. HIS ENVOYS ARE IN YOUR HALL EVERY MORNING BEFORE YOU HAVE EATEN.
>
> SIX HUNDRED *LI* WEST, EVERYTHING SHARP YOUR ENEMY OWNS IS STANDING IN FRONT OF THAT CITY.
>
> WHICH MEANS HIS OWN CAPITAL TONIGHT HOLDS A TREASURY, A GRANARY, A KING — AND NO ARMY.
>
> **CHOOSE THE ROAD.**

### 6.2 The two options

| | **A — 救趙 · RELIEVE THE SIEGE** | **B — 圍魏 · STAND ON HIS ROADS** |
|---|---|---|
| Copy | March west. Meet his main force where it has stood for a year, in front of walls it has already broken, with your ally's survivors coming out to join you. | Do not go to the siege. Go to the city he cannot lose. Look thinner than you are. Make him walk to you. |
| Operative glyph (行草, revealed on hover) | **實** | **虛** |
| Hover audio | Paigu head, palm, centre. 110 Hz, damped, 180 ms, −20 dB. | **The same drum, the same hand, at the rim.** ≈240 Hz, 140 ms, −20 dB. |
| Hover visual | Brush loads. Nothing else. | Brush loads. Nothing else. |

**The two hovers must be equally attractive and neither may predict the outcome.** Nothing brightens for the right answer. This is the audio and visual form of the no-fake-agency refusal, and it is checked at review by muting the labels and asking a fresh viewer which one is correct. If they can tell, the node is rebuilt.

### 6.3 LOAD (t = 0 → 1.60 s)

- Aperture tweens 2.39:1 → 2.76:1 over 700 ms, `power2.inOut`. GSAP on a plain object; the DOM letterbox reads it.
- All stems duck 6 dB / 700 ms. Stereo width 100% → 46% — **the mix physically narrows with the frame.**
- One tanggu at −14 dB. Bed low shelf +2 dB below 90 Hz.
- 900 ms of bristle-in-water, positional, at the reader's own head position.
- **The crane does not stop.** `nodeRealtimeS` takes over and the descent continues through the entire pin at the same arc-length velocity it has held for five beats.

### 6.4 Branch A — RELIEVE THE SIEGE

**MARK (t = 0 → 1.4 s after commit).** The seal. 400 ms of true silence. Then: **the crane stops.** This is the only camera halt in the chapter and it happens 240 ms before anything else does, so the reader registers the stillness before they register the stroke. That stillness is the tell.

**BLOOM (t = 1.4 → 6.8 s).** Your 濃墨 stroke travels west across wet ground toward the aged mass on the sheet's edge. Every UV-unit of that approach is spent in a medium that widens you: `uK` = (0.152, 0.031) at M 0.71, `uAdvect` 0.62, so the stroke is being carried *and* spread simultaneously. Front width at arrival: 3.1× departure width.

Contact does not resolve. It **remixes**. Both masses lose their pinned edges; `uRemix` ramps 0 → 0.85 over 2.2 s, driving the two density fields toward their local mean instead of their local max — **the one operation in the whole site permitted to reduce contrast without reducing D.** Grey floods the contact zone. Individual formations stop being distinguishable from each other. This is the manifesto's definition of a rout made literal: *loss of identity, not addition of darkness.*

- Page density: **+0.094.** Chapter exit at **0.243** against an Act II ceiling of 0.180 — 35% over, and it is meant to be visible in the first frame of Act III.
- Ally's city: still under Wei ink. It fell weeks ago and nothing in this stroke reached it.
- No 180mm shot. **You do not get to look at him, because you are standing in him.**

**DRY (t = 6.8 → 18.2 s).** The largest wet mass in the site to this point dries slowly: M 0.71 → 0.04 over 11.4 s of scene time. Bleed noise band descends 2.4 kHz → 340 Hz, narrowing to Q 6, and stops without a cadence. Tide lines: 34 ticks, the most in any single event in Act II.

**Audio outcome signature: EXPENDITURE.** Tanggu + sub. THREAT stem **+1.5 dB permanently for the session, never lowered.** Plus, because A blows the act ceiling: the BED's 44 Hz standing-room mode, at −34 dB since the cold open, is raised to **−27 dB for the remainder of Act II and does not come back down.** *(New; not in `direction-audio.md` §4 — flagged for sign-off.)*

**Verdict copy — A (Historian, at M ≈ 0):**
> You arrived at the appointment. You did not set it.
> Tian Ji proposed this. It was the competent plan and it was the plan the enemy had already priced in: he had spent eleven months arranging a battlefield in front of Handan, and you have agreed to fight on it, at the end of a march, against an army that has not moved.
> Handan had already fallen. It fell before your envoys finished arguing. There was never a siege to relieve — there was only a place where his army was, and you have gone to it.

### 6.5 Branch B — STAND ON HIS ROADS

**MARK (t = 0 → 0.9 s after commit).** The seal. 400 ms of true silence. Then one small **淡墨** mark on the road outside Daliang: pale, high-water, deliberately contingent — a plan, not an order, because *a plan differs from an order in whether it can bleed*. `uLoad` 0.22, D 0.19, radius 6 m on a 1600 m sheet.

- Page density: **+0.004.** The ink budget barely registers it.

**BLOOM (t = 0.9 → 12.4 s) — the 180mm hold.**

Reed wipe #1: the crane passes a foreground reed cluster at 0.4 m; 100% occlusion for 180 ms; focal length swaps 85 → 180 inside the occlusion. **No hard cut.**

Then the camera does not move for eleven seconds and neither does the listener. Enemy sources are frozen at 6.5× distance, collapsed toward mono (width 18%), low-passed at 1.8 kHz with a −4 dB shelf above 800 Hz, **and given no reverb send from the reader's room.** You do not share acoustic space with the opposing force.

And for eleven seconds nothing happens except that the great dense mark six hundred *li* west begins to unmake itself:

| t | `uSplitPhase` | What is on screen |
|---|---|---|
| 0.9–2.6 s | 0.00 → 0.11 | Nothing. He has not decided yet. The sheng cluster is unchanged. |
| 2.6–4.0 s | 0.11 → 0.24 | **The shed.** A hard-edged residue is left behind on the one patch of dry ground at the head of the western road: the siege train. `uShed` 0 → 1. It does not come back, and it never moves again for the rest of the site. |
| 4.0–6.9 s | 0.24 → 0.52 | **Elongation** along the road. The mass stretches to 4.4× its resting length at constant total D — he is not getting smaller, he is getting longer. |
| 6.9–9.4 s | 0.52 → 0.79 | **Thinning**, then **飛白**: `uFeibaiGate` trips at stroke velocity 0.62, amplitude dropout begins, and the column goes ragged because velocity has outrun the brush's finite reserve. `uReserve` 1.0 → 0.18. |
| 9.4–12.4 s | 0.79 → 1.00 | **Ten.** `uSegments` 1 → 10. Ten pale marks where there was one, every one of them paler than the original, and **none able to re-concentrate, because D never decreases.** Two segments visibly drift toward each other and overlap into a wider, paler stain. That is the whole chapter in one gesture. |

Reed wipe #2: 180 → 85mm.

**DRY (t = 12.4 → 17.0 s).** Your own pale mark dries in 4.6 s — it was small and it was never wet for long. The enemy's ten dry over 9 s and are not yours to watch. The only place the sheet darkens meaningfully is at **Guiling**: a small, dense, terminal deposit where the head of the column meets ground that has been dry since before he started walking.

- Page density total for branch B: **+0.031** (reader 0.004 + his dispersion 0.019 + Guiling 0.008). Chapter exit at **0.180** — the act's ceiling, exactly, on the doctrinal path.
- Cost to the reader's own page relative to A: **less than a fifth.**
- **The ink that was spent was his, and he spent it on his own legs.**

**Audio outcome signature: NEITHER.** Chapter 6's B branch gets no bianzhong (there is no restraint here — you spent, you just spent someone else's) and no commit-synchronous expenditure hit. Instead the THREAT stem rises **+1.5 dB, arriving eleven seconds late**, during the dispersion, attached to no event of the reader's. The mix gets heavier and there is nothing to blame it on. This is the chapter teaching the reader, once, that THREAT is not a punishment meter — **it is a page-density meter**, and the page darkens whoever spilled the ink. *(New; a third outcome signature, used once in the site. Flagged for sign-off.)*

**Verdict copy — B (Historian, at M ≈ 0):**
> 致人而不致於人. This is the chapter, and it is 353 BC.
> Tian Ji proposed the other road. Sun Bin vetoed it from inside the cart in one sentence — *do not haul on the knot; strike the throat and pound the void* — and Qi went to Daliang instead. Wei abandoned Handan and force-marched home and was broken at Guiling by an army that had chosen the ground, the hour, and his condition on arrival. The manoeuvre has a name because of this campaign: **圍魏救趙**, besiege Wei to rescue Zhao.
>
> The full price is on the excavated slips and not in Sima Qian. To sell the picture, Sun Bin first threw two of his own city commanders at Pingling — a position he had already told Tian Ji was not takeable — in order to look like a fool worth chasing. Formlessness is not free and it is not clean. Somebody pays for the impression you are creating, and in 353 BC it was paid by men who were not told they were being spent.
>
> And the counter-case is the same road twelve years later. Pang Juan survived Guiling, ran it again at Maling, and did not survive that one. He was shaped twice by the same man. The second time, the arithmetic was cooking fires.

### 6.6 Resolution back into scroll

At M ≈ 0 on either branch the aperture opens **2.76:1 → 2.39:1** over 900 ms and the scroll pin releases. On branch B the crane, which never stopped, is already ~1.4 vh further along its spline than the scroll position implies; `craneS = max(scrollDrivenS, nodeRealtimeS)` means the reader's first scroll after the node produces **no camera movement at all for about 400 px**, because the camera has already been where they are going. Nobody will name this. Everybody will feel that they are behind.

On branch A the crane restarts on scroll, from a dead stop, with no ease — and it never recovers the arc it lost. Chapter 6 ends on branch A at world position `(−96, 14, +8)`: **higher, further back, and less far along than the doctrinal path.** You are further from the ground and you paid more for it.

---

## 7. SHADER & PARTICLE CALLOUTS

Costs at 1920×1080, M1 8-core GPU, high tier. Shared inventory items reference `direction-tech.md` §5.

| ID | System | Type | Key uniforms (range) | Visual outcome | Cost |
|---|---|---|---|---|---|
| **INK-1** | Ink field simulation *(shared)* | GPGPU, RGBA16F ping-pong 2048² | `uK` (0.140–0.156, 0.028–0.032), `uDt`, `uSizing`, `uFibre`, `uDeposits[8]` | The chapter's base physics. **Runs at 100% tile occupancy — see §8.** | 1.4 ms |
| **CH6-FLOW** | **Vorticity-advected ink** — the chapter's signature | GPGPU, 256² RG16F velocity target | `uPsiScale` 1.4–3.2 · `uPsiDrift` 0.006–0.020 · `uVort` 0.0–1.4 · `uAdvect` 0.0–0.90 · `uSinks[6]` (vec3: xy + strength) | Divergence-free 2D flow from the curl of a scalar potential `ψ = fbm3(uv·uPsiScale + t·uPsiDrift) + Σ sinks`, where each sink is a drainage basin as a negative potential well. Ink deposits are advected by this field **before** the bleed kernel runs. This is the shader that makes **避高而趨下** literally true: ink does not "look like" it runs downhill, it is solved downhill. | 0.35 ms |
| **CH6-WATER** | Water-surface distortion *(inventory #5)* | Screen-space material | `uRefract` 0.004–0.011 (paper-space UV) · `uScrollA` (0.011, 0.004) · `uScrollB` (−0.007, 0.009) | Dual-scrolling normal derivative from a 512² RG map, refraction offset applied in **paper-space UV, not screen space** — the distortion belongs to the substrate, not the lens. **No reflections. No Fresnel. No tint. No blue.** | 0.40 ms |
| **CH6-BACK** | Backlit transmission | Paper material term | `uBacklight` 0.70–0.92 · `uAbsorb` 2.6–4.2 | `L = uBacklight · exp(−uAbsorb·D) · (1 + uSwell·swell)`. Ink reads as **opacity against a lamp**. Replaces the reflected-light term for the whole chapter; the enemy's mass is the only opaque thing on screen. | 0.10 ms |
| **CH6-SWELL** | Fibre swell / saturated xuan | Normal perturbation | `uSwell` 0.0–0.35 · amplitude ∝ M² · direction along θ | The paper physically lifts where it is wet. The only reason the 4° rim light exists. Reads as a faint corduroy in the wet regions at grazing angles. | 0.15 ms |
| **CH6-SPLIT** | **Dispersion solver (十攻其一)** | 1D arc-parameterised stroke, CPU-driven, deposited via `uDeposits` | `uSplitPhase` 0→1 · `uSegments` 1→10 · `uShed` 0→1 · `uFeibaiGate` 0.62 · `uReserve` 1.0→0.18 | Redistributes per-sample density along a stroke's arc length at **constant total D**. He does not shrink; he widens. Feibai is amplitude dropout against the brush atlas G channel gated by stroke velocity. **Not a particle system.** | 0.08 ms |
| **CH6-RINGS** | Capillary rings | `Points`, 1,800 max, vertex-shader only | `k` 0.30–0.55 · lifetime 1.4–3.2 s | `r(t)=√(k·t)`, amplitude 1/r. **Writes into the M channel of the ink field, not into colour.** A particle system that exists only as a moisture perturbation — full Ink Law compliance, zero floating ink. | 0.12 ms |
| **CH6-MOTES** | Dark motes | `InstancedMesh`, 240 | advected by CH6-FLOW; `uMoteD` 0.06–0.14 | Single dark specks carried by the flow, showing the reader the gradient several beats before they are asked to use it. The chapter's only "tells". | 0.09 ms |
| **CH6-TIDE** | Tide-line ticker | Compute-on-read from the B channel | zero-crossing threshold `∂M/∂t` ±0.004 | Emits screen-space positional audio events and writes permanent bright hard-edged deposits. 11 events at Guiling; 34 on branch A. | 0.04 ms |
| **CH6-REMIX** | Remix operator *(branch A only)* | Ink field variant pass | `uRemix` 0.0–0.85 | Drives two overlapping density fields toward their local **mean** instead of their local **max**. **The only operation in the site allowed to reduce contrast without reducing D.** This is how a rout is rendered: identity lost, darkness kept. | 0.06 ms |
| **FOG** | Height fog, M-driven *(shared)* | 12-tap | `fog = 1 − exp(−h(z)·(0.22 + 0.9·M))` | At its site maximum for the whole chapter. **No god-rays.** | 0.70 ms |

**Chapter shader total: ≈ 3.5 ms**, inside the 4.4 ms high-tier envelope — but see §8, because the *occupancy*, not the instruction count, is the problem here.

**What Chapter 6 does not have, and must never acquire:** airborne particles of any kind, spray, mist sprites, smoke, embers, sparks, god-rays, lens flare, water caustics, reflections, or a blue channel doing any work whatsoever.

---

## 8. PERFORMANCE NOTES

### 8.1 The expensive thing

**The whole sheet is wet, and that defeats the ink field's tile-skip.**

Everywhere else in the site the ink simulation is sparse: most texels have M near zero, the sim runs a 16×16 tile occupancy pre-pass, and 70–85% of tiles are skipped entirely. Chapter 6 has **M ∈ [0.60, 0.75] across 100% of the sheet for 100% of its runtime.** Every tile is active every tick, and CH6-FLOW adds an advection pass in front of the bleed kernel.

| | Typical chapter | **Chapter 6** |
|---|---|---|
| Active tiles | 15–30% | **100%** |
| INK-1 effective cost | 0.25–0.45 ms | **1.40 ms** |
| + CH6-FLOW advection | — | **0.35 ms** |
| Sim cost at 60 Hz tick | ~0.4 ms | **1.75 ms** |

Compounding it: the fog is also at its maximum (density is a function of M), so the 12-tap fog is doing the most work it does anywhere, and DOF and fog overlap heavily in the same depth band. Chapter 6 is the most expensive **non-Chapter-12** chapter in the build and it contains almost no geometry, which is a useful thing for the team to internalise early.

### 8.2 Degradations

**Tier 2 — medium (Pixel 6a class, 45 fps floor, p90 ≤ 18 ms)**
- Ink FBO 1024², sim tick **30 Hz**.
- CH6-FLOW at half resolution (128²), bilinear-upsampled. The flow is quasi-static; the upsample is invisible.
- CH6-RINGS 1,800 → 600. CH6-MOTES 240 → 80.
- Fog 6-tap. CH6-WATER drops to a single scroll layer, `uRefract` halved.
- Reed clusters 3 → 1 (only the two wipe clusters at the node survive; the third is decorative).
- CH6-SPLIT's shed baggage becomes a **static decal** instead of a simulated deposit.
- **`uSegments` stays at 10 on every tier.** Segments are nearly free and they are the argument. A build that ships eight segments has shipped a different chapter.

**Tier 3 — low (2019 Intel MBP, 30 fps lock)**
- Ink FBO 1024² **RGBA8 packed**, sim tick 20 Hz.
- CH6-FLOW replaced by a **pre-baked 256² RG8 flow LUT** authored offline from the same ψ. Visually near-identical because the field is quasi-static; costs 64 KB and 0 ms.
- CH6-RINGS off — replaced by one summary ring per deposit.
- CH6-MOTES off.
- **CH6-WATER off entirely**, replaced by a static normal-derivative decal. The standing water stops moving. This is acceptable and arguably on-message: still water is 佚, and the reader loses an effect, not an argument.
- Fog analytic. No DOF, no bloom. Vermilion at Pingling gets its baked 3 px halo.
- Grain is **never** disabled on any tier. It is the substrate.

**Both branches, all tiers — the 180mm hold.** Beat 6.5-B is eleven seconds of a near-static frame. Drop the ink sim tick to **20 Hz on every tier** for its duration and spend the reclaimed budget on CH6-SPLIT. Nobody can perceive a 20 Hz bleed on a front moving at K∥ 0.148 UV-units/s, and it buys back ~1.1 ms at exactly the moment the chapter's most important image is on screen.

**Reduced motion.** Do not run the soak; cut to the dried state of the same information.
- The nine-beat crane becomes **nine fixed frames**, one per beat, crossfaded 240 ms.
- The node's 11-second dispersion becomes **five stills** — rest / shed / elongate / feibai / ten — held 1.6 s each.
- All tide-line ticks collapse to **one summary tick** per node branch.
- CH6-FLOW, CH6-RINGS, CH6-MOTES and CH6-WATER are all off. Retained: the seal, the Historian, the transition hit at half amplitude with the sub replaced by its tanggu component alone.
- **Everything the physics was saying is still legible in the stills**, because the physics was saying "ten, paler, and they cannot re-merge," and a still says that fine. If a reduced-motion pass loses the argument, the beat was decorative.

### 8.3 Memory and payload

| Asset | Format | Size |
|---|---|---|
| Heightmap | KTX2 R16, 1024² | 0.42 MB |
| Sizing + fibre (chapter overrides) | KTX2 UASTC, 1024², 2ch packed | 0.31 MB |
| Water normal-derivative | KTX2 RG, 512² | 0.09 MB |
| Daliang diorama albedo + AO | KTX2 ETC1S, 1024² | 0.24 MB |
| Reeds + causeway atlas | KTX2 ETC1S, 512² | 0.07 MB |
| Far range card | KTX2 ETC1S, 2048×512 | 0.11 MB |
| Flow LUT (low tier only) | KTX2 RG8, 256² | 0.06 MB |
| Geometry (causeways, diorama, cart, reeds) | glTF + meshopt | 0.25 MB |
| Glyph SDF (chapter-specific 篆書 + 行草) | MSDF atlas slice | 0.10 MB |
| Audio (Opus: sheng cluster stems ×10, rain-on-lacquer positional, guqin one-shots, narration) | Opus-in-WebM 48 kHz | 0.70 MB |
| **Total** | | **2.35 MB** — exactly the Act II allocation |

GPU-resident: 148 MB high / 96 medium / 61 low. Within the 180/110/70 ceilings.

**Watchdog note.** Suppress tier sampling for 1.5 s after the Ch5→Ch6 match cut, and again for 1.5 s after each reed wipe — a wipe swaps focal length and can trigger a shader variant compile if the DOF permutation differs. Pre-warm both focal-length variants during Chapter 5's accumulation phase, when the GPU has nothing to do for four viewport-heights.

### 8.4 Continuity decisions

- **The Ch5 → Ch6 transition claims one of the site's three match cuts on ink.** Canon reserved it; this document spends it. The last dense mark of Chapter 5's fall bottoming out at the base of the scarp **is** the first dense mark of Chapter 6 touching standing water — same position in frame, same D, same silhouette, different medium. It is the transition from 勢 to 虛實 and it is the single most available match in the thirteen. **Two match cuts remain for the rest of the site.**
- At that boundary the transition hit is **modified**: the Chapter 5 sub is allowed to run across the cut uninterrupted and only the tanggu transient fires. A sub glide says *new place*; a match cut says *same ink*. Departure from `direction-audio.md` §6, flagged for sign-off.
- **Ch6 → Ch7 handoff.** Act II closes at 0.180 (doctrinal) or 0.243 (branch A). Chapter 7 opens on the same sheet, and on the A path its first frame must be visibly, unmistakably darker than the story has earned. Do not "balance" it. That over-spend is the only record the reader has of a decision they made twenty minutes ago, and Act III is where they find out what it cost.

---

## 9. THE ONE IMAGE

> A single dense black brush-mark on wet cream xuan paper, splitting into ten pale grey strokes drifting apart, never rejoining. Paper backlit from behind, warm 3400K glow through the fibre; a flooded night delta rendered purely as ink wash; one thin causeway line; faint fibre swell at grazing light; two tiny cinnabar beads far right. Monochrome, pine-soot ink and aged paper only, no blue, 2.39:1.

---

## APPENDIX — DECISIONS THIS DOCUMENT MAKES THAT WERE NOT PREVIOUSLY SPECIFIED

1. **The enemy is never depicted while stationary.** The only image of him in the chapter is of him running, at 180mm, after the reader made him run.
2. **The whole board is never shown in Story.** 85mm establishes; the god view exists only in Codex, which makes Codex a genuine reward in this chapter rather than an apparatus.
3. **Sun Bin is never depicted.** The only named human in the site with no visual representation of any kind.
4. **The cart lives only inside the Historian's 40mm slip inset**, so it never enters the Story world — but its rain-on-lacquer sound source does. You hear him and never see him.
5. **The reed wipe** — two ≤200 ms foreground occlusions — is how the chapter reaches 180mm without a hard cut, preserving "no hard cut in Story before the node."
6. **The crane runs on a real-time clock through the scroll pin** (`craneS = max(scrollDrivenS, nodeRealtimeS)`), so the one moment the reader stops is the one moment the camera proves the tempo was never theirs.
7. **The 笙 cluster splits into ten detuned near-unisons at constant total energy** — dispersion as beating, not as volume.
8. **A third node outcome signature**, used once in the site: branch B gets neither restraint's bell nor expenditure's hit, but a THREAT rise arriving eleven seconds late with nothing to blame it on — teaching that THREAT is a page-density meter, not a punishment meter.
9. **`uRemix`** — the only operation in the project permitted to reduce contrast without reducing D — is introduced here as the rendering of a rout.
10. **Chapter 6 spends one of the site's three match cuts on ink** (Ch5 → Ch6), leaving two.
11. **`uSegments` = 10 on every performance tier.** The number is the argument, not an effect.
