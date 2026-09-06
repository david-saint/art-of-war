# 孫子兵法 — SOUNDSCAPE & AUDIO DESIGN SPECIFICATION

**v1.0 · subordinate to `manifesto.md`. Where they disagree, the manifesto wins.**
**Reference pitch: 黃鐘 = D. D2 = 73.42 Hz. All frequencies below are derived from it.**
**Loudness targets: integrated −20 LUFS across a full read · true peak ≤ −1.0 dBTP · momentary ceiling −9 LUFS.**

---

## 1. THE AUDIO THESIS

This site sounds like a hall in which an army is being *counted*, not fought: rammed earth, a low room tone, distant weather, one instrument at a time, and long stretches where a competent listener would check whether their speakers had failed. Sound here is evidence, not atmosphere — every layer is bound to a state variable in the Ink Law, so the mix darkens exactly as the page darkens and the reader hears their own expenditure accumulate without being told about it. Sun Tzu's book is about the moment before contact, and that moment is quiet; the score therefore works by subtraction, and the ear is trained the way the eye is — by learning what the absence of a sound means. **The loudest event in the project by peak is the vermilion seal, 22 milliseconds of stone on paper; the loudest by weight is a single bronze bell allowed nine seconds of undisturbed decay after a reader chooses *not* to strike.** Nothing else in the mix is permitted to move while that bell rings. Restraint gets the biggest sound in the building, and it gets it by being given the room rather than volume.

---

## 2. INSTRUMENT PALETTE

Solo or near-solo throughout. **There is no ensemble and no tutti anywhere.** Two instruments sound together only where the doctrine below names the pair.

| Instrument | Role | Register | Chapters |
|---|---|---|---|
| **古琴 guqin** | The scholar-strategist. Private, near-inaudible, played *for oneself*. The instrument of calculation and of the Text's punctuation. Never accompanies anything; anything under it is a mistake. | Open strings ≈ 65–294 Hz; 泛音 harmonics to 2.6 kHz | 1, 3, 6, 13, and every Text block site-wide |
| **古箏 guzheng** | The public, projecting, percussive counterpart — an instrument for an audience, therefore for *display of force*. 搖指 tremolo = massed movement; 刮奏 glissando = commitment already in motion. Banned in Act I except a single 刮奏 at Chapter 3's siege rung. | D2–A6 | 3 (once), 5, 7 |
| **簫 xiao** | Distance, breath, cold. Air noise carried at −14 dB below the tone deliberately: you hear the effort. | D4–D6 | 9, 10, 11 |
| **笛 dizi** (with 膜 membrane) | Alarm and rumour. The membrane buzz is the point — a signal that carries too far and cannot be recalled. Short figures only, never a melody. | C5–C7 | 8, 9 |
| **二胡 erhu** | The one instrument that sounds like a human voice, therefore rationed: it appears only where the cost is measured in people. Three appearances in the whole site. | G3–D6 | 2, 12, 13 |
| **笙 sheng** | The only polyphonic wind: harmonic *mass* with no melodic intent. Used for 形 — a disposition is a chord that does not move. A held sheng cluster is how invisible sizing (S) is heard: the reader hears structure they cannot see. | C4–C6 clusters | 4, 6 |
| **排鼓 paigu / 堂鼓 tanggu** | The Commander. 鼓 advances and commits. Paigu (tuned, four heads, 110/146/196/246 Hz) for articulate signals; tanggu (90–160 Hz, mallet) for weight and for doubling transition hits. | 90–250 Hz + stick noise 3–5 kHz | All; gated by *action*, never by scroll |
| **編鐘 bianzhong** | 金 withdraws and returns. Correct-dynasty bronze (Marquis Yi, 433 BCE). The two-tone bell is exploited literally: **正鼓 = sovereign authority; 側鼓 = expenditure** — one object, two pitches, matching gold's two meanings. Long protected decays (6–9 s). | 200 Hz – 3 kHz, RT ≈ 9 s | 1, 3 (restraint outcome), 4, 13, ending |
| **嗩吶 suona** | Funeral and military horn. **Appears exactly twice in the entire site** and never as melody: one held note that cracks at the top of its envelope. | A4–C6 | 12 (fire takes), 13 (the dead agent) |

---

## 3. THE MODE SYSTEM (五聲)

One mode per act, stated as a pitch collection. Instruments outside the act's mode are muted, not transposed.

- **ACT I — 宮 gong on D** (D E F♯ A B). Maximum consonance, no tritone, ledger-flat. Arithmetic sounds settled because the reader still thinks it is.
- **ACT II — 徵 zhi on A** (A B D E F♯). The fourth against the tonic gives the act its lean; 勢 is stored tension and the mode stores it.
- **ACT III — 羽 yu on B** (B D E F♯ A). The exhausted collection. Additionally, from Chapter 9 onward every pitched layer drifts flat, linearly, to **−14 cents by the end of Chapter 11**, and never returns. The reader will not name it. They will feel that competence is being eaten.
- **ACT IV — 商 shang on E** (E F♯ A B D). 商 is 金 / autumn / west / the executioner in 五行 correspondence: the correct mode for fire and for the purchase of men.

**角 jue is never used.** It is the mode of wood, spring and growth, and it is withheld for the entire site — the 留白 of the pitch system.

**The one break.** Chapter 13 admits the two non-pentatonic tones, **變徵 (♯4, A♯ against E) and 變宮 (♮7, D♯)**, on erhu and suona only. The spy is the tone from outside the collection; the system does not survive contact with him. The break does not resolve — Chapter 13 ends on 變徵, unresolved, and the sound simply stops.

**The ending is not a break but a payment.** On the clean sheet, guqin alone, **角 jue on F♯**, first and only appearance, 14 seconds. It is the sound of a mode nobody spent.

---

## 4. LAYER ARCHITECTURE

Six concurrent stems. Nominal gains are relative to the −20 LUFS programme.

| Stem | Nominal | Gated by | Story | Codex |
|---|---|---|---|---|
| **BED** — room tone, rammed earth, paper hiss, a 44 Hz standing-room mode | −34 dB | Always on except §11 | full | −4 dB |
| **TERRAIN** — wind, water, bamboo, rain, grain-cart timber | −24 dB | Chapter, crossfaded over one viewport-height of scroll (equal-power, 1.4 s min) | full | −10 dB, low-passed 3 kHz |
| **THREAT** — sub-bed, distant drums, the 180mm enemy | **gain = −30 dB + 26 dB · meanPageDensity** | `tInk` only, therefore monotonic | full | **muted** — Codex is orthographic and has no threat |
| **RITUAL / PERCUSSION** — the Commander | one-shots, −14 to −3 dBTP | Reader action *only*. Never fires on scroll | full | commit sounds only |
| **NARRATION** — the Historian | −19 LUFS short-term | Chapter + mode | Act boundaries only | full, privileged |
| **UI / FOLEY** | −26 to −3 dBTP | Input | full | full, +2 dB |

**The load-bearing rule:** THREAT is a pure function of mean page density — monotonic, capped per act at 0.06 / 0.18 / 0.42 / 0.55. Scrolling back (`tCamera`) restores the shot but not the mix. **You may review; you may not undo — in audio as in ink.** Codex is a *change of seat*: same bus structure, world sources back 10 dB and shelved, narration forward, reverb send 8% → 3%. Never a different soundtrack.

---

## 5. SPATIALISATION

**Positional (PannerNode, HRTF, `distanceModel: 'inverse'`, refDistance 1.0, rolloff 1.6): maximum six concurrent sources.** Rain impacts on lacquer, the drum at an untouched decision node, wind off a named ridge, fire cells, the tide-line tick, the reader's own brush. Everything else is a stereo bed on an equal-power pan, and beds are never panned by camera.

Camera-to-listener transform is by **focal length, not position**:

- **24mm** — scene scale 1.0, orientation follows the camera's forward vector, pans track 1:1.
- **40mm** — scale 0.8. The Historian is fixed at azimuth +25°, 1.2 m: beside you at a table, never inside your head.
- **85mm** — scale 0.45. The named factor is close and dry; reverb send 4%.
- **180mm** — **the listener does not move.** Enemy sources are frozen at 6.5× distance, collapsed toward mono (width 18%), low-passed at 1.8 kHz with a −4 dB shelf above 800 Hz, and never given a reverb send from the reader's room. *You do not share acoustic space with the opposing force.* This is the audio statement of the manifesto's camera rule and it is not negotiable for "clarity".

**Phone speaker.** Detect via output channel count plus `matchMedia('(pointer: coarse)')` with no headphones. When mono-folded: HRTF replaced by a gain-and-filter distance proxy (no phase cue survives a fold-down); width clamped to 60%; **everything below 120 Hz removed and its energy re-expressed as a 180–400 Hz band-passed tanggu double with +4 dB of 3–5 kHz stick noise** — the transient survives though the weight cannot. Sub-only events (§6) are *never* silent on phone; they become a knock.

---

## 6. TRANSITION HITS

Fires at the 12 chapter boundaries and the 3 act boundaries. Nowhere else, ever.

- **Sub layer.** Sine, glide **46 Hz → 31 Hz over 900 ms** (settling at D1, 36.71 Hz, at t = 400 ms). Envelope: 12 ms attack, 380 ms body, 2.6 s exponential decay to −60 dB. Peak −6 dBFS, momentary ≈ −22 LUFS.
- **Tanggu doubling.** Mallet strike, fundamental 90–160 Hz, its transient placed **8 ms *ahead* of the sub** — the ear gets the event before it gets the weight. Plus a separate 3–5 kHz skin/stick layer at −22 dB, which is the only part a laptop speaker will reproduce.
- **Act boundaries** are 1.5× amplitude and add one **bianzhong 側鼓** at t = +1.9 s, into the sub's decay, unducked.
- **Ducking rule.** Sidechain from the hit's envelope: BED −12 dB, TERRAIN −9 dB, THREAT −9 dB, NARRATION −9 dB. Attack 5 ms, hold 220 ms, release 900 ms exponential. **UI/FOLEY is never ducked** (the reader must always hear their own hands) and the Text's guqin partial is exempt. No transition hit may occur within 1.2 s of a seal press; if scheduling collides, the hit is dropped, not delayed.

---

## 7. FOLEY & UI SOUND

**THE SEAL (印) — the single most important sound in the project.** Five components, 340 ms total, composited at fixed relative levels:

1. **Paste tack** — 12 ms sticky separation from the cinnabar tray, 900 Hz–4 kHz, −30 dB. Plays on *hover-hold only*, never as part of the commit.
2. **Contact** — 22 ms broadband transient, dominant 400–1200 Hz, stone on paper on wood. **Peak −3 dBTP: the loudest sample in the build.** No reverb on the transient itself.
3. **Pressure** — 60–140 ms, 120–300 Hz desk groan plus a 2–6 kHz fibre crush at −18 dB.
4. **Release** — 40 ms peel/suction at 1.5–3 kHz, −21 dB. *The lift is the part that says it is done*; without it the seal reads as a click.
5. **Room** — 1.1 s tail from the rammed-earth convolution bus (RT60 1.4 s @ 500 Hz), plus one guqin harmonic on the act's 宮 at −26 dB.

Rules: **never pitch-shifted; varied by no more than ±1.5 semitones and ±0.8 dB across all thirteen uses** — the same object each time. **Never auditioned on hover.** `pointerup` to sample start ≤ 20 ms.

- **Bamboo slips.** Per-slip clack 15–30 ms, tube resonance 380–900 Hz, pitch stepped by chapter index. Rate-limited to 22 Hz so fast scroll becomes texture, not a machine gun. **Scrubbing backward plays the same clacks at −4 dB, low-passed at 4 kHz: review is quieter than progress.**
- **Brush on paper.** Granular; noise band widens 800 Hz → 7 kHz with stroke velocity. 飛白 is rendered as *amplitude dropouts*, never as filtering — the reserve ran out, the tone didn't change.
- **Arrow.** Release only: bow-limb thump 70–200 Hz plus string 400 Hz, then nothing. **No pass-by whoosh, no impact.** Arrival is a change in the ink; audio does not confirm the kill.
- **Rain on lacquer.** Broad hiss bed plus a positional discrete-impact grain layer. **Rain gain is a direct function of M** — wet ground is contested ground, and you hear where the fog is.
- **Fire (Ch. 12 only).** 30–80 Hz roar, 200–900 Hz body, 2–9 kHz crackle grains whose spawn rate tracks burning area. The only layer permitted to exceed the THREAT ceiling, by up to 5 dB.

---

## 8. THE DECISION NODE

**LOAD.** Everything ducks 6 dB over 700 ms while the frame tightens to 2.76:1, and **stereo width closes from 100% to 46%** — the mix physically narrows with the aperture. One tanggu at −14 dB. Bed low shelf +2 dB below 90 Hz. Then 900 ms of bristle-in-water, positional, at the reader's own head position.

**Hover.** Option A = a paigu head touched with the palm at centre (110 Hz, damped, 180 ms). Option B = **the same drum, same hand, touched at the rim** (rim mode ≈ 240 Hz, 140 ms). Both at −20 dB. **The two hovers must be equally attractive and must not predict outcome** — this is the audio form of the no-fake-agency refusal. Nothing brightens for the "right" answer.

**Commit.** The seal, then **400 ms of true silence.** The mix is emptied and the reader hears their own room. That gap is the price of the stroke.

**MARK → BLOOM → DRY.** Silence lifts into physics only, no music. Bleed is a 1/f noise band tracking the bleed front: 2.4 kHz at K∥ maximum, descending to 340 Hz and narrowing to Q 6 as M decays over 4–12 s, then stopping without a cadence. **Every tide line fires an 8 ms tick at 5.6 kHz, −24 dB, panned to its screen position** — the sound of something becoming permanent, and the most important non-UI sound in the site. **READ** (analysis) is legal only at M ≈ 0, and the Historian may not speak before the last tick.

**Two outcome signatures.**
- **RESTRAINT** *(the branch that spends no ink)*: one bianzhong, 正鼓, **6–9 s of protected decay**. The duck does not release until the tail passes −48 dB. No music, no bed swell, no reward tone. The reader must wait out the bell.
- **EXPENDITURE** *(the branch that marks the page)*: tanggu + sub hit, and **the THREAT stem is raised +1.5 dB permanently for the rest of the session, never lowered** (hard cap +12 dB). A heavy reader arrives at Chapter 13 in a mix they made and cannot get back.

---

## 9. NARRATION

**THE TEXT (經) — no voice, anywhere, in any language.** Bed ducks to −∞ over 180 ms starting 200 ms before the first stroke; a single guqin 泛音 (7th-node harmonic, 2.5–3 s decay) at −26 dB; then nothing until 600 ms after the last stroke dries. Its audio is a hole in the mix, and the hole is the point.

**THE HISTORIAN (史) — the only human voice in the project.** English, one performer, catalogue delivery, no rhetorical lifts, no vocal fry warmth. Chain: cardioid at 25 cm → HPF 80 Hz @ 12 dB/oct → de-esser 6.5 kHz, 3 dB → compressor 2.5:1 @ −18 dBFS, 4 ms / 90 ms → rammed-earth convolution at **8% wet only** (same hall as the reader, close mic'd) → −19 LUFS short-term. Fixed at +25° azimuth, 1.2 m. He never speaks over the Text, never during a node, and never during a transition hit.

**THE COMMANDER (將) — no voice at all.** Drum, metal, brush, seal. It is never vocoded, never whispered, never processed speech. Its "yes" is the seal press.

**Language policy.** **Chinese is never spoken by anyone.** The received thirteen chapters are a reconstruction with contested readings, and any single reading — Mandarin, Cantonese, reconstructed Old Chinese — is a modern editorial decision wearing the author's voice. The Chinese lives entirely as ink, so no non-Chinese-speaking reader misses a word of spoken content: there is none. **One exception, Codex only, off by default:** per line, a Baxter–Sagart Old Chinese reconstruction offered as a labelled *specimen* — "a linguist's hypothesis, c. 5th c. BCE" — read flat, unmusical, at −24 dB. It is a footnote with a speaker, not a performance, and it never appears in Story.

---

## 10. WEB AUDIO IMPLEMENTATION

**Audio is off by default and the graph does not exist until consent.** Not autoplay-muted: no `AudioContext`, no bytes fetched. The offer is one line of ink in the first viewport — 「有聲」 / *with sound* — and accepting it is the first gesture. Create and `resume()` inside that handler's call stack, then play a 40 ms silent buffer to confirm unlock. **Every meaning carried by audio has a visual equal**; the site is complete in silence — also the WCAG 1.4.2 position (all beds exceed 4 s, so a persistent, keyboard-reachable stop control is mandatory).

**Formats.** Opus-in-WebM, 48 kHz — 96 kbps stereo beds, 64 kbps mono foley, 112 kbps narration. AAC-LC `.m4a` fallback at 128/96/128 selected by a single `canPlayType` probe at unlock. Ship the six critical one-shots (seal ×1, tanggu ×2, bianzhong ×2, tide tick) at **both 44.1 and 48 kHz** (+180 KB) so the seal is never resampled on the fly on a 44.1 kHz device.

**Budget — 11.5 MB for a complete read, hard ceiling.** Beds 3.2 MB (six 40–60 s seamless loops) · terrain 2.4 · threat 1.4 · percussion one-shots 0.9 · UI foley 0.35 (**decoded to `AudioBuffer` at unlock and resident in RAM for the whole session**) · narration 3.2, streamed, never preloaded beyond chapter *n+1*. Beds and narration are `MediaElementAudioSourceNode`; anything the reader can trigger is a pre-decoded `AudioBufferSourceNode`.

**Latency.** `latencyHint: 'interactive'`. No `ScriptProcessor` anywhere. Never schedule the seal from a promise continuation — `start(ctx.currentTime + 0.005)` synchronously in the pointer handler.

**Lifecycle.** `suspend()` on `visibilitychange`; on resume, **do not replay missed events** — re-derive stem gains from `tInk`, fade in over 600 ms. Same after a device output change.

**Reduced motion / reduced sound.** `prefers-reduced-motion` also disables the physics layers (bleed noise, wind advection, tide ticks become one summary tick per node). Retained: the seal, the Historian, and the transition hit at half amplitude with the sub replaced by its tanggu component alone. A separate in-site **「靜」 quiet mode** caps momentary loudness at −28 LUFS and removes everything below 60 Hz.

---

## 11. THE SILENCE RULES

Silence is scheduled, not incidental. Below 1.5 s, silence carries a −60 dBFS room floor; the two entries marked **zero** are digital zero, because in those two moments the reader should genuinely wonder whether their audio has failed.

1. **Cold open** — 4.0 s of silence after unlock; bed fades in from −∞ over 6 s.
2. **Every Text block** — from −180 ms before the first stroke to +600 ms after the last stroke dries. Typically 4–9 s, thirteen-plus times.
3. **Post-commit** — 400 ms after every seal press.
4. **Every cut away from contact** — 700 ms. The battle we refuse to show, we also refuse to score.
5. **Chapter 3, 不戰而屈人之兵 — 6.0 s, zero.** The longest deliberate silence in the site and its thesis: this is the 留白 of the mix.
6. **Chapter 11, 死地** — THREAT cuts entirely for 2.5 s before the drums return 4 dB louder.
7. **Chapter 13, the hundred pieces of gold** — 3.0 s, and the Historian's closing sentence is delivered with the bed already gone.
8. **The ending — 8.0 s, zero**, over the reader's returned scroll. Then one bianzhong **側鼓** — the second pitch of a bell they have heard a dozen times and never heard say this — and 14 s of guqin in 角. Then silence again until *begin again* is chosen.

**Standing rule:** any moment where the reader could mistake silence for a bug is a moment we have designed correctly, provided the visual is still moving. If the screen is also still, add the room floor.
