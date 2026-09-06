export type Ground = 'paper' | 'ink'

/**
 * Which chapters render on an ink ground.
 *
 * This is derived from the canon packets' actual lighting plots, NOT from the
 * act structure — an earlier version of this file assigned night by act and got
 * three of four wrong, which an adversarial review caught:
 *
 *   9  行軍 — "pre-dawn overcast: the brightest object in frame is the paper,
 *              and the column is the darkest." A high-key chapter. PAPER.
 *   11 九地 — "winter is cold by value and grain, never by hue: high-key flat
 *              light." PAPER, despite being about death ground.
 *   6  虛實 — "a flooded lowland at night, and the sheet is backlit… night here
 *              is a value, not a hue." The sheet glows, so it is still PAPER;
 *              the night lives in the value structure, not in the ground.
 *   12 火攻 — the canon's own uniqueness matrix reserves "the only night
 *              exterior" to this chapter. INK.
 *   13 用間 — midnight interior, lamp-lit, and explicitly "contrast is highest
 *              in the site — deepest ink #0B0F0E against the lit face of a
 *              slip." INK, and the deliberate physical opposite of Chapter 1's
 *              cold, vast, rammed-earth dawn.
 *
 * Two chapters out of thirteen, at the very end. The imbalance is the argument:
 * the treatise spends eleven chapters trying to avoid the two in the dark.
 */
const NIGHT = new Set([12, 13])

export function groundFor(chapter: number): Ground {
  return NIGHT.has(chapter) ? 'ink' : 'paper'
}

export const GROUND_HEX: Record<Ground, string> = {
  paper: '#E8E2D4',
  ink: '#0B0F0E',
}
