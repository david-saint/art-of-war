# 孫子兵法 — ART DIRECTION BIBLE

**Definitive · v1.0 · supersedes Manifestos A and B**
**CANONICAL — this file is the bible.** Draft A is archived at `_superseded/manifesto-a.md` and is not authoritative.
**The unfought battle is the white of the page.**

Every shader, cut, kerning pair and sound answers to this document. If a proposal cannot be defended from a clause below, it does not ship.

---

## 1. THE HOOK

**One sentence.** A thirteen-chapter descent in which you never see a battle — because by the time swords touch, the interesting part is three chapters behind you, and this site exists to train your eye to catch it there.

**One paragraph.** *The Art of War* is a book with contempt for fighting: combat is the accounting entry you post when your perception has already failed. Sun Tzu's claim, buried under twenty-five centuries of boardroom laminate, is that battles are decided *before* they are fought — so the supreme practitioner wins with an army that never draws. Not a battle reel, then, but an instrument of perception. The reader who came for spectacle is handed a surface, a set of physical laws, and moments about to become irreversible. Their marks cannot be lifted, and at the end they are shown not a score but how much of the page they ruined because they saw too late. They should leave colder, not inspired: unable to watch a contest without seeing the arithmetic under it. The promise is not wisdom but **foresight, and the dread of acquiring it one chapter after it would have mattered.**

---

## 2. THE CENTRAL METAPHOR — 留白, THE WHITE YOU MANAGED TO KEEP

**The site is a sheet of xuan paper, and ink is the cost of being wrong.**

In 水墨畫 there is no undo: ink meets sized fibre and is committed, so the discipline lives in the pause *before* contact. This is not an analogy to 廟算, the temple-count made before an army moves — it is the same act. The browser is the hall, scroll the count, the HUD its ledger.

The payoff is exact. The most important region of an ink painting is 留白, reserved emptiness; the most important outcome in Sun Tzu is 不戰而屈人之兵. **The unfought battle is the white of the page.** One conceit dictates the palette, the physics, the stakes, the letterbox (a scroll's mounting silk), the typography and the ending. It renders Chapter 3's moral ladder as a *saturation gradient*: attack his strategy and the page stays clean; his alliances, and you leave a trace; his army, and ink runs heavy; his city, and the sheet drowns.

**If a shot cannot be described as a state of ink on a substrate, it does not belong**; a UI element pretending to be glass or steel has broken the world. References: Tsushima's weather and patience, Three Kingdoms' campaign-map lucidity, the tourism of neither.

---

## 3. THE INK LAW

Five fields, per frame: **D** density (carbon) · **M** moisture (vehicle) · **S** sizing (礬 alum resistance) · **A** age · **G** grain, a vector field from terrain gradient and paper fibre.

**Substrate.** Xuan: warm, toothed, fibre direction θ with ±12–18° wander; conductivity along fibre **5–8×** that across it, modulated by a 2–3 octave FBM absorbency map. Isotropic Gaussian blur is printer ink, and is banned.

1. **Ink travels only on wet ground.** Bleed depends on **M** alone; dry paper takes a hard, final edge. **Moisture is the fog of war**: unread ground holds M 0.55–0.70, D ≤ 0.14, drying as information is earned.
2. **D is monotonic.** No texel ever lightens: no eraser, no fade-out, no opacity ramp.
3. **Bleed is anisotropic along G** — K∥ ≈ 0.10–0.16 UV-units/second of scene time at M = 1, K⊥ ≈ 0.018–0.032 — and never fades at the edge: where 0.02 < D < 0.28, displace the isocontour with 4-octave FBM. Ink runs down valleys, is repelled up ridges.
4. **Three loads only:** 濃墨 dense, low-water — committed force; 淡墨 pale, high-water — intention still contingent; 飛白 broken dry-brush — exhaustion, generated when velocity outruns the brush's finite reserve. A fast army is a ragged mark.
5. **Drying is the clock.** M decays over 4–12 seconds of scene time; bleed halts, the gradient steepens, the core darkens 3–6%. No completion tick: it just stops being negotiable.
6. **Every halted front leaves a tide line** — 水痕 crystallising where ∂M/∂t crosses zero: bright, hard-edged, permanent.
7. **Sizing is invisible until tested.** S renders as nothing: fortification is seen only where ink refuses to go. Inferring **S** before spending **D** is the central perceptual exercise; 軍形 lives here.
8. **Three disturbances.** *Wind* advects wet ink and decays: the mark survives, displaced. *Water* remixes — identity lost to grey, the only way a form dies without darkening: a rout. *Vermilion never blends* — cinnabar is a separate medium (~2.5× viscosity, ~0.4× bloom) beading proud of the surface. **Consequence never dissolves into the gloom.**
9. **Ink needs a surface, and ages on it.** No floating ink, no particle smoke. D oxidises with **A**: the present is the blackest thing on screen, history warm.

**Per-frame order.** advect **M** by wind → `bleed = f(M)·(1 − S)·anisotropy(G)` → accumulate **D** by monotonic max → deposit tide line where `∂M/∂t` crosses zero → composite vermilion above, unmixed → age-shift by **A**.

**Semantic binding.** *Armies* are clusters of high-D strokes, never meshes with ink textures plastered on; a rout is bloom plus wind until D < 0.05 and the men become weather. *Terrain* is dry ink, contested ground wet. *Intention* is 淡墨 while a plan and **gold** once ratified: **a plan differs from an order in whether it can bleed.**

**Decision nodes run LOAD → MARK → BLOOM → DRY → READ.** The brush loads, the aperture tightens, the reader commits; the consequence is the physics of their stroke, and analysis is legal only at M ≈ 0. **Any node whose branches reconverge on identical footage is cut: each must cost the reader something the page keeps.**

**Ink budget.** Mean page density per act: 0.06, 0.18, 0.42, 0.55. A page that darkens everywhere darkens nowhere.

**Reduced motion.** Do not run the soak; cut to the dried state of the same information. Meaning survives; the physics is what we owe those who cannot watch.

---

## 4. COLOUR DOCTRINE

The world is monochrome; colour is a speech act. **If you can remove it and the shot still "looks Chinese," you used it as costume and it is wrong.**

**INK — 松煙墨, pine soot.** Never pure black; cool and faintly green at density, warm at dilution.
`#0B0F0E` deepest · `#1B2321` nong · `#3E4A47` mid · `#7C8985` dan · `#B9C0BB` extreme dilution.
Ink carries everything material: armies, terrain, weather, weight, consequence, the text. It never means "premium," and is never dark-mode ground behind coloured chrome.

**PAPER — 宣紙.** `#E8E2D4` ground · `#DCD3BE` aged · `#F4F0E6` reserved white.
The reserved white is the most valuable pixel in the project: never emissive, never a highlight — paper nobody has ruined, and the currency of the experience.

**JADE — 石綠, malachite.** `#2F6B5A` deep · `#5C9A86` mid · `#9CC4B4` pale.
*One meaning:* **cognition** — revealed structure, the Codex apparatus, an advantage genuinely true in the simulation. Never danger, success, health or hover. **Jade never describes a thing in the world, only a thing in a mind.**

**GOLD — 金, leaf.** `#C9A227` leaf · `#E8CE72` catch-light · `#8A6D14` shadow.
*Two meanings:* **sovereign authority** and **expenditure** — Chapter 2's thousand pieces of gold a day, Chapter 13's hundred for a spy; that legitimacy and money are one substance is load-bearing for the closing argument. Thin and dry: hairlines, seal rules, one glyph catching light. **Gold that blooms is a bug in the Ink Law.**

**VERMILION — 朱砂, cinnabar.** `#C1352B` fresh · `#A82B23` seal paste · `#D9432F` arterial.
*Two meanings:* **the seal** — an irrevocable commitment — and **blood.** That these are one pigment is the thesis as material fact; fire earns vermilion in Chapter 12 because fire is a tactic with a bill. Never errors or CTAs: to warn, the fog thickens or the drums change.

**Global constraints.** Accent coverage never exceeds **3% of frame**, full saturation never 1%. **No blue, ever** — no cyan glow, no blue hour, no cool grade, no grey-blue on watered ink. *Ruling: water kills a mark by taking its identity, not its temperature; blue would make loss look pretty.* No accent gradients.

---

## 5. CAMERA DOCTRINE

**Four focal lengths, each with jurisdiction, and no others.**
**24mm** — the world without people: terrain, weather, ground (9–11), plus the chapters where scale is the punishment (2, the cost of an army; 12, fire).
**40mm** — the Historian: level, human-scaled. Bamboo slips, bronze, the ledger.
**85mm** — the Text, and the named factor: a supply dump, a gorge, a gap in a line.
**180mm** — **the enemy, and only the enemy**, compressed across a valley. You never share space with the opposing force: distance is the argument.

**Cuts versus tracks.** The camera *tracks* while the reader thinks and *cuts* when a decision is made. Cuts fire on reader action, never on scroll — **every hard cut is one the reader caused** — and must change what the reader *knows*. One exception: the **match cut on ink**, budgeted at **three for the whole site.**

**The letterbox is the mounting silk (裱), not a filter.** Aspect is a state variable: **2.39:1** in Story, tightening to **2.76:1** at a decision node as the choice closes, opening to **16:9** in Codex, where cinema is withdrawn and inserts stay 2.39:1, inset like a slip on a desk.

**Story Mode is perspective; Codex Mode is orthographic.** The switch *is* a projection change: the world lifts, flattens, becomes the map table; the Ink Law freezes at current density.

**Scroll is time, on two clocks.** `tCamera` is bidirectional and scroll-bound: rewind the shot, re-read the terrain. `tInk` is monotonic, pinned to the high-water mark; inside a beat still held as hypothesis M may be re-driven, but D never decreases. **You may review; you may not undo.** One viewport-height is one beat.

**Motion.** Rails only — track, dolly, crane, pan-and-scan; never roll or orbit, and never shake beyond a ≤3px punch on drums. Dioramas step at 24fps while camera and interface run at 60; grain is paper tooth, never a LUT.

---

## 6. TYPOGRAPHIC DOCTRINE

**The Chinese glyph is an object**, never a font sitting flat on a div. Display glyphs are traced from real brushwork and rendered as SDF strokes carrying pressure and velocity — *written*, in stroke order. **No glyph ever fades in.** They obey the Ink Law in full: they bloom on wet ground, go feibai when written fast, take tide lines, oxidise. **If it cannot get wet, it is not a glyph in this world.** A glyph may be large enough to be landscape: a single 戰 the camera treats as ridge and valley, drying while you watch.

Script is semantic: **篆書** for chapter titles, pictographic and deliberately hard to read, so the eye must decode and thereby train; **楷書** for canon; **行草** for the Commander alone.

**Translation is speech** — a sharp editorial serif at display size, old-style, high-contrast: a book, not a wedding invitation. ≤24 words on screen at once, on the frame's optical centre.

**Analysis is apparatus** — a neutral grotesque built for argument, ragged-right at 62–68 characters, in the margin and in Codex, **never inside the cinema frame.** Its leaders are ink, not Material Design.

The grid is the literal collision of two writing systems: Chinese **vertical, right-to-left**; Latin horizontal on a baseline. A glyph never scales below the size at which its brush texture reads. **Seals certify. They do not garnish.**

---

## 7. THE THREE VOICES

Three registers on three *different sensory channels*. Mixing them in one block is a failure of command.

**THE TEXT (經) — written, never spoken.** Chinese first, English second: aphoristic, absolute, present tense. It has no voice-over anywhere; it exists only as ink. Its audio is *absence* — room tone ducks ~200ms before it appears, leaving a hole in the mix, punctuated by one decaying 古琴 partial. **No music ever plays under the Text.**

**THE HISTORIAN (史) — third person, past tense, dated, specific.** Warring States logistics, grain consumption, the price of a chariot; where the text is cold, cruel or merely logistical. He carries our textual honesty: the received thirteen chapters are a reconstruction, and the 1972 Yinqueshan Han-tomb slips are *why our progress scroll is bamboo* — **the HUD is an artefact, not a skin.** Apparatus grotesque under a hairline rule, gold marking a citation sealed, never jade. Audio: a narrator reading like a catalogue, not a documentary.

**THE COMMANDER (將) — second person, the only voice permitted to say "you."** Imperative and terse, at decision nodes and nowhere else: you are not watching a general, you are counting. Tracked small-caps in jade, 行草 for the operative term, gold for committed chapter state, vermilion if the last choice drew blood. It has **no voice at all** — a brush loading, a slip set down, a drum. Its "yes" is a seal press.

**The audio system is derived from Chapter 7.** 金鼓旌旗 — gongs and drums, banners and flags, the means by which the eyes and ears of the host are focused on one point. **Drum (鼓) advances and commits; metal (金) withdraws and returns.** That signal set *is* the interaction design, and the only reason the HUD may exist. Spatial audio is a map: wind off the range, rain on contested ground, drums from the node you have not touched.

Story privileges Text and Commander, Codex Text and Historian: **the switcher is a change of seat in the same hall, not a different website.**

---

## 8. WHAT THIS IS NOT

Each refusal carries its replacement. A refusal without a replacement is taste; with one, it is direction.

- **No chinoiserie** — dragons, foo dogs, lotus, koi, red lanterns, festival red, Matrix rain, neon cyber-China. → Weather is the only living force here, and every glyph a real word doing work.
- **No hand-to-hand combat** — kung-fu, wire-work, duels, wuxia. → We cut away at contact, every time. Battle is a sound and a change in the ink; we show the hour before — supply, distance, weather, hunger, ground.
- **No "ancient wisdom for modern business," no aphorism cards, no "Sun Tzu says" over a photograph.** → Every line of the Text is welded to a mechanism on screen, and the Historian keeps the numbers.
- **No wrong-dynasty tourism** — terracotta warriors (250 years late), Great Wall, taijitu, qi mysticism, nothing Japanese. → Eastern Zhou material culture: bronze as weight not ornament, lacquer, silk, **bamboo slips**, inkstone, rammed earth.
- **No unit cards, XP, ranks, certificates or scroll-jacking.** → A bamboo-slip ledger, nodes that load a brush, scroll that stays the reader's clock. The reader is never scored: a score would let them believe the page is not the score.
- **No fake agency** — no node whose branches reconverge on identical footage. → Every branch spends ink the sheet keeps.
- **No laundering the text.** → Where Chapter 13 is cruel, the Historian says so and lets it stand.
- **No gold particles, god-rays, sepia filters, rice-paper JPEGs, AI-slop mountains.** → Texture is *generated* by the Ink Law; embers exist only where Chapter 12 lit a fire.
- **No dark-mode toggle.** → There is one world and it is made of paper.

**The test:** if a reference image could also sell a fusion restaurant, a vodka, or a touring show of Imperial Warriors, it is out.

---

## 9. THE ARC

Four acts, and a reader moving from arrogance to arithmetic.

**ACT I — THE CALCULATION (計) · 1 始計 · 2 作戰 · 3 謀攻.** The five factors, the seven comparisons, the price of a day of war, and the ladder that puts siege at the bottom as a confession of failure. The page is almost white; nodes punish the hunger to engage. *Feeling: this is arithmetic, and I have been doing it by vibe.*

**ACT II — THE SHAPE (形) · 4 軍形 · 5 兵勢 · 6 虛實.** The physics act: invincibility lies in yourself, victory in the enemy; 勢 is stored energy in a configuration; strike where he is not. The shaders carry the argument. *Feeling: the deciding factors are physical, and I can see them.*

**ACT III — THE FRICTION (變) · 7 軍爭 · 8 九變 · 9 行軍 · 10 地形 · 11 九地.** The longest act, because reality is long: maneuver, where exhaustion and rumour live, then contingency, the march, terrain, the nine grounds. Feibai appears and stays, tide lines accumulate, the page never recovers. *Feeling: my competence is eaten by ground, weather, hunger and time.*

**ACT IV — THE INSTRUMENTS (器) · 12 火攻 · 13 用間.** The two appendices, restored as the closing argument: the most destructive instrument beside the cheapest. Fire returns nothing you can hold; a spy costs a hundred pieces of gold and returns the war. Chapter 13's charge — that grudging that gold while armies rot is the height of inhumanity — is the detonation the book walks toward. Fog dries at last, and drying should feel like power, and like a door closing on someone else. *Feeling: the cheap thing was knowledge, and I would not buy it.*

**THE ENDING.** No certificate, no five lessons. The letterbox opens and the reader is handed their own sheet: thirteen chapters as one scroll carrying every deposit, tide line and seal their choices made. Most will be dark. Beneath it, on a clean sheet:

> 百戰百勝，非善之善者也；不戰而屈人之兵，善之善者也。
> *To win a hundred battles in a hundred fights is not the highest excellence. To break the enemy's resistance without fighting is the highest excellence.*

Then one offer: **begin again.** The second reading always uses less ink, and that is the only thing this site was trying to teach.

---

## PROVENANCE

**A supplied the spine; B was mined for organs.**

- **A won hook, metaphor, camera, typography, voices and arc.** A alone closed the loop 留白 = 不戰而屈人之兵; gave lenses jurisdiction and reserved 180mm for the enemy; made the letterbox a state variable and scroll a pair of clocks; made glyphs obey the ink physics; put the three voices on three *sensory* channels; derived the HUD from 金鼓旌旗. Its four acts beat B's three, which collapsed 9–13 and lost 12–13 as closing argument.
- **Ink Law — A's architecture, B's numbers.** A's five fields, monotonic D, moisture-as-fog, invisible sizing and tide lines are the semantic machine; B's constants make it buildable, and B's semantic binding and reduced-motion clause were adopted whole.
- **Colour — A**, for tying every hex to a substance with permitted *and* forbidden meanings. **Conflict:** B cooled watered ink toward grey-blue, A banned blue outright — A wins: water should erase a mark's identity, not tint it attractively.
- **Grafted from B:** *colder, not inspired*; "if a shot cannot be described as ink on a substrate"; the reference discipline; colour as a speech act; the punitive 24mm; a cut must change what the reader knows; the landscape-scale glyph; "seals certify, they do not garnish"; the Historian as catalogue, not gravitas; the switcher as a change of seat; the wuxia and unit-card refusals; the fusion-restaurant test; drying as a door closing on other people.
- **Both weak, replaced:** the Historian's textual warrant (Yinqueshan, which makes the bamboo HUD an artefact, not a skin); the ban on branches that reconverge; per-act ink ceilings; the refusal to launder Chapter 13's ethics; the node phases.
