# 孫子兵法 — CINEMATIC SHOT GRAMMAR & MOTION BIBLE

**v1.0 · subordinate to [docs/_research/manifesto.md](docs/_research/manifesto.md).** Where this document and a chapter packet disagree on a *named move already claimed* (Ch2's unbroken 24mm pan, Ch3's match cut, Ch5's rise, Ch9's reader pan, Ch11's remount, Ch13's refusal of 180mm), the packet wins. This bible exists so nothing else is invented.

Every shot is a state of ink on a sheet. If it cannot be described that way, it is not in the kit.

---

## 1. THE LENS KIT

Four lenses, 35mm full-frame equivalent (`setFocalLength()` against a fixed 35mm sensor). No fifth. No zoom: a focal-length change is a cut, and a cut is an act.

**24mm · T8 · THE GROUND.** Hyperfocal from ~1.2 m. Everything in the world is equally sharp and equally small. Depth of field is not a mood here; it is the refusal to pick a hero. *For:* the world without people — terrain, weather, the road, the fire, the nine grounds. Scale is the punishment: Ch2, Ch7, Ch9–12. *Image:* a supply stroke that will not end; a burning line that keeps arriving; a valley in which your army is a fleck. *Never:* faces, the HUD, the enemy's eyes, Codex.

**40mm · T4 · THE HISTORIAN.** A table's depth. Falloff gentles the far edge of a room without throwing the ledger into soup. *For:* bamboo slips, bronze, glue pot, axle grease, the lamp, Chapter 13's interior. Human-scaled, level. You are sitting. *Never:* landscape, the enemy, any shot that wants "cinematic." This is the only honest lens in the kit.

**85mm · T2 · THE TEXT.** Paper fills the frame. A brush entering from below is in the plane; the far wash is gone. *For:* glyphs written in stroke order, the named factor (a seam, a gorge, a granary, a boulder), the MARK of a node, Ch1/3/4/5/6/8. *Image:* one character large enough to be ridge and valley, drying while you watch. *Never:* establishing a country, covering a march, looking at him.

**180mm · T4 · THE ENEMY.** A thin slab of focus at valley distance; the range stacks like cards. Heat is moisture in the paper, not a filter. *For:* the opposing force, and only the opposing force. You never share space with him. Distance is the argument. Ch13 never uses it: for the first time you are holding his handwriting. *Never:* the reader's army, a title, a UI accent, a "detail shot" of your own men. If they are yours, you are too close for this glass.

Aperture is jurisdiction, not pretty bokeh. T2 exists so the Text can be a thing you could touch. T8 exists so you cannot hide in a close-up from what the road costs.

---

## 2. THE SHOT VOCABULARY

A closed set. If a chapter wants a move that is not here, the move is wrong.

**THE WRITING.** A Chinese glyph is deposited, stroke order, SDF brush, Ink Law in full. Camera locked. 80–100vh. Path: identity (no translation). *When:* titles (篆書), canon (楷書), Commander terms (行草), the opening 計. *Never:* as a fade, a scale-up, or a tracking shot that "reveals" a sentence. If it cannot get wet, it is not this shot.

**THE COUNTING TRACK.** The default of Story. Lateral rail, pan-and-scan, or a short dolly, while the reader thinks. 100vh. Path: a straight world-space segment, sampled by arc length; ease `power1.inOut` on the first and last 12% of the beat, linear through the middle. *When:* Ch1's five factors, any beat that is still hypothesis. *Never:* to cover a load, to "add energy," or across a decision. If they have chosen, this shot is over.

**THE PUNITIVE PAN.** 24mm, constant rate, longer than comfort. 180–240vh. Path: linear (`none`); no ease, no breathing. The length *is* the sentence. May travel against the phenomenon (Ch12 dolly against the fire). May exit its own subject and hold on empty pass (Ch7). *When:* duration, distance, hunger, fire as a line. *Never:* Act I except Ch2; never on 85/180; never with a cut in the middle.

**THE NAMED FACTOR.** 85mm, locked or a dolly-in of ≤8% over the beat (Ch8). 80–120vh. Path: near-identity; if it pushes, `power2.in`. After a MARK, it becomes the drying hold: locked until M ≈ 0. *When:* the seam, the flaw, the boulder, the cooking-pots. *Never:* to pretty a wide; never on the enemy.

**THE LEDGER.** 40mm, level. 80vh. Path: identity, or a crane of ≤30 cm toward the table. *When:* Historian inserts, Ch13 home. *Never:* as a cutaway for "variety" in a 24mm chapter more than once.

**THE COMPRESSION.** 180mm, held too long. 100vh. Path: identity. Parallax spread across layers collapses to ≤0.08. *When:* once per chapter that earns an enemy, at most. Taught in Ch1, spent in Ch4, withheld in Ch2 and Ch13. *Never:* as the home lens; never moving.

**THE SILHOUETTE PASS.** A foreground ink mass at 0.8–2.5 m occludes the diorama as the camera tracks. 100vh. Path: COUNTING TRACK geometry; the silhouette is a stroke, not a PNG. *When:* to hide contact, to let a form become weather, to enter a chapter without a wipe. *Never:* as decoration repeating left-to-right every beat (the 2010 tell).

**THE STORED CRANE.** Rise only. 85mm (Ch5) or 24mm (Ch10, forty seconds of scene time). 160–240vh. Path: world +Y along a straight rail; ease `power1.out`. *When:* 勢 accumulating; reading a wall of ground. *Never:* down; never after the node has fired; never in Ch13.

**THE SPENDING CRANE.** Descent only. Ch6 follows water, 85mm, continuous, `power1.in`, no cut until the node — water never stops. Ch13 is the other descent: 40mm, from a read of the table down until slips stand like a palisade; it descends because you are sitting down to count, not because a force pulls you. *Never:* up; never mixed with a rise in the same chapter.

**THE WASH.** Water remixes a wet region to grey: identity dies without D falling. Not a dissolve, not a wipe. Duration is the remaining moisture (seconds of scene time, 4–12s if a full dry). Path: camera may hold or track; the wash is in paper space. *When:* a rout; the chapter-boundary cover (900 ms authored, middle may extend to ~4 s while the next scene warms). *Never:* to fade two camera plates together; never on dry ink; never tinted.

**THE SEAL CUT.** The only hard cut in normal play. Incoming frame must change what the reader *knows*. Avert form: incoming frame contains no contact; 700 ms of unscored silence (the battle we refuse to show). Path: discontinuity. *When:* pointer-up on a node, and nowhere else. *Never:* on scroll, on a timer, on "energy."

**THE MATCH ON INK.** Budget: **three for the site.** A river, ridge, stroke or fibre grain continues across a cut while scale or meaning reverses. (1) **Spent — Ch3:** 六百里 → 六 on the stroke of 六. (2) **Reserved — Ch5→Ch6:** the boulder's fall bottoming into the flooded lowland (勢 into 虛實). (3) **Reserved — ending:** the reader's dark scroll onto a clean sheet sharing the same G field. The poster→WebGL handover is the *same frame twice*, not one of these three. *Never:* for cleverness, chapter garnish, or logo.

**THE FLATTEN.** Story perspective becomes Codex orthographic. 0 vh (mode switch, not a beat). Path: camera reassignment with matched frustum, 1.1 s; not an FOV lerp. Ink Law freezes at current D. *When:* the reader takes the other seat. *Never:* as a transition between chapters.

**THE READER'S RAKE.** Ch9 only. 24mm locked off; tCamera drives a horizontal pan across a 3×-wide frame. 180–240vh. Path: reader-owned, bidirectional. *When:* the catalogue of dust and signs. *Never:* anywhere else. Other chapters do not "let the user look around."

---

## 3. SCROLL-TO-TIME MAPPING

Two clocks, one hand. `tCamera` is scroll-bound and **bidirectional**: scrub up and the shot rewinds along the same rail, like a moviola, not like a body turning around. `tInk` is pinned to the high-water mark. Moisture still held as hypothesis may be re-driven; **D never decreases.** You may review. You may not undo. The answer to "does the camera move backwards?" is yes — the camera rewinds; the page does not un-happen.

**One beat is one viewport-height**, declared in the DOM; the canvas never sets document height.

- Minimum beat: **80vh** (WRITING, LEDGER).
- Canonical: **100vh**.
- Punitive / crane: **180–240vh**.
- Node: **0 vh** while `scroll.locked`; after READ, **100vh** of aftermath.

Smoothing: exponential `k = 1 − exp(−dt · 9.0)` on `tCamera` only. Punitive pans ignore the ease of the *path* (linear in arc length) but still ride this damper so a wheel tick is not a jump.

**Slow (|v| < 0.35 vh/s).** Reading. Dioramas step 24 fps; camera and silk at 60. Ink sim at full tick. Drying during a locked node is *wall-clock* 4–12 s. Drying during free scroll is *beat-progress* remapped to that curve, so a patient reader and a brisk one finish a beat on the same dry state.

**Fast (0.35–2.0 vh/s).** Seeking. Camera trails; dioramas drop to 12 fps stepped; deposits stay idempotent keyed `(beat, strokeId)` — re-entry replays the field, never the events.

**Scrub (> 2.0 vh/s).** Camera may lag 0.15 of beat progress. No new marks. HUD slip-clacks rate-limit at 22 Hz. High-water still stamps. Catch-up: if the reader leaves a wet beat early, remaining dry runs at 3× in the next beat, never reversed.

Between beats: a hold of 8–12% of beat duration at rest (`atRest`), then the next path. No bounce, no snap-scroll, no hijack. Keyboard is real `scrollIntoView` per beat.

Reduced motion: do not run the soak; cut to the dried plate of the same information; letterbox jumps; camera cuts instead of tracking.

---

## 4. CUTTING RULES

Default: **the camera tracks while you think.** Continuity is the moral: a cut is a decision.

**Hard cut — only THE SEAL CUT, its AVERT form, THE MATCH ON INK, and reduced-motion chapter swap.** Must change knowledge. Fired on reader action, never on scroll. Telegraph, in order: letterbox 2.39→2.76 over **700 ms** (`power2.inOut`); mix width 100%→46%; one tanggu; on commit, the seal (340 ms) then **400 ms true silence**; cut on the first frame after silence. A jump without that chain is a hitch: show the beat's poster, do not "cover" it with a dissolve.

**Dissolve — banned** as a camera operation. THE WASH is water on wet ink, in paper space, after DOF. Crossfading two views is printer ink.

**The 180-degree line** is the fibre θ, the road, or the valley axis. The camera lives on the *home* side of that line for the whole chapter (in Ch11, the right deckle: 散地). Scroll-back reverses the rail; it does not cross. Orbit, roll, and any reverse-angle on the enemy are illegal: at 180mm you are already as close as this world allows.

Contact: we cut away every time. Arrival is a change in D, not a clash. 700 ms unscored.

---

## 5. THE LETTERBOX AS AN INSTRUMENT

The bars are 裱, mounting silk, DOM, crisp at any DPR. They clip type and canvas. They never animate for pleasure.

| State | Aspect | Meaning |
|---|---|---|
| Story | **2.39:1** | The hanging scroll, open for thought |
| Node LOAD | **2.76:1** in 700 ms | Choice closing; Commander lives in the silk, never over the picture |
| After Ch11 死地 | **2.55:1** for the rest of the read until the ending | The remount: silk closer, scroll not opening again |
| Codex | **16:9** | Cinema withdrawn; 2.39 inserts sit inset like a slip on a desk |
| Ending | **bars recede past 16:9 to the sheet's edges** | The only break |

Handoff to Codex is THE FLATTEN: 1.1 s, `power2.inOut`, projection change, ink frozen. Not a route change, not a different website. Returning to Story restores the current silk state (2.39, or 2.55 after Ch11), never "re-opens" a scroll the reader already remounted.

Silk does not bloom. Gold never blooms. A letterbox pulse on hover is a bug.

---

## 6. PARALLAX LAW

Four depths, real z, occluding. Coefficients are *relative camera travel at 24mm*; they collapse with lens.

- **Sky / far wash** — z 80–120 m · coeff **0.04–0.08**. A hanging-scroll mist, almost locked.
- **Range** — z 25–60 m · **0.12–0.22**. Mountains are dry ink, aged (A).
- **Diorama** — z 6–18 m · **0.45–0.70**. Armies are stroke clusters. Poses **step at 24 fps**; the camera interpolates at 60. That cadence split is what makes it a cutscene, not a game view.
- **Silhouette** — z 0.8–2.5 m · **0.85–1.15**. May slightly over-travel. Must occlude.

At **180mm**, spread across all four ≤ **0.08**. At **85mm**, sky and range almost freeze; only diorama and silhouette still read. At **40mm**, parallax is a room: slips and lamp, not geography.

**The 2010 test:** difference-matte two frames. If you see four rectangles sliding, you have failed. Layers do not translate as CSS; they only move because the camera is on a rail. No layer has its own scroll tween. No `translateY(scroll * factor)` on plates. Grain is paper tooth in paper space, locked to device pixels — not a sliding overlay.

---

## 7. FOCUS DOCTRINE

**Ink is never out of focus.** The field composites in paper space after DOF. Blurring a bleed edge with camera depth puts the page inside the scene and breaks the metaphor. Glyphs, tide lines, seals: sharp as deposits.

DOF is for *things that have z*: dioramas, bronze, slips, a boulder, a palisade of bamboo.

**What may be sharp.** Only the current lens's jurisdiction. 24mm: the ground, all of it. 40mm: the object on the table being named. 85mm: the factor. 180mm: him, a slab, unreachable.

**Rack triggers — reader action only.** (1) LOAD: rack 8–12 cm toward the brush, 700 ms, as the silk tightens. (2) SEAL CUT: incoming frame is already focused on the consequence; we do not rack across the cut. (3) FLATTEN: DOF off; orthographic; everything on the table is readable.

**Never** rack during a COUNTING TRACK to "help" the reader find the subject. Finding it is the temple-count. During DRYING HOLD, focus stays on the wet front until M ≈ 0; then analysis is legal, and analysis is *outside* the cinema — margin or Codex — not a title card over a blur.

Low tier drops DOF. Meaning survives; the rack does not.

---

## 8. TRANSITIONS BETWEEN CHAPTERS

One ritual. Twelve chapter boundaries, three act boundaries (those 1.5×, plus a bianzhong at t=+1.9 s). Not used inside a chapter. If a seal was pressed in the last 1.2 s, drop the audio hit, not the picture.

**t = 0.00** — last dried frame of chapter *n* held. Silk at current Story aspect. Camera already at rest.

**t = 0.00–0.34** — the same vermilion seal object presses into the **lower silk**, not onto the image. 340 ms. Seals certify. They do not garnish the picture.

**t = 0.34–1.10** — incoming bamboo slip set onto the HUD ledger. Clack 15–30 ms, pitch stepped by chapter index. Blank face toward us. This is why the HUD is bamboo: an artefact, not a skin.

**t = 0.40–1.30** — transition hit (tanggu 8 ms ahead of sub 46→31 Hz). THE WASH: remaining wet regions of chapter *n* lose identity to grey; dry marks stay (monotonic D). The wash is the load cover.

**t = 1.10–1.32** — the slip rotates 90° as a rectangular prism (not a card flip), 220 ms, `power2.inOut`. Incoming 篆書 title becomes the writing face.

**t = 1.32–3.10** — THE WRITING of the new title, stroke order, ~1.8 s. Camera is already sampling chapter *n+1* at `tCamera = 0`. Unread ground sits at M 0.55–0.70.

**t = 3.10–4.20** — hold. Historian may speak only after this. Text, if any, waits for its hole in the mix.

Reduced motion: skip to the new chapter's dried poster, slip already turned, title already written.

---

## 9. THE OPENING AND THE ENDING

**First 15 seconds** (from first paint; 「有聲」 is a prior gesture, off-screen to this clock). Lens: **85mm T2**. Silk: **2.39:1**. No cut.

- **0.0–1.2 s — THE SHEET.** Reserved white `#F4F0E6`, fibre θ wandering ±12–18°. Mounting silk. D ≈ 0.02. Poster and live frame are the same image; the handover cannot be named.
- **1.2–4.0 s — THE PAUSE.** A loaded brush enters from below, stops 2 mm off the paper. Digital zero in the mix after unlock. This is 廟算: the count before contact.
- **4.0–8.5 s — THE WRITING.** 計, 篆書, stroke order, wet. Bed may begin its 6 s fade from −∞ under everything except the Text; the Text itself is a hole — room ducks ~200 ms before first contact, one 古琴 partial, then nothing until the last stroke's edge holds.
- **8.5–12.0 s — THE COUNTING TRACK.** A lateral 8 cm. The character is now landscape: bloom in the 0.02 < D < 0.28 band, 4-octave FBM on the isocontour. No gold, no jade, no vermilion.
- **12.0–15.0 s — THE LEDGER, still 85mm, no lens change.** At the right edge of silk, the first bamboo slip clacks into the HUD — heard, barely seen. Chapter 1's track continues; we do not cut to begin the book. We were already on the page.

**Last 30 seconds.** After Chapter 13's node (wet-illegible or dried-legible; both are correct).

- **0–2 s.** Hold on Ch13's last frame. 40mm. No 180mm.
- **2–6 s.** Silk recedes past 16:9 to the sheet's deckle — the only break. Not Codex: we are not analysing, we are returning property.
- **6–14 s.** THE RETURNED SCROLL. Full frame, no camera move. Every deposit, tide line, seal. **8.0 s digital zero.** Most sheets are dark. This is the score; there is no other.
- **14.0 s.** Bianzhong 側鼓. **MATCH ON INK (3):** fibre G continues; the dark scroll is the clean sheet. 百戰百勝 writes in 楷書 on untouched `#F4F0E6`. Translation, serif, ≤24 words, optical centre: *To win a hundred battles in a hundred fights is not the highest excellence…*
- **14–28 s.** 14 s of 古琴 in 角 over reserved white. Then 不戰而屈人之兵, smaller, already dry. No certificate.
- **28–30 s.** A brush loads, holds off the paper. Commander: no voice. The offer is **begin again**. The second reading always uses less ink.

---

## 10. THE ANTI-PATTERNS

- **Ken Burns on still plates** → rails through a world that has z, or a locked WRITING.
- **CSS / 2D layered parallax** → camera-on-rails plus occlusion; 2010 difference-matte test.
- **Glyphs fading or swapping in** → stroke-order deposit, or nothing.
- **Whip pan, roll, orbit, handheld, Vertigo zoom, FOV lerp** → listed rails only; punch ≤3 px on drums.
- **Crossfade / dissolve / page-curl / ink-wipe-as-edit** → THE WASH on wet marks, or a telegraphed SEAL CUT.
- **Hard cuts on scroll, Apple snap-sections, scroll-jack** → track while they think; DOM is the clock.
- **Sharing space with the enemy, then punching in to 180mm for "style"** → COMPRESSION or nothing; never a reverse.
- **Rack-focus as tour guide** → rack only on LOAD / cut / FLATTEN.
- **Letterbox pulse, open-and-close for flair, 21:9 as a filter** → silk is state; Ch11 remount is the only mid-site change.
- **God-rays, anamorphic flare, gold bloom, sliding film grain, speed-ramp blood** → paper tooth, vermilion at 0.4× bloom only, cut away at contact.
- **Map-of-China open, wuxia insert, unit-card fly-through** → a sheet, a road, a table.
- **A new unnamed move in chapter 8 because the demo needed "variety"** → if it is not in §2, it does not ship.

The test is the same as the manifesto's: if the camera move would also sell a touring show of Imperial Warriors, it is out. Thirteen chapters, one kit, one ritual, two clocks, three matches. Everything else is a different film.
