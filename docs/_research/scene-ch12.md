# SCENE SCRIPT — CHAPTER 12 · 火攻 *Huǒ Gōng*
## THE WEAPON YOU CANNOT RECALL

**ACT IV — THE INSTRUMENTS (器) · chapter 12 of 13 · night ground (`html[data-ground='ink']`) · mode 商 shang on E**
Governed by `/docs/_research/manifesto.md` v1.0, `direction-tech.md`, `direction-audio.md`, `direction-ux.md`, `canon-12-13.md`. Every clause below is defensible from those; the two deliberate amendments are flagged **[AMENDMENT]** and need sign-off before build.

**Chapter length:** 9 beats = 900vh unresolved, 1100vh resolved (beat 7 is the node section, `--beats: 1 → 3`, growing below the reader at `scroll.atRest`).
**Ink budget:** enters at mean page density **0.41** (heavy reader) / 0.29 (light). Exits **0.54** on branch A, **0.44** on branch B. Act IV ceiling 0.55 is reached, if at all, in Chapter 13 — by design, at the end.

---

## 1. CHAPTER THESIS

> **THE DICTUM —** Fire is not a weapon you aim; it is a bet you place on the weather — and the only instruments in war that cannot be recalled are the ones you must therefore never light in anger.

**The directorial angle.** Every other chapter of this site is about *seeing in time*. Chapter 12 is the one chapter about **acting past the point where seeing helps.** Emotionally the scene is not a battle and not a spectacle: it is the twenty minutes after you have already won, in which you discover that winning was a physical process you started and cannot attend. The reader has spent eleven chapters learning that ink is the cost of being wrong. Here they learn there is a mark that goes on marking after the brush is lifted.

So the scene is staged as an **arrival, not an event.** Nothing explodes. The camera does one slow lateral move for the entire chapter and never gets closer, never cuts away, never catches up. The fire is already burning when the shot begins and is still burning when the shot ends, and the only thing the reader does is keep arriving at more of the same line. The intended feeling is not awe. It is the specific, unglamorous dread of watching a process that has stopped needing you — and then, in the coda, the flat administrative sentence that this is what anger buys.

**Why this chapter must end cold.** Chapter 13 is the detonation; Chapter 12 is the thing that has to be *left standing* for 13 to land on. If 12 resolves, consoles, swells or sums up, the closing argument has no floor. So the chapter ends with the fire out, the wind gone, the mix at digital zero, and a camera move that stops without completing.

---

## 2. THE ENVIRONMENT

**The set — a river gorge at night, from the opposite bank.** Left-handed Y-up metres. +X is downstream and screen-right.

| Element | Real 3D or painted plane | Spec |
|---|---|---|
| **Near cliff (camera side)** | 3D, ~4k tris | Runs the full rail as a foreground occluder at `z = +520`, y up to +180. Never lit. Reads as pure `--color-ink-950` silhouette; its only job is to bracket the frame and to eat 18–24% of the letterbox on the left third. |
| **Far cliff (camp side)** | 3D, ~14k tris | Rises from `y = 0` at `z = −40` to `y = +240` at `z = −180`. Displaced from a single 2048² height map; **it is the only geometry in the chapter that receives light.** Surface is unmodulated 濃墨 — the blackest terrain in the site — so the bottom light reads as an edge, not a texture. |
| **The river** | 3D plane, `y = 0`, `z = +40 → +320`, 1 quad | Not a material. It is a **hole in the ink field** — reserved paper `--color-paper-050`, the only clean white left at ground level in Act IV. Shader #5 distorts what is composited into it; nothing else. |
| **The far range** | Painted plane at `z = −900` | One 淡墨 wash, D ≤ 0.09, static, no parallax beyond the rail's own. It exists to give the smoke something to stain. |
| **The sky** | **Nothing. Bare paper.** | Above the ridge line the frame is unmarked substrate — the largest surviving region of 留白 in Act IV. There is no horizon and no atmosphere plane. This region is the chapter's emotional asset, and the smoke wash is going to take it. |
| **The camp — 七百里** | **Not in the 3D scene at all.** | The army is a single stroke in the ink field, composited in paper space per post stack step 4. There is no camp geometry, no tents, no figures, at any tier. This is the semantic-binding clause enforced as an asset decision: *armies are strokes, not meshes with ink textures.* |

**The stroke.** One continuous horizontal mark on the near edge of the far bank, laid in a single unbroken pass with no lift — 濃墨, D 0.72 at the core, width 0.011 UV, running past both edges of the frame. It is authored as one polyline of 1,400 world-metres sampled into the ink field's `uDeposits`, and it is drawn **once**, at beat 5, in 2.4 s of scene time, in a single stroke the reader watches land. Everything after that is what happens to it.

**Ink behaviour — 焦墨, charring.** The site's only state change in the ink, and it does not break monotonic D. Fire is **not light and lightens nothing.** Fire is accelerated **A**: the age field runs forward at ~120× inside a travelling front, so paper browns `--color-paper-100 → 200 → 400` and past it, while D at the front is driven **up** to a burnt maximum of 0.94 — charcoal is more carbon, not less. The camp stroke does not vanish; it **hardens**, loses its wet edge permanently, and its 4-octave FBM isocontour displacement is **frozen at the instant of char**, so the burnt boundary is jagged and final forever. Moisture is annihilated in a 0.04-UV band ahead of the front: **the fire dries the fog of war as it goes.**

**The lighting rig — the only bottom-lit shot in the site.**

| Light | Source | Kelvin (authoring only) | Notes |
|---|---|---|---|
| **KEY** | Travelling emissive strip co-located with the char front, `y = +2`, length 90 m, intensity ∝ `uBurnArea` (0 → 1 → 0.35) | ~1750 K | Everything in frame is uplit by the thing destroying it. Falloff inverse-square from y=2, so the far cliff is bright at its foot and black at its head. |
| **FILL** | Bounce off the river plane, −6 EV | ~2900 K | Neutral ink-ramp grey-green `#3E4A47`. **No cool fill exists.** |
| **RIM** | Smoke-backlit only: where the 淡墨 smoke wash crosses in front of the key, its leading edge catches | — | There is **no rim from above.** The moon in this chapter is a *calendar*, not a lamp: it never lights the scene. |
| **VOLUMETRIC** | Height fog #7, `uH0 = 6.0` (gorge-floor fog), `uM` read from the ink field | — | **Inverted behaviour: the volumetrics decrease as the fire advances**, because M is being annihilated. Normally fire means more atmosphere; here the fog of war burns off and you can suddenly see his whole line — and the reason you can see it is that it is burning. Act IV's first taste of the Chapter 13 sensation. |

**Grade constraint.** The Kelvin figures above are for falloff and relative intensity authoring only. Everything passes through AgX with hue locked to the four substances; any resulting hue outside ink / paper / gold / vermilion is clamped to the paper-aged ramp. **The bounce off the cliff is emphatically not gold** — gold is authority and expenditure, and this is neither. No god-rays (doctrine deletion, and #7 is fog-only). The single permitted specular in the chapter is the fire's reflection on the river: **the only time in the project reserved white carries a highlight**, permitted because that is the shot where the reader loses the clean page. After the front passes, the reflection has stained the water and it stays stained.

---

## 3. THE BEAT SHEET

### Index

| # | Beat | Norm. (of 900vh) | vh | Lens | Move |
|---|---|---|---|---|---|
| **12.1** | 燥 · THE AIR IS DRY | 0.000–0.111 | 0–100 | 24mm | hold, then rail-in |
| **12.2** | 五火 · THE FIVE FIRES | 0.111–0.222 | 100–200 | 85mm | five static insets, no move |
| **12.3** | 素具 · THE MEANS, READY | 0.222–0.333 | 200–300 | 40mm | slow push, 1.4 m |
| **12.4** | 箕壁翼軫 · THE FOUR MANSIONS | 0.333–0.444 | 300–400 | 24mm | crane down to rail height |
| **12.5** | 七百里 · SEVEN HUNDRED LI | 0.444–0.611 | 400–550 | 24mm | **the dolly begins** |
| **12.6** | 火發 · IGNITION | 0.611–0.722 | 550–650 | 24mm | dolly continues, unbroken |
| **12.7** | 上風 · THE QUIET CAMP *(node)* | 0.722–0.833 → grows to 1050 | 650–750 → 650–950 | 24mm → 85mm (A) / 24mm held (B) | LOAD→MARK→BLOOM→DRY→READ |
| **12.8** | 費留 · WHAT WAS LEFT LYING | 0.833–0.916 | 750–850 (→950–1050) | 180mm | one cut, reader-caused |
| **12.9** | 怒 · THE CODA | 0.916–1.000 | 850–900 (→1050–1100) | 24mm | **an unfinished move** |

---

### 12.1 — 燥 · THE AIR IS DRY

- **CAMERA.** 24mm (punitive scale, per jurisdiction). Position `(1420, 46, 610)`, target `(1240, 8, −40)`. **Move: HOLD**, 6 s of nothing, then a 40-metre rail-in on `--ease-drift`. Nothing in the frame moves except the fog.
- **VISUAL.** Cold open on the gorge with no fire and no stroke. Far bank is unread ground: `uM = 0.66`, `uD ≤ 0.12`, fog thick (`0.22 + 0.9·M` ≈ 0.81). Then the chapter's opening physical event: **M begins to fall on its own**, 0.66 → 0.48 over the beat, with no ink spent and no reader action. The fog thins because the season is dry. Uniforms: `uM_target 0.66→0.48`, `uDryRate 0.06/s`, `uWindGust 0.0`.
- **TYPOGRAPHY.** Chapter title block rewrites in the top silk by stroke-order redraw: 篆書 **火攻**, act numeral 四 in gold hairline, `THE WEAPON YOU CANNOT RECALL` in apparatus grotesque, tracked, `--text-micro`. In-frame: nothing.
- **AUDIO.** TERRAIN crossfades over one viewport-height: river at 34 m, wind *absent*. THREAT at `−30 + 26·0.41 = −19.3 dB`. **The absence of wind is the sound design.** Bed low-shelf flat.
- **INTERACTION.** None. Scroll only.

### 12.2 — 五火 · THE FIVE FIRES

- **CAMERA.** 85mm (the named factor). **Five static inserts, no camera move at all** — the lens holds and the *subject* changes beneath it, like plates laid on a table.
- **VISUAL.** Five 濃墨 marks land in sequence on bare paper, in the frame's optical centre, one per 20vh, each drying before the next: 火人 (a cluster of small strokes), 火積 (a solid block), 火輜 (a chain of linked marks), 火庫 (a walled square), 火隊 (**an incomplete mark — a stroke that stops mid-pass**, because the reading is disputed). Each stamps via `uDeposits[n]`, blooms at `K∥ 0.12`, dries in 5 s, leaves a tide line. Ink cost: +0.004 total.
- **TYPOGRAPHY.** THE TEXT, 楷書, vertical RTL at the right third: the five-fire line. Translation in editorial serif on the horizontal baseline, ≤24 words, optical centre. The fifth mark carries a jade hairline leader into the margin — cognition, not danger — reading `disputed`.
- **AUDIO.** Text protocol: bed to −∞ 180 ms before the first stroke; one guqin 泛音 per mark at −26 dB; brush-on-paper granular, noise band 800 Hz → 4.1 kHz; +600 ms of silence after the last stroke dries. No music.
- **INTERACTION.** None.

### 12.3 — 素具 · THE MEANS, READY **(the node's LOAD, four beats early)**

- **CAMERA.** 40mm — the Historian's lens, level, human-scaled. Slow 1.4 m push on `--ease-soak`. The frame is a table: an inkstone, a brush, a bundle of straw, in bronze-and-lacquer material culture.
- **VISUAL.** This is the **LOAD phase of the decision node, executed 450vh before the MARK.** The reader must press and hold for 900 ms. The brush enters the water, the bristles darken and swell, and the loaded brush is then **parked in the top silk bar as a charged state indicator for the next four beats** — the only persistent HUD element the chapter adds. Uniforms: `uBrushCharge 0→1` over the hold, `uBristleWet 0→1`, `uReserve = 1.0` (the finite reserve that later governs 飛白).
- **TYPOGRAPHY.** THE TEXT, 楷書: 行火必有因，煙火必素具。 Then the Commander, tracked small-caps jade, 行草 on 素具: one line.
- **AUDIO.** 900 ms of bristle-in-water, positional, at the reader's own head position (`azimuth 0°, 0.4 m`). No drum yet. This is the *only* pre-node foley in the chapter.
- **INTERACTION.** **Press-and-hold to load. Skippable.** If the reader scrolls past unloaded, Option A at beat 12.7 is rendered **foreclosed** — present, legible, reason stated (`無因 — you did not lay the straw`), not silently removed. The reader may scroll back and load: `tCamera` is bidirectional, review is always legal, and **preparation costs M, not D, so going back to prepare spends nothing.** You may not undo a stroke; you may always go back and be ready.

### 12.4 — 箕壁翼軫 · THE FOUR MANSIONS

- **CAMERA.** 24mm. Crane down from `y = 118` to rail height `y = 46` over the beat, `--ease-drift`, target locked on the far bank.
- **VISUAL.** The chapter's one genuinely didactic beat, and it is didactic about a *substrate property*. Four notches of reserved white appear on the ridge line at regular intervals — **the mansions as voids, not as stars.** Then the paper's own fibre direction becomes briefly visible: `uFibreDebug 0→0.35→0`, a 2.6 s reveal in which the anisotropy field θ (±14° wander) is drawn as a faint grain across the whole frame, running left-to-right. **The wind in this chapter is not a world force; it is the grain of the paper.** `uWindDir` is bound to θ for the rest of the chapter. Reading the almanac and reading the grain are the same act, and the reader is shown it once, then never again.
- **TYPOGRAPHY.** THE TEXT, 楷書 vertical, the calendar line in full. The Historian's first passage in the margin under a hairline rule — apparatus grotesque, 64ch, ragged right, **never inside the frame** — on the mansions being an almanac and not an omen, with the forward reference to Chapter 13's ban on spirits sealed in gold.
- **AUDIO.** Wind arrives for the first time in the chapter, at −31 dB, positional off the ridge at azimuth −40°. 簫 is **not** used (wrong act). Historian at +25°, 1.2 m, catalogue delivery, 8% wet.
- **INTERACTION.** None. The fibre reveal is automatic and unrepeatable in Story; it is re-inspectable in Codex.

### 12.5 — 七百里 · SEVEN HUNDRED LI

- **CAMERA.** 24mm. **THE DOLLY BEGINS AND DOES NOT STOP UNTIL BEAT 12.9.** Lateral, screen right-to-left, world −X at 3.1 m/s of scene time, fixed at `z = +520`, `y = +46`, target offset `(−180, −38, −560)` — a constant distance across the water, forever. Easing: none. It is linear, because a rail with easing is a shot with an opinion, and this shot has none.
- **VISUAL.** The stroke is laid: one unbroken pass, 1,400 m, 2.4 s of scene time, no lift, D 0.72. **It reads as a brushstroke before it reads as an army, and that is the argument.** As it lands it bleeds anisotropically along the fibre — which is to say, along the wind — `K∥ 0.14`, `K⊥ 0.026`, and dries in 9 s to a hard final edge with a tide line at both margins. Ink cost +0.021 (unavoidable; it is the enemy's expenditure, not the reader's — the Historian says so). Fog now 0.48 M and falling.
- **TYPOGRAPHY.** No Text. The Historian carries the vignette here (see §5), his passages entering in the lower silk in three blocks of ≤ 58 words, each held for ~14 s, leaving by **erasure of the rule first, text second** — apparatus may leave, ink may not.
- **AUDIO.** Wind up to −24 dB and **holding** (晝風久 — the day wind lasts). River bed. **二胡 erhu, first of its three site-wide appearances, enters at −27 dB on a single sustained tone in 商, no vibrato.** It is here because the cost is about to be measured in people. No percussion.
- **INTERACTION.** None. The reader may scroll back and re-watch the stroke land; `tInk` does not decrease, so it lands only once.

### 12.6 — 火發 · IGNITION

- **CAMERA.** 24mm, same rail, unbroken, same speed. **No cut. The camera cannot outrun it, cannot get closer, and cannot look away.**
- **VISUAL.** Fire enters the stroke at one point and then travels **along** it — not spreading outward like a fire, but running like ink up a fibre, because it is a stroke and strokes conduct. The char front is **frame-locked at screen-x 0.78** (`uCharFrontWorldX = camX + 220`, plus ±40 m of FBM wander so it breathes), which is how "you cannot outrun it" is implemented rather than merely asserted. Behind the front: `uAgeRate 120×`, paper browns past `--color-paper-400`, `uCharD → 0.94`, FBM displacement frozen at the char instant. Ahead of the front: `uMKill` annihilates M in a 0.04-UV band, so **fog retreats and his whole line becomes visible.** Embers spawn at the front (see §7), advected by `uWindDir` — **not by gravity** — and they land, and each landing writes a permanent char pit into `uDeposits`. Smoke is 淡墨 advected across the paper above the stroke: a wash, not a particle system, and where it crosses the ridge it lays a tide line into the reserved white sky that never comes out.
- **TYPOGRAPHY.** THE TEXT, 楷書 vertical, the upwind line — 火發上風，無攻下風。晝風久，夜風止。 It is the last Text before the node, and it is the instruction the node will test.
- **AUDIO.** Fire layer, the only stem permitted to exceed the THREAT ceiling (by up to 5 dB): 30–80 Hz roar, 200–900 Hz body, 2–9 kHz crackle grains whose spawn rate tracks `uBurnArea`. **嗩吶 suona — one of exactly two appearances in the site — one held note that cracks at the top of its envelope**, at the moment the fog clears and the line becomes visible. Erhu holds under it. Then the suona is gone and does not return.
- **INTERACTION.** None. The node arms at `chapterProgress ≥ 0.62`: the letterbox bars begin growing, which is the reader's first warning.

### 12.7 — 上風 · THE QUIET CAMP **(the decision node)** — full spec in §6

- **CAMERA.** LOAD: aperture 2.39 → 2.76 over 700 ms on `--ease-silk`; **one cut, caused by the reader arriving**, to node framing (24mm held, rail stopped). MARK/BLOOM: tracks, never cuts. Branch A adds the chapter's second and last cut, to 85mm, across the water. Branch B never cuts again.
- **VISUAL / AUDIO / INTERACTION.** §6.
- **TYPOGRAPHY.** Commander only during presented/hover. Historian's verdict is legal **only at M ≈ 0**, in the margin, under a hairline rule.

### 12.8 — 費留 · WHAT WAS LEFT LYING

- **CAMERA.** **180mm — the enemy, and only the enemy.** One cut, fired by the reader scrolling out of the node. Compressed across the valley at 6.5× listener distance. At 180mm the burning line finally resolves into people, and this is the first and last time the reader sees that.
- **VISUAL.** No new ink from the reader. The char front has run out of frame; what remains is the aftermath field — burnt stroke at D 0.94, the reader's own char pits, the smoke tide line on the ridge, the stained river. **Vermilion beads land on the stroke, one per name**, at ~2.5× viscosity and 0.4× bloom, sitting proud of the surface and never blending: the casualty list rendered as cinnabar that will not dissolve into the gloom. Six beads. `uBeadCount 0→6`, `uBeadViscosity 2.5`, `uBloomMask` on.
- **TYPOGRAPHY.** Historian, margin: the named dead and the defectors, as an inventory, with the source cited and sealed in gold. Then the reserve line — 費留 — with its dispute stated aloud, not silently resolved. THE TEXT, one line, 楷書, small: 水可以絕，不可以奪。
- **AUDIO.** 180mm spatial law: listener does not move; enemy sources frozen at 6.5×, width 18%, low-passed 1.8 kHz, **no reverb send from the reader's room.** Fire drops to a distant floor. Erhu's third and final phrase, then out. Each bead lands with an 8 ms tide tick at 5.6 kHz, −24 dB, panned to its screen position — six ticks, and they are the last discrete sounds in the chapter.
- **INTERACTION.** None.

### 12.9 — 怒 · THE CODA

- **CAMERA.** 24mm. The rail resumes — and **stops at 62% of its programmed travel and does not complete.** `--ease-tide` (stop without a cadence). The only unfinished camera move in the site. **[AMENDMENT 1]** — it is not a doctrine violation (rails only, no roll, no orbit) but it is a deliberate breach of shot grammar and should be signed off as such.
- **VISUAL.** The fire is out. `uEmberCount → 0` over the first 2 s, `uBurnArea → 0`, `uWindGust → 0` (夜風止 — the night wind stops), fog analytic and static, M = 0 across the entire frame. Nothing moves. The last motion on screen is the smoke tide line finishing its crystallisation on the ridge, and then that stops too.
- **TYPOGRAPHY.** The coda, in three movements: (a) THE TEXT in 楷書, the ruler-and-general lines; (b) **the two irreversibility clauses set in gold** — hairline, dry, catching light, laid directly on the ink the reader just spent; (c) the closing line in ink, 楷書, small, low in the frame. **No Historian sign-off. No Commander. No summary. No aperture change** — the letterbox stays at 2.39:1 with the bars at their grown height.
- **AUDIO.** **6.0 s of digital zero** (an extension of silence rule 4, the 700 ms owed to every cut away from contact, priced up because this contact was longer). Then nothing. No bianzhong, no guqin, no bed return. The chapter ends in a room the reader will assume is broken, and the visual is still enough that it is not.
- **THE BOUNDARY INTO 13. [AMENDMENT 2]** — the 12→13 transition hit fires to spec **with its tanggu doubling omitted**. Doctrine places the tanggu transient 8 ms *ahead* of the sub so the ear gets the event before it gets the weight. Removing it means the ear gets the weight with no event. That is 死者不可以復生 in the mix, and it is the only boundary in the site permitted this. The sub glide (46 → 31 Hz, 900 ms) is unchanged; the ducking sidechain finds nothing to duck, because the mix is already at zero.
- **INTERACTION.** None. The bamboo slip stamps: **vermilion dot** if the decision spent ink, **gold dot** if it restrained.

---

## 4. THE SCENE SCRIPT

**Voice keys.** 【經】 THE TEXT — written, never spoken, 楷書 vertical RTL, translation in editorial serif on the horizontal baseline. 【史】 THE HISTORIAN — apparatus grotesque, margin, under a hairline rule, the only human voice. 【將】 THE COMMANDER — tracked small-caps jade, 行草 on the operative term, no voice at all; a drum, a slip set down, a seal.

---

**12.2 —**

【經】 凡火攻有五：一曰火人，二曰火積，三曰火輜，四曰火庫，五曰火隊。
*Fán huǒ gōng yǒu wǔ: yī yuē huǒ rén, èr yuē huǒ jī, sān yuē huǒ zī, sì yuē huǒ kù, wǔ yuē huǒ duì.*
> There are five things to burn. Men in their camp. Grain in store. The baggage train. The arsenal. And a fifth.

【史】 The fifth is 火隊 and we do not know what it says. The received character supports *supply routes* and it supports *fire dropped onto formations*, and the commentaries do not agree, and neither do the excavated slips help us here. Four of these are things. The first is people. The list is in that order for a reason, and the reason is not squeamishness — it is that men in camp burn fastest.

---

**12.3 —**

【經】 行火必有因，煙火必素具。
*Xíng huǒ bì yǒu yīn, yān huǒ bì sù jù.*
> To use fire there must be a cause. The materials must already be in your hands.

【將】 **Load the brush now.** You will not be given time later. **素具** — *ready beforehand* — is not advice about logistics. It is the sentence that decides whether you have a choice at all in an hour.

---

**12.4 —**

【經】 發火有時，起火有日。時者，天之燥也；日者，月在箕、壁、翼、軫也。凡此四宿者，風起之日也。
*Fā huǒ yǒu shí, qǐ huǒ yǒu rì. Shí zhě, tiān zhī zào yě; rì zhě, yuè zài Jī, Bì, Yì, Zhěn yě. Fán cǐ sì xiù zhě, fēng qǐ zhī rì yě.*
> There is a season for it and there is a date for it. The season is when the air is dry. The date is when the moon stands in the Winnowing-Basket, the Wall, the Wing, or the Chariot-Board. On those four, the wind gets up.

【史】 Four of the twenty-eight lunar mansions, which is to say four positions on a calendar. This passage is quoted more often than any other in the chapter and almost always as decoration — the ancient general reading omens. It is the reverse. One chapter from here the same book will forbid you outright to take foreknowledge from spirits. The moon is being used as a date-keeping device for seasonal wind, and reading it as mysticism gets the book exactly backwards. Whether the correlation holds is a separate question; the received commentaries assert it and do not derive it, and neither will I.

---

**12.6 —**

【經】 火發上風，無攻下風。晝風久，夜風止。
*Huǒ fā shàng fēng, wú gōng xià fēng. Zhòu fēng jiǔ, yè fēng zhǐ.*
> Light it from windward. Never attack downwind. A wind that gets up in daylight will hold. One that gets up at night will drop.

---

**12.7 — the node.** Copy in §6.

---

**12.8 —**

【史】 The list, from the Sanguozhi. Feng Xi, dead. Zhang Nan, dead. Shamoke — chieftain of the Wuxi Man, who brought his people four hundred miles into somebody else's revenge — dead. Du Lu and Liu Ning surrendered. Fu Rong held the rear, was offered terms, answered with an obscenity, and died. Huang Quan, cut off on the north bank with the road home on fire behind him, walked his entire command into Wei, because there was nowhere else on the earth to walk it.

【史】 The chapter has a line for what happens after this, and the line is disputed. 夫戰勝攻取，而不修其功者凶，命曰費留 — to win the battle, take the objective, and then fail to *xiū qí gōng*, is calamitous, and the name for it is *fèi liú*. 修其功 has been read as *consolidate the gain*, as *reward the men who won it*, and as *finish what the campaign was for*. 費留 has been read as *expenditure left lying* and, by Giles, as *stagnation*. I will not pick one for you. What every reading has in common is that the fire is not the end of the transaction, and somebody is still paying.

【經】 水可以絕，不可以奪。
*Shuǐ kě yǐ jué, bù kě yǐ duó.*
> Water can cut a thing off. It cannot take it away.

---

**12.9 — THE CODA.**

【經】 主不可以怒而興師，將不可以慍而致戰。合於利而動，不合於利而止。
*Zhǔ bù kě yǐ nù ér xīng shī, jiàng bù kě yǐ yùn ér zhì zhàn. Hé yú lì ér dòng, bù hé yú lì ér zhǐ.*
> No head of state sends an army because he is furious. No commander gives battle because he has been slighted. Move when it pays. Stop when it does not.

【經】 *(in gold, hairline, dry, laid on the ink just spent)*
怒可以復喜，慍可以復悅；亡國不可以復存，死者不可以復生。
*Nù kě yǐ fù xǐ, yùn kě yǐ fù yuè; wáng guó bù kě yǐ fù cún, sǐ zhě bù kě yǐ fù shēng.*
> Wrath turns back to joy. Pique turns back to pleasure.
> A destroyed state does not come back into existence. The dead do not come back to life.

【經】 *(ink, small, low in frame)*
故明君慎之，良將警之。此安國全軍之道也。
*Gù míng jūn shèn zhī, liáng jiàng jǐng zhī. Cǐ ān guó quán jūn zhī dào yě.*
> So the intelligent ruler is careful and the good general is wary. This is how a country is kept whole and an army kept intact.

*Nothing follows. No voice, no bell, no bed. Six seconds of zero, and then Chapter 13.*

---

## 5. THE HISTORICAL VIGNETTE

### SEVEN HUNDRED LI OF STRAW
**Yiling and Xiaoting, on the Yangtze below the gorges · the sixth month of 222 · sources: *Sanguozhi* (Xianzhu zhuan, Lu Xun zhuan, Wen Di ji) and *Zizhi Tongjian* ch. 69**

The heat arrives in the fourth month and it does not leave.

Liu Bei is sixty-one years old and he has come down the river to kill Sun Quan, and everyone in three states knows exactly why. Guan Yu's head went north to Cao Cao in a box. Zhang Fei never got out of camp — two of his own officers murdered him in his tent and carried his head downriver as a present to Wu. The Emperor of Han, crowned three months, is prosecuting a family matter with a state. His officers tell him no. His court tells him no. He comes anyway, and Wu gives him the ground.

Lu Xun is thirty-nine and nobody in Wu wants him. He is a staff man, a marriage-alliance man, an administrator; Han Dang and the other Sun-family veterans have been killing people since before he could shave, and now they have to take his orders, because Sun Quan handed him the staff of authority in front of them. His first order is to retreat. His second order is to retreat further. He gives up the passes. He gives up several hundred li of river. He stops on ground he has chosen himself.

And then he does the difficult thing, which is nothing at all, for close to half a year.

His generals petition him. Liu Bei sends men to the palisade to jeer, and when that fails he puts a detachment out in the open plain as bait, so plainly that Lu Xun will not discuss it. *He came in fresh and fast,* he tells them. *You do not meet that. You let the river summer work.*

The river summer works. The Shu army has come four hundred miles into gorge country that has no width in it. Since spring the men have stood under armour on hot rock. By the sixth month Liu Bei brings the marines up out of the boats, because the water has become unbearable and the shade is inland, and he puts them into the woods. The terrain gives him no room to concentrate. So he strings his positions along the only line the ground allows: camp after camp after camp, wood and thatch, from Wuxia and Zigui down to Yiling. Later they will count it at seven hundred li.

In Luoyang, Cao Pi reads the dispatch describing this and sets it down. *Liu Bei does not understand war,* he says. *Whoever encamps across seven hundred li of gullies and marsh and broken ground is taken by his enemy. This is forbidden.* He tells his court to expect news from Wu. It arrives in about a week.

Lu Xun tries one camp first, and fails, and is told he has spent men for nothing. He says: now I know how to break them.

He orders every soldier to carry one bundle of straw.

The wind that comes up is the ordinary wind of a river gorge on a hot night. The camps are thatch. And they are not a chain of camps — they are one camp seven hundred li long, which is a different object, and fire entering it at a single point does not have to be carried anywhere. It simply proceeds.

Everything the sources give us afterward is a list, and the list is the point. Feng Xi dead. Zhang Nan dead. Shamoke dead. Du Lu and Liu Ning surrender. Fu Rong holds the rear, is offered terms, and answers with an obscenity about dogs, and dies. Huang Quan, cut off on the north bank with the road home burning behind him, walks his command into Wei because there is nowhere else on the earth to walk it. Liu Bei goes up through the hills to Baidicheng with the fire behind him and says, to nobody in particular, *that I should be humiliated by Lu Xun — is this not Heaven?*

It is not Heaven. It is thatch, drought, a gorge, and a man who waited.

Liu Bei never comes down the river again. He dies at Baidicheng the next spring. The alliance he burned in order to punish is rebuilt within eighteen months by other men, on the same terms it had before he started — because the terms were always correct, and the only thing that had ever been wrong with them was how he felt.

Wrath turns back to joy. The dead do not turn back into the living.

**Record versus legend, in one line.** The cause, the murder of Zhang Fei by his own officers, Lu Xun's appointment over furious objection, the months of refusal, the chain of camps, Cao Pi's recorded prediction on hearing of it, the failed probe, the order that every man carry a bundle of straw, the fire, the named dead, Huang Quan's defection and Liu Bei's death at Baidicheng in 223 are all in the third-century record; the 700,000-strong host, Zhuge Liang's stone maze, and every scene of personal duelling are Ming-dynasty *Romance of the Three Kingdoms* and appear nowhere in it.

### How it is staged

**Occupies beats 12.5 → 12.6, and its casualty list resolves at 12.8.** Depiction: **not** a diorama, **not** silhouette theatre, **not** a map. It is the stroke. Lu Xun and Liu Bei are never depicted, never named on screen in the frame, and have no avatars — they exist only in the Historian's margin copy. The dramatic content is carried by exactly three objects: one continuous brushstroke, one travelling char front, and six beads of cinnabar.

The Historian's blocks are cut to the dolly, not the reverse: three blocks in 12.5 (the arrival, the waiting, the seven hundred li), one in 12.6 (Cao Pi's dispatch, delivered flat, as a document being read aloud), and the inventory in 12.8. He never speaks over the Text and never during the node.

**Scoring.** 12.5 is erhu alone at −27 dB over wind and river — the one instrument in the palette that sounds like a human voice, rationed to the places where the cost is counted in people. 12.6 adds the fire layer and the single suona note that cracks. 12.8 removes everything except the frozen 180mm enemy bed and six tide-line ticks. Nothing in the vignette is scored with percussion, because the reader did not do any of it.

---

## 6. THE TACTIC DECISION NODE — 「上風」 THE QUIET CAMP

**Phases:** LOAD *(executed at beat 12.3)* → MARK → BLOOM → DRY → READ. Analysis legal only at M ≈ 0.

**LOAD (already done, or not).** The brush was loaded four beats ago and has been sitting charged in the silk bar ever since. At `presented`, everything ducks 6 dB over 700 ms, the aperture tightens 2.39 → 2.76 (bars grow; that growth is the warning), **stereo width closes 100% → 46%**, one tanggu at −14 dB, bed low-shelf +2 dB below 90 Hz. One cut fires — caused by the reader arriving, not by scroll position.

**THE SITUATION —【將】the Commander, tracked small-caps jade, 行草 on the operative terms, no voice:**

> Your fire is inside his camp. You did not have to reach it. You paid a man to carry it, and he is still in there.
> The thatch is going. The wind holds off your bank and by the text it will hold until dawn.
> **His camp is not screaming.** No drums. No horses. His men are walking, not running.

| | **OPTION A — 早應之於外** | **OPTION B — 待而勿攻** |
|---|---|---|
| **Label** | **GO NOW.** | **HOLD ON THE BANK.** |
| **Commander's line** | Cross while the fire is still working for you. The text is explicit: when fire breaks out within, respond at once from without. | The text is also explicit: if fire breaks out and his troops stay quiet, wait and do not attack. Let it reach its height and read what his line does when it has nothing left to lose. |
| **Hover audio** | Paigu head, palm at centre, 110 Hz damped, 180 ms, −20 dB | **The same drum, the same hand, at the rim.** 240 Hz, 140 ms, −20 dB |
| **Hover preview** | 淡墨 at 0.35 of final D into the preview buffer, never accumulated. Equal area, equal weight, equal level to B. | Identical treatment. **Nothing brightens for the "right" answer.** |
| **Foreclosed if unloaded** | Yes — rendered as `無因 · you did not lay the straw`, reason stated, scroll back to 12.3 and load. | No. Waiting never requires materials. |

*Both options are literally sanctioned by different sentences of Chapter 12. The discriminator is not the doctrine. It is whether the reader believed the silence.*

**COMMIT.** The seal, `start(ctx.currentTime + 0.005)` synchronously in the pointer handler, then **400 ms of true silence.** The mix is emptied and the reader hears their own room. That gap is the price of the stroke.

### Branch A — GO NOW

- **MARK (0.0–0.6 s).** Aperture snaps 2.76 → 2.39 on a hard cut. **The camera crosses the water — the first and only time in the chapter.** The reader loses the far bank, loses the 24mm, and is put inside the smoke at 85mm with a 0.6 s focus pull that never fully resolves (`uFocusDist` 46 → 11 m, CoC floor clamped at 2.1 px so it never lands).
- **BLOOM (0.6–4.2 s).** The 淡墨 smoke wash floods the frame and **remixes**: per Ink Law disturbance three, water and wash cost identity, so the reader's high-D stroke and the enemy's high-D stroke grey into one another and neither is ever legible again. `uRemixRate 0.0→0.42`, `uIdentityLoss 0→1`. **You cannot tell your men from his men, because that is what attacking downwind into your own fire actually is.** The char front reverses across the reader's own crossing point (`uCharFrontDir −1`). Two of the reader's earliest 飛白 strokes from Chapter 7, still on the scroll, are overrun and greyed — persistent, cross-chapter, and they do not come back.
- **DRY (4.2–9.7 s, 5.5 s).** Fast, because there is nothing left to be contingent about. Mean density **+0.09 in one beat — the largest single deposit in Act IV.** Tide lines: 11.
- **AUDIO.** Drum, then metal, then nothing. THREAT is raised **+1.5 dB permanently for the remainder of the session** and is never lowered.

### Branch B — HOLD ON THE BANK

- **MARK.** **No cut at all.** The camera holds its rail and keeps dollying. The aperture stays at 2.76:1.
- **BLOOM (0.0–11.0 s).** Eleven uncomfortable seconds of real time in which the char front runs the full remaining length of the stroke and the drying clock runs down. `uM → 0` across the entire far bank.
- **DRY / the reveal.** What emerges as the moisture leaves is what the fog was hiding: **the sizing.** Per Ink Law 7, S renders as nothing and is visible only where ink refuses to go — and now, in the dry, **three hard voids appear in the burning line at regular intervals.** Prepared positions. He was quiet because he was ready. `uSizingReveal 0→1` over 2.2 s, `--ease-tide`.
- **COST.** +0.01 — the smallest deposit in Act IV. The three voids are added permanently to the reader's scroll **as reserved white they did not have to spend to find.** That is the only mechanism in the site by which the page gets *more* white, and it is not a reversal of monotonic D: nothing lightened. Ink simply never went there, and the reader now knows it.
- **AUDIO.** Metal, not drum: one bianzhong 正鼓, **6–9 s of protected decay**, and the duck does not release until the tail passes −48 dB. No music, no bed swell, no reward tone. **The reader must wait out the bell.** Then the fire finishes on its own and the ground has already been decided.

### READ — the verdict *(legal only at M ≈ 0; the Historian may not speak before the last tide tick)*

【史】 Sun Tzu gives you both instructions and puts the condition between them: 火發而其兵靜者，待而勿攻 — *if the fire breaks out and his troops are quiet, wait and do not attack.* A camp that burns without panicking is a camp that knew. The five 變 of this chapter are not a decision tree with one exit. They are a demand that you keep reading the enemy *after* your plan has worked, which is the exact moment nobody does it.

**On A —** 【史】 Liu Bei's officers had been begging for an engagement for months, and he obliged them by pushing his line into a gorge where the enemy would not meet it. When the fire came, the Shu army attacked into its own burning encampment to save it. The record of what followed is not a battle report. It is an inventory. *(Sanguozhi; Zizhi Tongjian ch. 69.)*

**On B —** 【史】 Lu Xun did exactly this for roughly six months while men with thirty years' more service called him a coward, and then did it again in the hours after the fire: he did not pursue to Baidicheng, over furious objection, because Cao Pi's armies were massing behind him and a pursuit would have paid for a corpse with a country. *(Sanguozhi, Lu Xun zhuan.)* Waiting is the whole of what he did, twice, and it is the only reason there was still a Wu in 223.

**Resolution back into the scroll.** At `atRest`, the node section grows 1 → 3 beats *below* the reader, so nothing shifts. The aperture opens 2.76 → 2.39 over 900 ms on `--ease-silk`; the cord returns showing the new density; the slip takes its mark — **vermilion dot for A, gold dot for B.** Then the reader scrolls forward into 12.8, and that forward scroll is what fires the 180mm cut. **The branches never reconverge:** A ends with the reader's own marks greyed and unreadable; B ends with three permanent voids in the sheet. There is no shared footage after the seal.

---

## 7. SHADER & PARTICLE CALLOUTS

| # | Program / system | Key uniforms | Technique | Visual outcome | Cost (M1, 1080p) |
|---|---|---|---|---|---|
| **1** | Ink field sim *(resident singleton, shared)* | `uPrev, uSizing, uFibre, uWind, uK, uDt, uDeposits[8]` | RGBA16F ping-pong, R=D G=M B=tide/age A=S. `uWind` bound to `uFibre` θ this chapter. | The stroke, the bleed, the tide lines, the sizing voids | 1.4 ms @ 2048² |
| **12-A** | **焦 CHAR FRONT** *(new; a mode of #1, not a second field)* | `uCharFrontWorldX, uCharWidth (0.018 UV), uAgeRate (120×), uCharD (0.94), uMKill (0.04 UV), uFreezeFBM` | Travelling band; behind it A runs forward and D is driven up by monotonic max; ahead of it M is annihilated; FBM isocontour displacement is latched per-texel at the char instant | Paper browns past `--color-paper-400` and hardens; the burnt boundary is jagged and **permanent**; the fog burns off ahead of the fire | +0.35 ms |
| **12-B** | **EMBER / SPARK, GPGPU** *(the only system in the build crossing to GPGPU; the only embers anywhere)* | `uPos, uVel, uLife, uRamp, uWindDir, uSpawnRate, uBloomMask` | 256² = 65,536 particles in two RGBA16F targets via the shared `FBOSim`; point sprites, `pow(1-r,3.0)` falloff on a vermilion ramp; **advected by wind, never by gravity**; writes to the MRT bloom mask so these and nothing else bloom at 0.4× | Vermilion cores beading proud of the surface, never blending into ink; peak screen coverage **1.7%**, full-saturation **< 0.6%** (3% frame cap held) | 0.5 ms @ 65k |
| **12-C** | **EMBER LANDING → DEPOSIT** *(new; the only particle system in the site that writes to D)* | `uLandBuffer, uPitRadius (0.0016 UV), uPitD (0.61), uPitBudget (240)` | Landed embers are read back into a small deposit buffer and stamped into #1's `uDeposits`, keyed `(beat, particleId)` so scroll-back is idempotent | Each landed ember is a **permanent char pit** that persists in the reader's scroll to the end of the site | +0.2 ms amortised |
| **12-D** | **SMOKE WASH** *(not a particle system — doctrine)* | `uSmokeD (0.16), uAdvect, uCeiling` | 淡墨 deposited at the front and advected by the wind field across the paper *above* the stroke; obeys the Ink Law in full | A wash that stains the reserved-white sky and lays a **tide line at the ridge that never comes out** | folded into #1 |
| **5** | Water-surface distortion | `uNormal, uFlow, uAmp, uEmberLut` | Dual-scrolling normal derivative, 512² RG, refraction offset in paper-space UV. **No Fresnel tint, no blue.** | The fire's reflection on the river — the one permitted specular on reserved white — and the stain it leaves | 0.4 ms |
| **7** | Height fog | `uDepth, uM, uH0 (6.0)` | `fog = 1 − exp(−h(z)·(0.22 + 0.9·M))`, M read from the ink field | **Inverted:** volumetrics *decrease* as the fire advances, because the fire is killing M | 0.7 / 0.35 / 0.05 |
| **12-E** | **SIZING REVEAL** *(branch B)* | `uSizingReveal, uVoidEdge` | Reads #1's A channel (S); at M ≈ 0 the three prepared positions resolve as hard voids | Reserved white the reader did not have to spend ink to find | negligible |
| **12-F** | **VERMILION BEAD** *(beat 12.8)* | `uBeadCount (0→6), uBeadViscosity (2.5), uBeadBloom (0.4)` | Composited above the ink, unmixed, per the third disturbance rule | Six names that will not dissolve into the gloom | negligible |
| **4** | Brush edge alpha + SDF glyph | `uAtlas, uPressure, uVelocity, uPx` | MSDF, `fwidth` AA; glyphs stamp through #1's `uDeposits`, so the coda's gold sits on wet-then-dry ground like everything else | No glyph fades in; the coda's gold is hairline and **never blooms** | 0.2 ms |

**Chapter shader-cost total: ≈ 3.75 ms** on high tier, inside the 4.4 ms envelope, because two of the systems that would normally be here — smoke particles and floating ink — are deleted by doctrine.

---

## 8. PERFORMANCE NOTES

**The expensive thing is not the fire. It is the fire *and* the ink field being hot at the same time.** Every other chapter has a mostly static ink field with occasional deposits; Chapter 12 rewrites a moving band across a 2048² RGBA16F target every frame at 60 Hz, while a 65k-particle GPGPU sim reads the same wind texture, while the height fog samples the ink field's M channel per pixel, while landed embers push read-back deposits into the field. Four consumers of one target, one of them a read-back. This is the highest sustained GPU pressure in the project and it is also the longest single unbroken shot, so there is nowhere to hide a stall.

**Mitigations that are free, because doctrine got there first.** The 2.39:1 crop removes **26% of fragment cost**; the 2.76:1 node aperture removes **34%**, and it is active for the most expensive 20 seconds in the chapter. Dioramas step at 24 fps — but there are no dioramas here, so the whole animation budget goes to the front and the embers. The camp is not geometry, so there is no draw-call load from the army at any tier.

| | **High** | **Medium (tier 2)** | **Low (tier 3)** |
|---|---|---|---|
| Embers | 65,536 GPGPU | **16,384 GPGPU**, `uSpawnRate` ×0.35, life ×1.4 to preserve density-over-time | **4,096 CPU sprites**, no read-back |
| Ember → char pits | Every landing, budget 240 | Every 4th landing, budget 96 | **Pre-baked**: 40 pits stamped from an authored map at the front's passage |
| Char front | Per-frame band, 2048² | 30 Hz field tick, band width ×1.3 to hide the step | 20 Hz, 1024² RGBA8 with D packed across R+G as 16-bit fixed point and manual bilinear |
| Fog | 12-tap | 6-tap | analytic; the M-driven inversion is **kept** at every tier — it is the argument, not an effect |
| Post | DOF + bloom + grain | bloom + grain (branch A's never-resolving focus pull becomes a 0.6 s scale-and-contrast push instead) | grain only; embers get a baked 3 px sprite halo |
| River specular | #5 full | #5 at 256² normal map | Static stained-water plate stamped at the front's passage |
| Smoke wash | Full advection | Half-res advection, upsampled | Two authored wash frames cross-dissolved by front position |

**The watchdog trap specific to this chapter.** Beat 12.7's branch A performs the chapter's second cut *and* raises particle spawn *and* starts a focus pull inside 600 ms. That will spike p90 and the demoter will fire mid-node. **Suppress quality sampling for 1.5 s after every reader-caused cut in this chapter**, exactly as after a scene swap, and never auto-promote before the 12→13 boundary.

**Memory.** The ember `FBOSim` pair is the only allocation Chapter 12 makes that Chapter 11 did not; it must be disposed on unmount and asserted back to baseline, and it must **not** be created in a `useMemo` (R3F will not auto-dispose it). The ink field is the resident singleton and is never freed, which is precisely why the largest allocation in the project cannot leak.

**Reduced motion.** Do not run the burn. Present the dried plate: the stroke already charred end to end, the char pits already deposited, the smoke tide line already crystallised on the ridge, the river already stained, and — on branch B — the three voids already open. The camera cuts instead of dollying; the aperture snaps; embers are off entirely; one summary tide tick replaces eleven. Retained at full strength: the seal, the Historian, the gold coda, and the six seconds of zero. **Nothing in the argument is lost, which is the test.**

---

## 9. THE ONE IMAGE

> Classical Chinese ink-wash on warm xuan paper, 2.39:1 anamorphic. A single continuous black brushstroke runs the full width of the frame, past both edges, along the far bank of a night river gorge. Fire runs *along* the stroke, not outward — one glowing point travelling it like ink up a fibre. Below, reserved white water carries the reflection. Above the ridge, bare paper, staining. Monochrome, one vermilion accent, uplit only.

*(60 words. The composition's whole job is that the reader understands the mistake as a **drawing** error one second before they understand it as a military one: he drew one line, so it burned as one line.)*
