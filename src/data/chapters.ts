export type Voice = 'text' | 'historian' | 'commander'

export type DecisionNode = {
  /** The Commander's framing of the situation, second person, present tense. */
  situation: string
  options: {
    a: { label: string; consequence: string }
    b: { label: string; consequence: string }
  }
  /** Revealed only after the consequence has finished and the ink has dried. */
  verdict: { a: string; b: string; sunzi: string }
}

export type Vignette = {
  title: string
  place: string
  when: string
  source: string
  /** One line separating what the sources record from what is legend. */
  historicity: string
  body: string
}

export type Chapter = {
  n: number
  han: string
  pinyin: string
  /** The conventional English title, as readers will search for it. */
  titleEn: string
  /** A sharper title that states the chapter's actual argument. */
  titleAlt: string
  act: 1 | 2 | 3 | 4
  dictum: string
  gloss: string
  lines: { han: string; pinyin: string; literal: string; modern: string }[]
  vignette: Vignette
  visualCue: string
  decision: DecisionNode
  codex: { bullets: string[]; apply: string }
  /** Section height in viewport heights. Longer chapters get more scroll. */
  scrollVh: number
}

/**
 * Chapter identity.
 *
 * Titles are given in traditional characters, which is what a Warring States
 * text warrants and what the calligraphy plates are drawn in. The `titleAlt`
 * column exists because the conventional English titles are mostly Lionel
 * Giles' 1910 choices and several of them actively mislead — "Energy" for 兵勢
 * loses that shi is positional advantage about to be released, not vigour.
 */
export const CHAPTER_IDENTITY = [
  { n: 1, han: '始計', pinyin: 'Shǐ Jì', titleEn: 'Laying Plans', titleAlt: 'The Count', act: 1 },
  { n: 2, han: '作戰', pinyin: 'Zuò Zhàn', titleEn: 'Waging War', titleAlt: 'The Price of a Day', act: 1 },
  { n: 3, han: '謀攻', pinyin: 'Móu Gōng', titleEn: 'Attack by Stratagem', titleAlt: 'Taking It Whole', act: 1 },
  { n: 4, han: '軍形', pinyin: 'Jūn Xíng', titleEn: 'Tactical Dispositions', titleAlt: 'Already Decided', act: 2 },
  { n: 5, han: '兵勢', pinyin: 'Bīng Shì', titleEn: 'Energy', titleAlt: 'Configuration, Not Courage', act: 2 },
  { n: 6, han: '虛實', pinyin: 'Xū Shí', titleEn: 'Weak Points and Strong', titleAlt: 'Making Him Move', act: 2 },
  { n: 7, han: '軍爭', pinyin: 'Jūn Zhēng', titleEn: 'Maneuvering', titleAlt: 'The Arithmetic of Arriving First', act: 3 },
  { n: 8, han: '九變', pinyin: 'Jiǔ Biàn', titleEn: 'Variation in Tactics', titleAlt: "The General's Five Handles", act: 3 },
  { n: 9, han: '行軍', pinyin: 'Xíng Jūn', titleEn: 'The Army on the March', titleAlt: 'Signs Without Spirits', act: 3 },
  { n: 10, han: '地形', pinyin: 'Dì Xíng', titleEn: 'Terrain', titleAlt: 'Ground Does Not Lose Battles', act: 4 },
  { n: 11, han: '九地', pinyin: 'Jiǔ Dì', titleEn: 'The Nine Situations', titleAlt: 'Distance From Home', act: 4 },
  { n: 12, han: '火攻', pinyin: 'Huǒ Gōng', titleEn: 'The Attack by Fire', titleAlt: 'The Weapon You Cannot Recall', act: 4 },
  { n: 13, han: '用間', pinyin: 'Yòng Jiān', titleEn: 'The Use of Spies', titleAlt: 'The Price of Knowing', act: 4 },
] as const

export const ACTS = {
  1: { title: 'The Count', han: '計', chapters: [1, 2, 3] },
  2: { title: 'The Shape', han: '形', chapters: [4, 5, 6] },
  3: { title: 'The Move', han: '動', chapters: [7, 8, 9] },
  4: { title: 'The Ground', han: '地', chapters: [10, 11, 12, 13] },
} as const

export const glyphAsset = (n: number) =>
  `/assets/generated/img/glyph/ch${String(n).padStart(2, '0')}.webp`
export const keyArtAsset = (n: number) =>
  `/assets/generated/img/chapter/${String(n).padStart(2, '0')}.webp`
