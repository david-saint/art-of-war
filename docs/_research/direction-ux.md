# 孫子兵法 — FRONTEND UI/UX SPECIFICATION

**v1.0 · answerable to `manifesto.md` · pairs with `direction-tech.md` and `direction-audio.md`**

The interface is the ledger of a temple-count. It is made of paper, bamboo, silk and ink; it has no glass, no steel and no shadow it did not earn by contact. Where this document conflicts with the bible, the bible wins.

---

## 1. THE TWO MODES

### Story 幕 — perspective

Full-bleed `<canvas>` fixed behind the article. Aspect **2.39:1**, mounting silk top and bottom. On screen at any moment: the shot; the Text (楷書 Chinese, editorial serif English, ≤24 words, optical centre); the Commander at nodes only; the retracted HUD. **No analysis is permitted inside the frame** — the Historian's apparatus lives in the bars or in Codex.

Scroll is `tCamera`: bidirectional, one viewport-height per beat, 3–9 beats per chapter. Rewinding re-runs the shot and never the ink. `tInk` is pinned to the high-water mark.

### Codex 案 — orthographic

The world lifts and flattens into the map table. Aspect opens to **16:9**; cinema is withdrawn. On screen: the canvas demoted to a top-anchored orthographic plate at 42vh, the full chapter apparatus below it in a 62–68ch column — line-by-line 楷書 + pinyin + literal + modern; the Historian's dated vignette with sources; the historicity note; the branch the reader took and, as a jade outline only, the branch they did not; the Yinqueshan provenance note under the ledger.

Scroll in Codex is document scroll over that column. The Ink Law **freezes at current density** — no bleed advances in Codex, because Codex is a thing in a mind, not a thing in the world.

### The transition — 平置, laying the scroll flat

One continuous idea, never a page swap and never a route navigation. Over **900ms** on `--ease-silk`, four values tween in the same timeline: the camera cranes to overhead on its existing rail (it does **not** cut — cuts are reserved for reader decisions); `projection` lerps perspective → orthographic via a blended frustum; `--aspect` goes 2.39 → 1.7778, so the silk bars retract outward; the apparatus column, already in the server DOM at `opacity:0; clip-path: inset(0 0 100% 0)`, is revealed by an **ink-wet mask wipe** driven by the same progress value — a wet edge crossing the column, not a fade. Reversing plays the identical timeline backwards; the table tips back up.

**Persists across the switch:** chapter index and beat, `tInk` and every deposit, all decisions and seals, audio state, quality tier, scroll anchor (beat *n* maps to codex anchor `#b{n}`). **Does not persist:** camera easing state, hover previews, the node's transient phase.

### Landing rule

First-time reader (no `aow:v1` key) **always lands in Story**, and the mode switch is not rendered until Chapter 1 beat 3 — you cannot be offered a second seat before you have sat in the first. Returning reader lands in **the mode they left**, at the last **completed beat boundary**, never mid-node and never mid-bloom. A reader arriving on a deep link takes the link's mode (`?m=codex`), which overrides both.

---

## 2. THE WAR COUNCIL HUD

The HUD exists because of 金鼓旌旗 and because the received text is a reconstruction recovered from bamboo. It is an artefact, not a skin.

### 竹簡 — the bamboo ledger

Thirteen slips on a twin cord (編繩), vertical along the right edge on desktop, read top-to-bottom in vertical-RTL. Four act gaps in the cord, wider than the slip pitch, are the only structural chrome.

**Unwinding.** Entering a chapter advances the cord by one slip pitch: the roll rotates, slips **translate** into place with a 40ms per-slip stagger on `--ease-brush`, each firing its pitched clack (rate-limited 22Hz; backward scrub plays at −4dB, low-passed). Nothing about a slip fades in — it arrives by moving, like an object.

**Reading at a glance.** Each slip carries a vertical **ink-spent bar** filling from the top: the chapter's contribution to the global ink budget, in the ink ramp, not a progress bar. The reader learns to read the ledger as darkness, which is the whole lesson in miniature.

| State | Appearance |
|---|---|
| **Locked** (unvisited) | Bare bamboo `--color-paper-300`, 38% opacity, no numeral, no bar. Reachable — the canon is never gated. |
| **Current** | Protrudes 6px left, gold hairline (`--color-gold-500`, 1px) on the leading edge, 篆書 numeral, faint breathing of the cord at 0.4Hz. |
| **Completed** | 楷書 numeral in `--fg`, ink bar at final density, plus one mark: **vermilion seal dot** if the decision spent ink, **gold dot** if it restrained. |
| **Out of order** | Completed, but the cord is slack between it and its neighbour — a visible gap in the binding. |

**Hover.** Slip protrudes to 10px over 220ms `--ease-brush`, clack at −6dB, and a **slip laid flat** (never a card, never a shadow, never a rounded rectangle) unrolls to its left in 180ms: 篆書 numeral, 漢字 title, English title, act name, and the apparatus line `ink spent · 0.14`. Focus produces the identical state; the ledger is a `<nav><ol>` of buttons and is the chapter jump menu (§8).

**Mobile.** The cord rotates to horizontal and pins to the bottom safe area: a 3px ink rule with 13 ticks, current tick gold, spent ink shown as tick weight. Tap anywhere on the cord opens the full ledger as a bottom sheet (max 72vh, scrollable, dismiss by drag or `Esc`).

### The rest of the HUD

- **Chapter title block** — top silk bar, 40% inset from the left: act numeral in gold hairline, 篆書 chapter glyph, English title in apparatus grotesque at `--text-micro`, tracked. Rewrites on chapter boundary by a stroke-order redraw, never a crossfade.
- **Mode switch** — bottom-right of the bottom bar. Two words: `幕 STORY` / `案 CODEX`, with the hover line *"the same hall, a different seat."* One control, two states, no toggle pill.
- **Audio toggle** — bottom-left: `有聲` / `靜`. Keyboard-reachable at all times (WCAG 1.4.2), never inside the frame, never auto-hidden by the quiet state.
- **Letterbox bars as a UI surface.** The silk is the only chrome plane. It carries: title block, captions, audio, mode switch, and on mobile the cord. Nothing else may live there and nothing may ever overlap the frame. **Bar height is itself signal**: when the aperture tightens to 2.76:1 the bars grow, and that growth is the reader's first warning that a decision is closing.
- **Quiet state** (`data-hud="quiet"`, set when `scroll.atRest && beat.isCutscene`, or always during BLOOM/DRY). The HUD **retracts physically rather than fading**: the cord rolls to an 8px bamboo edge, the title block slides up behind the top bar, the switches translate into the silk. Pointer or key restores it in 180ms. The audio control never retracts past its 44px hit area.

---

## 3. TACTIC DECISION NODES

### Locking scroll without breaking the page

We never call `preventDefault` on touch, never set `position:fixed` on `<body>`, never fight the compositor. **The document simply ends.** `NodeSection` renders `height: calc(var(--beats) * 100svh)` where `--beats = 1` while unresolved and `3` after commit. There is nothing below to scroll to, so native scrolling, momentum, rubber-band, scroll restoration, keyboard and screen readers all behave normally. Growth happens *below* the reader, so nothing shifts. `scroll.locked = true` is published for the render loop; the `<fieldset>` is focus-trapped. Height growth is deferred until `scroll.atRest` so it never lands under an active fling. `overscroll-behavior-y: contain` on the section.

Attempts to scroll past are read as pressure: each blocked attempt tightens the aperture by 0.02 (cap 2.82) and thickens the bed. After two, one line of Commander appears — *"Nothing moves until you do."*

### The machine

| State | Scroll | Camera | HUD | Exit |
|---|---|---|---|---|
| **dormant** | free | tracking, 85mm | normal | scroll |
| **armed** (`chapterProgress ≥ 0.62`) | free, but this is the last beat | track continues | title block only; bars begin growing | scroll forward → presented |
| **presented** (LOAD done) | clamped by document end | **one cut** to node framing — caused by the reader arriving | quiet; ledger dimmed to the current slip | choose, or scroll **back** (review is always legal) |
| **hover-preview** | clamped | still | unchanged | move off (260ms out) |
| **committed** | clamped | still | hidden | none — 400ms of true silence |
| **simulating** (MARK→BLOOM) | clamped | tracks, never cuts, 2.5–6s | hidden; live region narrates | none |
| **consequence** (DRY, 4–12s) | height grows to 3 beats at `atRest` | slow pan-and-scan across the deposit | cord returns showing the new density | scroll |
| **verdict** (READ, legal only at M≈0) | free | aperture opens 2.76 → 2.39 | full | scroll |
| **resolved** | free | normal | slip stamped, budget updated | scroll |

**Hover-preview** paints 淡墨 at ~0.35 of final D into a *preview* buffer that is never accumulated into D. Both options must be equally attractive — equal preview area, equal audio level, equal type weight. Nothing brightens for the "right" answer; that is the no-fake-agency refusal in pixels.

**Can the reader change their answer?** Before `pointerup`, freely. After, never — and the site says so rather than hiding the control. The untaken branch is later shown in Codex as a **jade outline with no fill**: a thing in a mind, never re-playable footage.

**Second visit.** A resolved node rehydrates from storage: the ink is already deposited at high-water, the slip is already stamped, the camera opens at READ, the aperture never tightens, and no seal sound plays. The only way to clear a decision is **Begin again**, which resets `decisions`, `inkHigh` and `visited` together — you cannot un-spend one stroke while keeping the rest.

**Stored per node:** `{ chapter, option, at, inkSpent, tideCount, beatsSeen }`.

---

## 4. COMPONENT HIERARCHY

`(S)` server · `(C)` client. Nothing under `src/three/**` is imported by an `(S)` file, even as a type.

```
app/layout.tsx                                (S) html[data-ground], fonts, metadata
└─ app/(experience)/layout.tsx                (S) shell; renders article as children
   ├─ StoreHydrator                           (C) rehydrate persist, probe quality, media queries
   └─ ExperienceRoot                          (C) owns mode/aperture/ground; children = the article
      ├─ ScrollDriver                         (C) rAF ticker; writes scroll/ink singletons; renders null
      ├─ StageLoader                          (C) dynamic(ssr:false) boundary for the canvas
      │  └─ three/Stage                       (C) <Canvas>, renderer config, resident FBOs
      │     ├─ CameraRig                      (R3F) four-lens jurisdiction, rails, projection blend
      │     ├─ SceneController                (R3F) mounts/disposes chapter scenes off scroll
      │     ├─ InkField                       (R3F) resident ping-pong D/M/S/A/G simulation
      │     ├─ Suspense fallback={null}
      │     │  └─ ChapterScene[n]             (R3F) lazy per chapter
      │     │     ├─ ParallaxPlate ×3         (R3F) fore/mid/back ink plates
      │     │     ├─ DioramaGroup             (R3F) 24fps stepped armies-as-strokes
      │     │     ├─ GlyphSDF                 (R3F) stroke-order SDF glyphs, wettable
      │     │     ├─ TerrainField             (R3F) dry ink terrain + G vector field
      │     │     └─ WeatherLayer             (R3F) MistMotes / RainField / EmberField (Ch12)
      │     ├─ NodeStage                      (R3F) preview buffer, MARK promotion, tide emitter
      │     ├─ PostChain                      (R3F) DOF + bloom + paper grain, tier-gated
      │     └─ FrameWatchdog                  (R3F) p90 EMA, demote/promote, renders null
      ├─ Letterbox                            (C) silk bars; aspect state variable; UI surface
      ├─ WarCouncilHUD                        (C) quiet-state orchestration
      │  ├─ BambooLedger                      (C) <nav><ol>, jump menu
      │  │  ├─ SlipCord                       (C) roll transform, act gaps
      │  │  ├─ Slip                           (C) locked/current/completed/out-of-order
      │  │  └─ SlipDetail                     (C) flat-laid slip on hover/focus
      │  ├─ ChapterTitleBlock                 (C) 篆書 redraw on boundary
      │  ├─ ModeSwitch                        (C) fires the 平置 timeline
      │  ├─ AudioToggle                       (C) consent + persistent stop
      │  ├─ InkBudgetMeter                    (C) mean page density vs act ceiling
      │  └─ CaptionRail                       (C) WebVTT cues in the bottom silk
      ├─ EnterGate                            (C) poster frame, 入, audio offer
      ├─ AudioDirector                        (C) Web Audio graph; renders null
      ├─ LiveInkAnnouncer                     (C) aria-live=polite ink narration
      ├─ StoryArticle                         (S) <article> — the accessibility + SEO spine
      │  └─ ChapterSection ×13                (S) <section> per beat, ids b1…bn
      │     ├─ DictumBlock                    (S) 漢字 + translation
      │     ├─ HistorianAside                 (S) dated apparatus, sources
      │     ├─ DecisionNodeSection            (S) <fieldset> with two real <button>s
      │     │  └─ DecisionNode                (C) the state machine above
      │     └─ VerdictPanel                   (C) READ-gated analysis
      ├─ CodexView                            (C) apparatus column, mask-wipe reveal
      │  ├─ CodexLineTable                    (C) han/pinyin/literal/modern
      │  ├─ BranchComparison                  (C) taken vs jade outline
      │  └─ ProvenanceNote                    (S) Yinqueshan, 1972
      ├─ EndingScroll                         (C) the reader's own sheet, 百戰百勝, begin again
      └─ FallbackPlates                       (C) no-WebGL plate book (§10)
```

---

## 5. STATE MANAGEMENT MODEL

**Rule zero: continuous values never enter React.** `scroll`, `ink`, `aperture` and `pointer` are mutable module singletons written once per rAF and read directly inside `useFrame`. The zustand store holds only quantised or user-authored state.

```ts
// src/store/experience.ts — slices
progress: { chapter: number; beat: number; visited: number[]; outOfOrder: number[];
            inkHigh: number; actCeilingHit: boolean }
chapters: { active: number|null; loaded: number[]; prefetching: number|null }   // never persisted
mode:     { mode: 'story'|'codex'; transitioning: boolean; ground: 'paper'|'ink'; aspect: 2.39|2.76|1.7778 }
audio:    { consented: boolean; enabled: boolean; master: number; quiet: boolean; captions: boolean }
quality:  { tier: 'high'|'medium'|'low'; auto: boolean; webgl2: boolean; saveData: boolean } // never persisted
decisions:{ byChapter: Record<number, {option:'a'|'b'; at:number; inkSpent:number; tideCount:number}> }
a11y:     { reducedMotion: boolean; contrast: 'normal'|'more'; reducedTransparency: boolean;
            keyboardOnly: boolean }
node:     { phase: NodePhase; chapter: number|null; hovered: 'a'|'b'|null; latched: 'a'|'b'|null }
```

**Persisted (`aow:v1`, `partialize`):** `mode.mode`, `audio.{consented,enabled,master,quiet,captions}`, `decisions.byChapter`, `progress.{visited,outOfOrder,inkHigh,chapter,beat}`, plus `version` for migration. **Never persisted:** quality tier (re-probe every session — devices thermally throttle and users change monitors), `a11y` (media queries are authoritative), `chapters`, `node`, anything about the camera. Rehydration happens after mount; server render is the neutral state, so hydration never diverges.

**Selector discipline.** Atomic selectors only (`useExperience(s => s.mode.mode)`); `useShallow` wherever a component needs more than one field; `subscribeWithSelector` for imperative bridges into three.js and GSAP; `useSyncExternalStore` with a **cached** snapshot for discrete scroll. No component above `<Canvas>` may subscribe to anything that changes more than a few times per minute. Store writes originating in the loop are funnelled through `commitBeat()`, which is called only when the quantised beat index changes, never per frame.

---

## 6. STYLING TOKENS

Tailwind v4, one `@theme` block, no config file. Components read semantic aliases (`--fg`, `--surface`), never raw ramps — the paper/ink ground flip depends on it.

```css
@theme {
  /* 松煙墨 ink */
  --color-ink-950:#0B0F0E; --color-ink-900:#131917; --color-ink-800:#1B2321;
  --color-ink-700:#2A3532; --color-ink-600:#3E4A47; --color-ink-500:#5A6764;
  --color-ink-400:#7C8985; --color-ink-300:#9BA6A2; --color-ink-200:#B9C0BB; --color-ink-100:#D5DAD6;
  /* 宣紙 paper */
  --color-paper-050:#F4F0E6; /* 留白 */ --color-paper-100:#E8E2D4; --color-paper-200:#DCD3BE;
  --color-paper-300:#CBC0A6; --color-paper-400:#B2A487;
  /* 石綠 jade — cognition only */
  --color-jade-700:#1F4A3D; --color-jade-500:#2F6B5A; --color-jade-400:#5C9A86; --color-jade-200:#9CC4B4;
  /* 金 gold — sovereignty and expenditure */
  --color-gold-700:#8A6D14; --color-gold-500:#C9A227; --color-gold-300:#E8CE72;
  /* 朱砂 vermilion — the seal, and blood */
  --color-vermilion-700:#A82B23; --color-vermilion-500:#C1352B; --color-vermilion-400:#D9432F;
  --color-muddied:#2A1410;   /* carbon + cinnabar. Never pink, never orange. */

  --font-han:var(--font-noto-han),"Noto Serif TC","Songti TC",serif;
  --font-serif:var(--font-newsreader),Georgia,serif;      /* translation = speech */
  --font-sans:var(--font-inter),system-ui,sans-serif;      /* apparatus = argument */
  --font-mono:var(--font-mono-plex),ui-monospace,monospace;/* numerals, ledger */

  --text-micro:.6875rem; --text-caption:.8125rem; --text-body:1.0625rem; --text-lead:1.375rem;
  --text-dictum:clamp(1.75rem,3.2vw,3rem);
  --text-title:clamp(2.5rem,6vw,5.5rem);
  --text-glyph:clamp(6rem,22vw,22rem);

  --space-hair:1px; --space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem;
  --space-6:1.5rem; --space-8:2rem; --space-12:3rem; --space-16:4rem; --space-24:6rem;
  --measure-apparatus:64ch; --slip-pitch:clamp(18px,2.1vh,26px); --slip-width:clamp(14px,1.4vw,22px);

  --aspect-story:2.39; --aspect-node:2.76; --aspect-codex:1.7778;
  --aspect-portrait:.8333;                    /* 立軸 hanging-scroll mount */

  --ease-brush:cubic-bezier(.22,1,.36,1);     /* a stroke landing */
  --ease-soak:cubic-bezier(.33,0,.15,1);      /* ink entering paper */
  --ease-seal:cubic-bezier(.7,0,.2,1);        /* the press */
  --ease-drift:cubic-bezier(.4,0,.6,1);       /* fog, weather */
  --ease-silk:cubic-bezier(.16,1,.3,1);       /* the mounting, aperture, 平置 */
  --ease-tide:cubic-bezier(.85,0,1,.35);      /* stop without a cadence */

  --dur-instant:90ms; --dur-quick:220ms; --dur-beat:620ms; --dur-silk:900ms;
  --dur-soak:1400ms; --dur-scene:2600ms; --dur-dry:8000ms;

  --z-canvas:0; --z-scrim:10; --z-content:20; --z-letterbox:30;
  --z-hud:40; --z-node:50; --z-gate:60; --z-live:70;
}
:root{
  --bar-h:max(0px, calc((100svh - 100vw / var(--aspect)) / 2));
  --aspect:var(--aspect-story);
  --hud-inset:clamp(1rem,2.5vw,2.5rem);
  /* The only elevation in the system: a slip touching paper. No blur >6px, no black. */
  --shadow-contact:0 1px 2px rgb(11 15 14 / .18), 0 4px 6px -4px rgb(11 15 14 / .10);
  --shadow-none:none;
}
.vertical{ writing-mode:vertical-rl; text-orientation:upright;
           text-combine-upright:digits 2; font-feature-settings:"vert" 1; line-height:1.9; }
@media (prefers-contrast:more){ :root{ --fg:var(--color-ink-950); --surface:var(--color-paper-050); } }
```

**Light/dark story: there is no toggle.** Ground is authored per chapter — `html[data-ground='paper']` for daylight, `html[data-ground='ink']` for the four night chapters (9, 11, 12, 13). Accents never flip; jade, gold and vermilion mean the same on either ground.

---

## 7. RESPONSIVE & MOBILE

A 2.39:1 frame at 390px wide is 163px tall. Squeezing the cinema onto a phone is the wrong answer, so we change the **mount**, not the crop.

**A handscroll becomes a hanging scroll.** Landscape and desktop use 手卷 — horizontal, 2.39:1, silk top and bottom. Portrait uses **立軸**: the silk runs left and right as 4.5vw pillar-box mounts, and the frame becomes **0.83:1** vertical. This is a real mounting from the same material culture, not a fallback. The camera compensates by matching **horizontal** FOV to the 24/40/85mm equivalents and letting the vertical extend, so lens jurisdiction is preserved. **180mm is the exception**: enemy shots stay 2.39:1 and drop in as an inset plate on the sheet, so compression — the whole argument of that lens — survives.

Other portrait rules:
- **Beat list is authored, not derived.** `beats.mobile` drops establishing 24mm beats, never argument beats. Chapter 7 goes 9 beats → 6; no chapter drops a node.
- Type: `--text-glyph` clamps to `clamp(4rem,44vw,12rem)`; dictum ≤16 words; vertical 直書 is used for titles and seals only, never for running canon on a phone.
- HUD: cord horizontal at the bottom, title block collapses to act numeral + 篆書 glyph, mode switch moves into the ledger sheet.
- Hit targets ≥44px; the silk mounts hold the safe-area insets.

**Touch scroll-lock.** The document-height gate (§3) is the whole solution: with nothing below to scroll to, iOS momentum simply ends at the wall, there is no `touchmove` interception, no `body{position:fixed}` jump, no lost scroll restoration. Two additions: the arm boundary is authored one beat earlier on mobile so a fling cannot carry a reader past LOAD, and height growth after commit is deferred until `scroll.velocity` falls below the fling threshold.

**No hover on touch**, so hover-preview becomes an explicit two-step: first tap latches an option and paints the 淡墨 preview, and its label becomes `按印 — press the seal`; a second tap on the same option commits; a tap on the other switches the preview. Nothing commits on a single tap, ever.

---

## 8. NAVIGATION & DEEP LINKING

- `/` — enter gate + Chapter 1.
- `/ch/03-mou-gong` — chapter route, slug = `{nn}-{pinyin}`. Same page, different `initialChapter`; it is one experience, not thirteen documents.
- `?m=codex` — mode, applied on load, thereafter written with `history.replaceState` so switching never navigates.
- `#b7` — beat anchor within the chapter.

`history.scrollRestoration = 'manual'`. On load we wait for the article's `ResizeObserver` to settle plus one `ScrollTrigger.refresh()`, then jump (never smooth) to the computed offset. **A deep link never lands mid-node or mid-bloom** — it resolves to the beat before the node if unresolved, or to READ if the reader already committed in a prior session.

**Chapter jump menu is the ledger** — no separate menu component. Locked chapters are reachable, because gating the canon would be a worse sin than an unearned page: jumping ahead marks the chapter `outOfOrder`, slackens the cord, and prints one apparatus line under the ledger: *"read out of order."*

**Share cards.** Static per-chapter `opengraph-image.tsx` (next/og), 1200×630, letterboxed 2.39:1: 篆書 glyph, act rule, chapter title, no ink from any reader. Personal ink is never in a URL and never on a server. The **ending** offers the reader's own sheet as a client-rendered PNG they can save — a private artefact, not a score to post.

---

## 9. MICROCOPY & VOICE

The UI speaks as the Historian's apparatus — flat, specific, no exclamation, no second person except at nodes.

**Enter screen.** `兵法` (篆書, drawn in stroke order) · `The Art of War · 孫子兵法` · *"Thirteen chapters. You will not see a battle."* · button `入 ENTER` · below it, `有聲 with sound` / `靜 without` and the note *"There is no narration you will miss. The sound is weather, drums, and the seal."*

**Audio prompt (post-enter, if declined).** *"Sound can be turned on at any time. Everything it carries is also on the page."*

**Mode switch.** `幕 STORY` / `案 CODEX`, hover: *"the same hall, a different seat."*

**Decision node.** Header: `擇 · CHOOSE` and the state line *"You have spent nothing yet."* Options carry the operative term in 行草 plus a plain gloss. Blocked scroll: *"Nothing moves until you do."* On commit: *"The mark is yours. It does not lift."* During dry: *"Wait for it to dry."* Verdict opens: *"What it cost: 0.06 of the sheet."* Revisit: *"You chose this. The other branch was never run."*

**Loading.** No spinner, no percentage, ever. Visually it is a full-frame ink wash. For assistive tech only: *"Preparing chapter three."* If warm-up outruns the wash, the Historian's opening line covers it.

**End.** The reader's thirteen chapters unroll as one sheet. Then, on a clean sheet: `百戰百勝，非善之善者也；不戰而屈人之兵，善之善者也。` / *"To win a hundred battles in a hundred fights is not the highest excellence. To break the enemy's resistance without fighting is the highest excellence."* Then one control: `再 BEGIN AGAIN`, with *"Your second reading will use less ink. That is the whole of it."*

---

## 10. EMPTY / ERROR / FALLBACK STATES

- **No WebGL / context lost.** `FallbackPlates`: an authored **plate book** — one dried AVIF plate per beat, drawn from the real simulation at build time, not a screenshot of a failure. Notice: *"This device will not run the ink. The plates are the finished state of the same argument."* Decision nodes still work; they swap plates instead of simulating, and still spend ink in the ledger. Context loss mid-read restores to the plate book at the current beat without reloading.
- **Slow network / `saveData` / `effectiveType ≤ 3g`.** Force `quality.tier = 'low'`, disable prefetch, stream chapter *n* only. The poster frame is server HTML and is the LCP element; the ink wash cover is extensible to ~4s before the Historian takes over. Nothing ever displays a percentage.
- **`prefers-reduced-motion`.** A render path, not a preference: the sim runs its substeps off-screen and presents the **dried** state; the camera cuts instead of tracks; the aperture snaps; particles, DOF and bloom off; grain stays. The 平置 transition becomes a single 120ms state change with the mask wipe pre-completed. Every deposit, tide line and seal is present — only the physics of arriving is withheld.
- **Audio blocked or unavailable.** Toggle shows `靜`, one apparatus line appears once: *"Sound is off. Nothing in the argument depends on it."* Tide ticks become tide **flashes** on the ledger; the seal becomes a 90ms vermilion press with no sound. Captions remain available for the Historian.
- **The very fast reader.** No scroll-jacking, ever. Above `velocity > 4vh/s`: text reveals are suppressed until `atRest` so type never flickers, slip clacks become 22Hz texture, prefetch is skipped, and scene swaps hold behind the ink wash until `compiled && uploaded`. `tInk` still accrues to the high-water mark — **you own the ink you flew past** — and on coming to rest the live region states what was crossed: *"You passed four chapters. The page is now 34 percent ink."*
- **No decisions, no progress (the true empty state).** A clean sheet is not an empty state in this project. It is the best outcome, and it is labelled as such: `留白 · nothing spent`.
