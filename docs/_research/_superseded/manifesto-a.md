> **SUPERSEDED — NOT AUTHORITATIVE.**
>
> This is draft A of the art-direction manifesto, one of two independent drafts
> written before the merge. It is kept only as provenance for the merge
> decisions recorded at the end of `../manifesto.md`.
>
> **The canonical bible is `docs/_research/manifesto.md`.** Where this file
> disagrees with it — on 24mm jurisdiction, the analysis measure, ink ageing
> colour, or guzheng usage — the canonical bible wins. Do not build from this
> file and do not cite it.

---

# 孫子兵法 — EXECUTIVE CONCEPT & ART DIRECTION MANIFESTO

**Document A · The Bible · v1.0**
Every shader, cut, kerning pair and sound is answerable to this document. If a proposal cannot be defended from a clause below, it does not ship.

---

## 1. THE HOOK

**One sentence:** *A thirteen-chapter descent in which you never see a battle — because by the time swords touch, the interesting part is three chapters behind you, and this site exists to train your eye to catch it there.*

**One paragraph:** The Art of War is not a book about fighting. It is a book with contempt for fighting — an argument that combat is the accounting entry you post when your perception has already failed. Sun Tzu's radical claim, buried under twenty-five centuries of boardroom laminate, is that battles are *decided before they are fought*, by five factors any disciplined mind can count on its fingers, and that the supreme practitioner therefore wins with an army that never draws. So: no battle reel. An instrument of perception instead. The reader arrives expecting spectacle and is handed a surface, a set of physical laws, and a sequence of moments about to become irreversible. Their choices leave marks that cannot be lifted, and at the end they are shown the evidence of their own reading — not a score, but a picture of how much of the page they were forced to ruin because they saw too late. The promise is not wisdom. The promise is **foresight, and the specific dread of acquiring it one chapter after it would have mattered.**

---

## 2. THE CENTRAL METAPHOR: 留白 — THE WHITE YOU MANAGED TO KEEP

The unifying conceit: **the site is a sheet of xuan paper, and ink is the cost of being wrong.**

In 水墨畫 there is no undo. Ink meets sized mulberry fibre and is permanently committed; the discipline lives entirely in the pause *before* contact — loading the brush, reading the paper's absorbency, judging the moment. This is not an analogy to 廟算, the temple-count performed before an army moves. It is the same act. Both are disciplines of the un-taken stroke.

And the payoff is exact. The most important region of any great ink painting is 留白, the reserved emptiness that carries the composition. The most important outcome in Sun Tzu is 不戰而屈人之兵, subduing the enemy without fighting. **The unfought battle is the white of the page.** One conceit, and it dictates the palette (only pigments that historically sit on a scroll), the physics (§3), the interaction stakes (a decision deposits ink and the page keeps it), the letterbox (the mounting silk of a hanging scroll), the typography (glyphs are wet deposits, not fonts), and the ending (your sheet, returned to you, as dark as you made it).

It also renders the moral ladder of Chapter 3 as a *saturation gradient*: attack the enemy's strategy and the page stays clean; attack his alliances and you leave a trace; take the field and the ink runs heavy; besiege a walled city and the sheet drowns to black. The reader learns the doctrine by watching their paper.

---

## 3. THE INK LAW

Ink is a simulated material with a fixed constitution. Four scalar fields and one vector field, evaluated per frame over the page: **D** density, **M** moisture, **S** sizing, **A** age, **G** grain (a normalised flow field derived from terrain gradient).

1. **Ink travels only on wet ground.** Bleed radius is a function of **M** alone; dry paper takes a hard, final edge with zero diffusion. Therefore **moisture is the fog of war** — known ground is dry and ink behaves as intended; unknown ground is saturated and every mark spreads further than you meant. 虛實 is a wetness map.
2. **D is monotonic. It only increases.** No texel ever lightens. No eraser, no fade-out, no opacity ramp down. This is the most important rule in the project and it is not negotiable for aesthetic convenience.
3. **Bleed is anisotropic, biased along G.** Ink runs down valleys, pools in basins, is repelled up ridges. Armies are ink obeying terrain; Chapters 9–11 are shader work, not illustration.
4. **Three loads, and only three.** 濃墨 *nong* — dense, low-water, near-black: committed force. 淡墨 *dan* — pale, high-water: intention, rumour, feint, the not-yet-real. 飛白 *feibai* — dry-brush, broken, skipping the tooth of the paper: exhaustion and over-extension. Feibai is *generated* by stroke velocity exceeding ink reserve, never hand-painted. A fast army is a ragged mark.
5. **Every advance leaves a tide line.** When a moisture front halts, pigment crystallises at its perimeter as 水痕 — a bright, hard-edged high-water mark. Tide lines never fade. A campaign map is the archaeology of its stalled fronts.
6. **Sizing is invisible until tested.** 礬 (alum) resistance renders as nothing; fortification is seen *only* where ink refuses to go — a sudden bright halt with a crisp meniscus. Dispositions (Ch. 4, 軍形) live in a channel the reader cannot see until they commit to it. Learning to infer **S** before spending **D** is the site's central perceptual exercise.
7. **Ink oxidises with A**, drifting from cool blue-black toward soot brown. The present is the coldest, blackest thing on screen; history is warm. Time is a chromatic gradient, never a date stamp.
8. **Three disturbances, distinct.** *Wind* advects the wet front directionally and decays — the mark survives, displaced. *Water* fully remixes: the mark loses identity and becomes general grey. This is a rout, and the only way a form dies without darkening. *Vermilion does not blend* — cinnabar is a different medium; it beads and sits proud of the ink. **Consequence never dissolves into the general gloom.**
9. **The brush holds a finite reserve.** Supply (Ch. 2) is the reservoir. A stroke that outruns its load goes feibai, then stops. No infinite force, no infinite anything.
10. **Ink requires a surface.** No floating ink in a vacuum, no particle smoke pretending to be pigment, no dispersion-in-water tank footage. If it is not touching paper it does not render.

Per-frame order: advect **M** by wind → resolve `bleed = f(M) · (1 − S) · anisotropy(G)` → accumulate **D** with a monotonic max → deposit tide line where `∂M/∂t` crosses zero → composite vermilion as a non-mixing layer above → age-shift by **A**.

---

## 4. COLOR DOCTRINE

Nothing appears here that could not physically sit on a Warring States scroll. Four substances, four meanings.

**INK — 松煙墨, pine-soot.** Never pure black; cool and faintly green at density, warm at dilution.
`#0B0F0E` deepest · `#1B2321` nong · `#3E4A47` mid · `#7C8985` dan · `#B9C0BB` extreme dilution.
*Allowed:* everything material — armies, terrain, weather, weight, consequence, the text itself. *Forbidden:* meaning "elegant" or "premium." Ink is cost.

**PAPER — 宣紙.** `#E8E2D4` ground · `#DCD3BE` aged · `#F4F0E6` reserved white.
The reserved white is the most valuable pixel in the project. Never emissive, never glowing, never a highlight effect — simply paper nobody has ruined. It is the currency of the entire experience.

**JADE — 石綠, malachite.** `#2F6B5A` deep · `#5C9A86` mid · `#9CC4B4` pale.
*One permitted meaning:* **cognition** — what the commander knows and the reader has understood. The five factors, revealed structure, the Codex apparatus, the Commander's voice. *Forbidden:* the enemy, danger, success states, foliage, hover polish. Jade never describes a thing in the world, only a thing in a mind.

**GOLD — 金, leaf.** `#C9A227` leaf · `#E8CE72` catch-light · `#8A6D14` shadow.
*Two permitted meanings:* **sovereign authority** (decree, mandate, commission) and **expenditure** (Ch. 2's thousand pieces of gold a day; Ch. 13's hundred for a spy). Gold is legitimacy and gold is money, and the book's closing argument needs the reader to feel them as one substance. *Forbidden:* luxury signalling, hover accents, gradients, particles, bokeh, borders.

**VERMILION — 朱砂, cinnabar.** `#C1352B` fresh · `#A82B23` seal paste · `#D9432F` arterial.
*Two permitted meanings:* **the seal** — an irrevocable commitment, a signature, a decision made — and **blood.** That these are one pigment is the thesis rendered as material fact. *Forbidden:* errors, deletion, alerts, hover, emphasis, and every decorative red in the Chinese-cliché catalogue.

**Two global constraints.** (a) Combined accent coverage never exceeds **3% of frame area**; full-saturation accent never exceeds 1%. (b) **No blue, ever** — no cyan UI glow, no blue hour, no digital-cool grade. And no gradient between any two accents: separate substances do not blend.

---

## 5. CAMERA DOCTRINE

Four focal lengths, each with jurisdiction, and no others:

- **24mm** — the world without people. Terrain, weather, the shape of ground. Chapters 9–11 only.
- **40mm** — the Historian. Level, honest, human-scaled. Material culture: bamboo slips, bronze, the ledger.
- **85mm** — the Text. Shallow, close, paper filling frame, brush entering from below. Your own hands' distance.
- **180mm** — **the enemy, and only the enemy.** Compressed, heat-hazed, across a valley. You never share space with the opposing force. Distance is the argument.

**Cuts versus tracks.** The camera *tracks* while the reader is thinking; it *cuts* when a decision has been made. Cuts fire on reader action at decision nodes, never on scroll — so every hard cut is one the reader caused. No dissolves, no whip pans. One exception: the **match cut on ink** (a river's meander resolving into a brushstroke, a ridgeline into a glyph's spine), budgeted at **three for the entire site.** Spend them like gold leaf.

**The letterbox is the mounting silk (裱), not a filter.** It carries a woven normal detail visible only under bloom, and its aspect is a state variable: **2.39:1** in Story Mode, tightening to **2.76:1** during a decision node — the aperture narrowing as the choice closes — and opening to **16:9** in Codex Mode, where analysis gets the whole page and cinema is withdrawn. The bars never animate for pleasure.

**Story Mode is perspective; Codex Mode is orthographic.** The mode switch *is* a projection change: the world lifts, flattens, becomes the map table; the Ink Law freezes mid-simulation and dries at current density; the apparatus comes forward.

**Scroll maps to time via two clocks.** `tCamera` is bidirectional and scroll-bound — rewind the shot, re-read the terrain. `tInk` is monotonic, pinned to the high-water mark of scroll progress. **You may review; you may not undo.** One viewport-height is one beat. The camera never rolls, never orbits, never shakes except a sub-pixel punch of ≤3px on drum impacts. Rails only: lateral track, dolly, crane, pan-and-scan. Diorama layers animate on a stepped 24fps cadence; camera and interface run at 60. Cinema and instrument are allowed to feel different.

---

## 6. TYPOGRAPHIC DOCTRINE

The **Chinese glyph is an object**, never a font sitting flat on a div. Display glyphs are traced from real brushwork and rendered as SDF strokes carrying start, end, pressure and velocity — so they are *written*, in correct stroke order, rather than faded in. **No glyph in this project ever fades in.** They obey the Ink Law in full: they bloom on wet ground, go feibai when written fast, take tide lines, oxidise, and can be blown by wind. The test is blunt — *if it cannot get wet, it is not a glyph in this world.* Script is semantic: **篆書** seal script for chapter titles (pictographic, deliberately hard to read, so the eye must decode and thereby train), **楷書** for transmitted canon, **行草** running-cursive for the Commander's marginalia only.

The **transliteration is a museum tag** — small, tracked, never above 11px, never romantic. It lets a reader say the word; it does not decorate.

The **translation is speech**: a sharp editorial serif at display size, ≤24 words on screen at once, on the frame's optical centre. Candidates: GT Sectra, Lyon, Freight Display Pro.

The **analysis is apparatus**: a neutral grotesque (Söhne, ABC Diatype, Neue Haas), flush-left ragged-right in a 34em measure, living in the margin and in Codex Mode — **never inside the cinema frame.**

The grid is the literal collision of two writing systems: Chinese set **vertically, right-to-left**; Latin horizontal on a baseline grid. That intersection is the layout system, not a flourish. Hard floor: a glyph never scales below the size at which its brush texture reads — beneath that it becomes a label set in Source Han Serif like any other information.

---

## 7. THE THREE VOICES

Three registers on three *different sensory channels*. They never overlap.

**THE TEXT (經) — Sun Tzu. Written, never spoken.** Aphoristic, absolute, present tense, no first person, no hedging. It has no voice-over anywhere on this site; it exists only as ink. Display serif beneath its seal-script glyph. Its audio is *absence*: room tone ducks out ~200ms before it appears, leaving a hole in the mix, punctuated by a single decaying 古琴 note. No music ever plays under the Text.

**THE HISTORIAN (史) — third person, past tense, dated, specific.** Warring States logistics, the Wu–Chu campaigns, grain consumption, distances, casualties, the price of a chariot. Apparatus sans under a hairline rule with a running head. Audio: a real narrator — dry, close, mid-range, a scholar's unhurried cadence, no drama, no reverb-as-gravitas — over nothing but low wind and the sound of paper.

**THE COMMANDER (將) — second person, the only voice permitted to say "you."** Imperative, terse, present; it appears at decision nodes and nowhere else. Tracked small-caps in jade at the frame edge beside the HUD, with 行草 for the operative Chinese term. It has **no voice at all** — it speaks in materials and percussion: a brush being loaded, a bamboo slip turning, a drum. Its "yes" is a seal press, a low thud and the crackle of paste.

**The audio system comes directly from Chapter 7.** 金鼓旌旗 — gongs and drums, banners and flags, the means by which the eyes and ears of the host are focused on one point. So: **drum (鼓) advances and commits; metal (金 — gong, bell) withdraws and returns.** That historical signal set *is* the site's interaction sound design, which is why the War Council HUD is permitted to exist — it is not a game overlay bolted onto a classic, it is Chapter 7 rendered as an instrument. 箏 guzheng is forbidden as ambience and plays only at act boundaries. Sub-bass is reserved for irreversibility.

---

## 8. WHAT THIS IS NOT

Each refusal carries its replacement. A refusal without a replacement is taste; with one, it is direction.

- **No dragons.** → Weather. The only living force in this world is wind.
- **No red lanterns, no festival red.** → Vermilion is seal paste and blood. Nothing else.
- **No kung-fu, no wire-work, no duels — no hand-to-hand combat anywhere on this site.** → We cut away at contact, every time. Battle is a sound and a change in the ink. We show the hour before: supply, distance, weather, hunger, ground.
- **No fortune-cookie aphorism cards, no "Sun Tzu says" over a photograph.** → Every line of the Text is welded to a mechanism on screen — a diagram, a terrain, a count. A line that cannot be operationalised does not ship as a hero moment.
- **No "ancient wisdom for modern business."** No startup, negotiation, or LinkedIn framing, in copy or metaphor. → The Historian's specificity: real campaigns, real numbers, the reader's inference left intact.
- **No wrong-dynasty tourism.** No terracotta warriors (250 years late), no Great Wall, no Forbidden City, no cheongsam, no taijitu, no I Ching hexagrams, no qi mysticism, no lotus, no koi, no bamboo-forest duel. Nothing Japanese: no cherry blossom, no torii, no samurai silhouette, no taiko. → Correct material culture for 6th–5th c. BCE Eastern Zhou: bronze, lacquer, silk, **bamboo slips**, chariots, 戈 halberds, rammed-earth walls.
- **No Matrix rain, no glyphs as texture.** → Every character on screen is a real word doing a job, translatable on demand.
- **No gold particles, lens flares, god-ray candy, ambient ember swarms.** → Embers exist where there is a fire: Chapter 12, nowhere else.
- **No scroll-jacking, no unskippable eight-second animation, no fake loading scroll.** → Scroll is always the reader's clock; only ink is one-way.
- **No trailer orchestra, no braaam, no erhu over a sunset.** → Drums, metal, silk strings, wind, rain on bamboo, and silence used as a weapon.
- **No rice-paper JPEG at 12% opacity, no sepia filter.** → Texture is *generated* by the Ink Law. Nothing is pasted on top.
- **No AI-slop misty mountains.** → Every background is a built diorama with a known scale, a known light source, and a known distance to the enemy.
- **No dark-mode toggle.** → There is one world and it is made of paper.

---

## 9. THE ARC

Thirteen chapters, four acts, and a reader who moves from arrogance to arithmetic.

**ACT I — THE CALCULATION (計) · 1 始計 · 2 作戰 · 3 謀攻.** Before anything moves: the five factors, the seven comparisons, the price of a single day of war, and the ladder that puts siege at the bottom. The page is almost entirely white; ink appears only as counted quantities. *Feeling: this is arithmetic, and I have been doing it by vibes.*

**ACT II — THE SHAPE (形) · 4 軍形 · 5 兵勢 · 6 虛實.** The physics act. Invincibility lies in yourself, victory lies in the enemy; force is a round stone rolling from a height; strike where he is not. Ink first behaves as matter — mass, momentum, pressure, void — and the shaders carry the argument. *Feeling: the deciding factors are physical, and I can see them now.*

**ACT III — THE FRICTION (變) · 7 軍爭 · 8 九變 · 9 行軍 · 10 地形 · 11 九地.** Contact with reality, and the longest act because reality is long. Maneuver, contingency, the march, terrain, the nine grounds. Feibai appears and stays; tide lines accumulate; the page stops being clean and never recovers. *Feeling: my plan is being eaten by ground, weather, hunger and time.*

**ACT IV — THE INSTRUMENTS (器) · 12 火攻 · 13 用間.** The two chapters everyone files as appendices, restored as the closing argument: the most destructive instrument and the cheapest one, side by side. Fire consumes everything and returns nothing you can hold; a spy costs a hundred pieces of gold and returns the war. Chapter 13's charge — that to grudge that gold while armies rot for years is *the height of inhumanity* — is the ethical detonation the whole book walks toward. *Feeling: the cheap thing was always knowledge, and I refused to buy it.*

**THE ENDING.** The letterbox opens fully and the reader is handed their own sheet: thirteen chapters as one continuous scroll, carrying every deposit their decisions made, every tide line where they stalled, every vermilion seal where they committed. Most scrolls will be dark. It is not scored and not judged. Beneath it, on a sheet with no ink on it at all, the line this experience was engineered to land as physical relief rather than proverb:

> 百戰百勝，非善之善者也；不戰而屈人之兵，善之善者也。
> *To win a hundred battles in a hundred fights is not the highest excellence. To break the enemy's resistance without fighting is the highest excellence.*

Then one offer: **begin again.** The second reading always uses less ink, and knowing that is the only thing this site was ever trying to teach.
