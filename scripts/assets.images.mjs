// Declarative image asset manifest. Each entry is generated once and skipped if
// its output already exists, so the script is safe to re-run.
//
//   post: 'none'   -> keep the RGB image as-is
//        'alpha'   -> key luminance to alpha (black ink on white becomes opaque ink on transparent)
//        'alphaKeepColor' -> same, but preserve hue (used for the vermilion seals)
//        'mask'    -> flatten to a single-channel grayscale map (shader masks, height fields)

export const STYLE = [
  'Classical Chinese ink wash painting, shuimohua, sumi-e brushwork',
  'monochrome black ink, full tonal range from bone-dry scumble to saturated pooled black',
  'visible brush texture and bristle marks, ink bleeding into fibre',
  'deep atmospheric perspective, heavy mist, generous negative space',
  'museum quality, painted by a master, no digital look',
].join(', ')

export const NEG = 'no text, no calligraphy characters, no signature, no red seal stamp, no border, no frame, no watermark, not a photograph, no modern elements, no people in modern dress'

const scene = (p, extra = '') => `${p}. ${STYLE}. ${extra} ${NEG}`

/** Assets that are not chapter-specific: the material system of the whole site. */
export const CORE = [
  // ---- parallax plates -------------------------------------------------
  { id: 'plate/range-far-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('An immense range of distant mountain peaks dissolving into white mist, seen from very far away, only the faintest grey silhouettes remaining, ninety percent empty paper', 'Extremely pale, low contrast, almost nothing but fog. Composition weighted to the lower third.') },
  { id: 'plate/range-mid-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('A middle range of jagged mountain ridges with wind-bent pines clinging to the rock, wreathed in banded cloud', 'Medium grey values. Clear silhouette read. Horizontal composition.') },
  { id: 'plate/valley-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('A wide river valley between two mountain walls at dawn, a slow river of pale mist running down its floor', 'The valley floor is empty and inviting. A trap that looks like a road.') },
  { id: 'plate/plain-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('A vast flat alluvial plain under an enormous empty sky, a single low horizon line, reeds in the foreground', 'Ninety percent sky. Horizon in the bottom fifth.') },
  { id: 'plate/water-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('The surface of a broad slow river, painted as flowing ink currents and eddies seen from a low angle, opposite bank lost in haze', 'Fluid, calligraphic water strokes. No boats.') },
  { id: 'plate/burnt-01', aspect: '21:9', size: '2K', post: 'none',
    prompt: scene('A burnt encampment at night: charred timber frames, ash drifts, smoke columns rising into a black sky, everything reduced to skeleton shapes', 'Very dark, high contrast, soot and charcoal. Embers implied, not drawn.') },

  // ---- foreground silhouette layers (alpha) ----------------------------
  { id: 'sil/ridge-01', aspect: '21:9', size: '2K', post: 'alpha',
    prompt: 'A single foreground mountain ridge silhouette with three wind-bent pine trees, painted in solid opaque black ink with a torn brush edge, on a PURE WHITE background. Flat black shape, no grey, no shading, no texture inside the shape. The ridge runs along the bottom of the frame. ' + NEG },
  { id: 'sil/bamboo-01', aspect: '21:9', size: '2K', post: 'alpha',
    prompt: 'A screen of tall bamboo stalks and leaves at the left and right edges of the frame, painted in solid opaque black ink with confident single strokes, on a PURE WHITE background. Flat black, no grey wash, the centre of the frame is completely empty white. ' + NEG },
  { id: 'sil/banners-01', aspect: '21:9', size: '2K', post: 'alpha',
    prompt: 'A row of tall ancient Chinese military banner poles with long narrow pennants streaming in a strong wind, seen from below, painted as flat solid black ink silhouettes on a PURE WHITE background. Spring and Autumn period, no writing on the banners. ' + NEG },
  { id: 'sil/army-01', aspect: '21:9', size: '2K', post: 'alpha',
    prompt: 'A dense mass of ancient Chinese infantry seen from behind and far away as a low black band of spears and helmets, painted as a flat solid black ink silhouette with a ragged brush edge, on a PURE WHITE background. The spear tips break the top edge of the band irregularly. No individual faces. ' + NEG },
  { id: 'sil/cavalry-01', aspect: '21:9', size: '2K', post: 'alpha',
    prompt: 'Three ancient Chinese chariots with horses at full gallop in profile, painted as flat solid black ink silhouettes with dynamic dry-brush trailing edges, on a PURE WHITE background. Spring and Autumn period two-wheeled war chariots. ' + NEG },

  // ---- ink material library (alpha / mask) -----------------------------
  { id: 'ink/stroke-sheet-01', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'A sheet of sixteen isolated Chinese calligraphy brush strokes arranged in a four by four grid on a PURE WHITE background: long sweeping horizontals, dry split-bristle drags, heavy loaded starts that taper to nothing, hooked terminals. Pure black ink, each stroke fully separated from its neighbours with clear white space around it. ' + NEG },
  { id: 'ink/splat-sheet-01', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'A sheet of nine isolated ink splatters and blots on a PURE WHITE background, arranged in a three by three grid: droplets, thrown spatter, a pooled blot with a dark rim and a lighter centre, a bloom where water hit wet ink. Pure black ink, clear white space between each. ' + NEG },
  { id: 'ink/wash-cloud-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'A single large soft ink wash bloom spreading through wet rice paper, seen flat from above, dense black at the centre fading through every grey to nothing at the ragged fibrous edge, on a PURE WHITE background. Fills most of the frame. No hard edges. ' + NEG },
  { id: 'ink/smoke-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'A single column of smoke painted in ink wash rising and curling, seen against a PURE WHITE background, soft turbulent billowing edges, dark at the base fading to nothing at the top. ' + NEG },
  { id: 'ink/dissolve-noise-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'An abstract full-frame texture of ink dispersing through water: fine filaments, curling vortices, marbled turbulence, a full continuous range of greys from black to white, edge to edge with no border and no empty space. Seamless organic pattern. ' + NEG },
  { id: 'ink/paper-fibre-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'An extreme close-up of handmade mulberry rice paper fibre, seen flat, showing the random interlocking fibre structure as fine light and dark filaments, uniform across the whole frame, no objects, no ink. Subtle, low contrast, tileable feeling. ' + NEG },

  // ---- paper / parchment grounds --------------------------------------
  { id: 'paper/aged-01', aspect: '16:9', size: '2K', post: 'none',
    prompt: 'A sheet of very old Chinese handmade paper photographed flat and evenly lit: warm bone-ivory tone, faint foxing spots, soft fold creases, fibre inclusions, slightly darker at the edges. Completely blank, no ink, no writing, no border. Fills the entire frame edge to edge.' },
  { id: 'paper/silk-01', aspect: '16:9', size: '2K', post: 'none',
    prompt: 'A sheet of ancient undyed silk used for painting, photographed flat and evenly lit: visible warp and weft weave, pale grey-gold, slight sheen, a few loose threads. Completely blank, no ink, no writing. Fills the entire frame.' },
  { id: 'paper/bamboo-slip-01', aspect: '4:3', size: '2K', post: 'alpha',
    prompt: 'A single narrow vertical bamboo writing slip from the Warring States period, blank with no writing on it, bound at top and bottom with dark cord, seen straight on, painted as a flat solid dark shape on a PURE WHITE background. Just one slip, vertical, centred. ' + NEG },

  // ---- seals & marks (alpha, colour preserved) -------------------------
  { id: 'seal/square-01', aspect: '1:1', size: '1K', post: 'alphaKeepColor',
    prompt: 'A single traditional Chinese square seal impression in bright vermilion cinnabar paste on a PURE WHITE background. The seal reads exactly the two characters 兵法 in ancient seal script (zhuanshu), arranged vertically inside a square border. Slightly uneven pressure so the paste is broken and granular at the edges, a real hand-pressed impression, not a printed square. Centred, occupying the middle sixty percent of the frame. No other marks, no extra characters.' },
  { id: 'seal/round-01', aspect: '1:1', size: '1K', post: 'alphaKeepColor',
    prompt: 'A single traditional Chinese round seal impression in vermilion cinnabar paste on a PURE WHITE background. The seal reads exactly the two characters 廟算 in ancient seal script (zhuanshu). Worn and broken edges where the stone did not take the paste. Centred. No other marks, no extra characters.' },

  // ---- particle sprites (mask) ----------------------------------------
  { id: 'sprite/ember-01', aspect: '1:1', size: '1K', post: 'mask',
    prompt: 'A single soft glowing round spark seen in isolation, brightest white-hot at the very centre fading smoothly and radially to pure black at the edges of the frame, on a PURE BLACK background. A clean radial falloff, like a point light. No colour, no shape, no lens flare streaks.' },
  { id: 'sprite/ash-01', aspect: '1:1', size: '1K', post: 'mask',
    prompt: 'Nine isolated flakes of burnt paper ash of irregular torn shapes, arranged in a three by three grid, painted as flat white shapes on a PURE BLACK background, clear black space between each flake.' },
  { id: 'sprite/arrow-01', aspect: '1:1', size: '1K', post: 'alpha',
    prompt: 'A single ancient Chinese arrow in flight seen in sharp profile, flat solid black ink silhouette on a PURE WHITE background, horizontal, point to the right, three fletchings at the left. Simple, clean, no motion blur. ' + NEG },
  { id: 'sprite/rain-01', aspect: '1:1', size: '1K', post: 'mask',
    prompt: 'A field of fine diagonal rain streaks painted as thin white lines on a PURE BLACK background, evenly distributed across the entire frame, varying lengths and opacities, all parallel at the same steep angle. Seamless.' },

  // ---- special environments -------------------------------------------
  { id: 'map/topo-01', aspect: '1:1', size: '2K', post: 'none',
    prompt: 'An antique Chinese military campaign map painted on aged silk, seen flat from directly above: mountain ranges drawn as ink contour ridges, river systems in darker ink, passes and fords marked, a walled city as a small square glyph, faint grid lines. Muted ink and ochre. No text, no legend, no compass rose, no modern cartography.' },
  { id: 'map/contour-height-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'A grayscale terrain height field seen from directly above: pure white for the highest peaks grading smoothly through every grey to pure black in the deepest valleys. Two mountain massifs separated by a winding river valley and a narrow pass. Smooth continuous gradients, no contour lines, no text, no colour. Fills the whole frame.' },
]

/** Chapter key frames — one memorable poster image per chapter. */
export const CHAPTERS = [
  { n: 1, id: 'chapter/01', prompt: scene('An empty ancestral temple hall before dawn, a low lacquer table bearing counting rods and a map of two states, a single oil lamp, no soldiers anywhere. The war is being decided in this silent room', 'Interior. Cold blue-grey light from one window. Deep shadow. Absolute stillness.') },
  { n: 2, id: 'chapter/02', prompt: scene('An enormous supply train of ox carts stretching from the foreground to the vanishing point across a dust plain, the army it feeds nowhere in sight', 'The line of carts is the subject. Exhausting repetition. Dust haze flattening the distance.') },
  { n: 3, id: 'chapter/03', prompt: scene('A vast walled city seen from a besieging army camp at night, the walls utterly undamaged, siege towers half built and abandoned, the besiegers thin and still', 'The wall wins. Bleak. The city is dark and patient.') },
  { n: 4, id: 'chapter/04', prompt: scene('A single armoured general standing motionless on a fortified height, back to the viewer, watching an army manoeuvre far below, entirely unhurried', 'He does nothing. That is the image. Vast depth below him.') },
  { n: 5, id: 'chapter/05', prompt: scene('An enormous round boulder at the instant it begins to roll from the lip of a mountain gorge, the slope falling away thousands of feet below it', 'All potential energy, no motion blur. The instant before.') },
  { n: 6, id: 'chapter/06', prompt: scene('A river breaking around a stone fortification and finding the one unguarded channel behind it, water rendered as living ink currents, the defences irrelevant', 'Water as the protagonist. The wall is already lost and does not know it.') },
  { n: 7, id: 'chapter/07', prompt: scene('An army column strung out along a narrow mountain road at speed, the head of the column far ahead and the tail lost in the pass behind, dangerously extended', 'The gap in the middle is the subject.') },
  { n: 8, id: 'chapter/08', prompt: scene('A crossroads of five roads in a featureless plain at dusk, each road leading into a different weather, with a solitary mounted commander stopped at the junction', 'Five futures. Choice as terrain.') },
  { n: 9, id: 'chapter/09', prompt: scene('A column of dust rising in a thin high straight line above a distant treeline, watched from a marshy riverbank where startled water birds are lifting off', 'The sign, not the thing. Reading the enemy from evidence.') },
  { n: 10, id: 'chapter/10', prompt: scene('A high aerial view of a contested landscape: a narrow pass between two massifs, a ford, a plain, an escarpment, drawn as ink terrain from directly above at a steep angle', 'Map becoming landscape. Cold, analytical, beautiful.') },
  { n: 11, id: 'chapter/11', prompt: scene('An army drawn up with its back to a wide fast river, no boats, no bridge, no retreat possible, facing a much larger force coming down from the hills', 'Death ground. The river is a wall behind them.') },
  { n: 12, id: 'chapter/12', prompt: scene('A night river filled with burning ships driven downwind into a moored fleet, fire crawling along rigging and hulls, embers streaming across black water', 'The only chapter with real colour: fire orange against total black. Ink still visible in the smoke.') },
  { n: 13, id: 'chapter/13', prompt: scene('A single traveller with a covered face passing through a city gate at night, seen from behind, carrying nothing, while sentries look elsewhere', 'Intimate, quiet, close. The smallest image in the series and the most decisive.') },
]

/** Display glyphs. Rendered as ink, not as a font: a webfont cannot bleed. */
export const GLYPHS = [
  { id: 'glyph/bingfa', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 兵法 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch01', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 始計 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch02', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 作戰 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch03', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 謀攻 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch04', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 軍形 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch05', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 兵勢 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch06', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 虛實 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch07', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 軍爭 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch08', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 九變 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch09', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 行軍 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch10', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 地形 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch11', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 九地 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch12', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 火攻 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
  { id: 'glyph/ch13', aspect: '1:1', size: '2K', post: 'alpha',
    prompt: 'Chinese calligraphy: exactly the two characters 用間 written vertically in a single column, in bold regular script (kaishu), by a master calligrapher with a large loaded brush. Deep black ink on a PURE WHITE background, nothing else in the frame. Confident wet strokes with visible brush texture, a little flying white where the brush ran dry, and the characters filling most of the frame. No seal, no signature, no border, no extra characters, no other text. ' + NEG },
]

/** Simulation input maps. Not artwork — data the shaders read. */
export const FIELDS = [
  { id: 'field/sizing-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'A grayscale map seen from directly above, on a PURE BLACK background. Scattered across it are about nine solid WHITE irregular rounded shapes of varying size, like fortified positions and walled camps on a campaign map, connected here and there by thin white lines like defensive walls. The white shapes have soft feathered edges. Roughly a quarter of the frame is white; the rest is pure black. No text, no labels, no grid, no colour.' },
  { id: 'field/terrain-01', aspect: '1:1', size: '2K', post: 'mask',
    prompt: 'A grayscale terrain height field seen from directly above: bright white ridgelines running diagonally, grading smoothly down through mid greys to near-black in a wide branching valley system that drains toward the BOTTOM of the frame. Smooth continuous gradients, no contour lines, no text, no colour, no border. Fills the whole frame.' },
]
