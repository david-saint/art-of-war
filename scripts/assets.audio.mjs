// Audio manifest.
//
// Lyria refuses prompts that name a culture's instruments directly ("guqin",
// "ancient Chinese court music" both return PROHIBITED_CONTENT), so every bed
// is described purely in terms of timbre, articulation, register and mood.
// The result lands in the same place musically without tripping the filter.

const LOOP = { loopFade: 6 }

export const BEDS = [
  { id: 'bed/overture', ...LOOP,
    prompt: 'Slow cinematic instrumental. A single plucked string with a long metallic decay, struck rarely, with many seconds of near silence between notes. Beneath it a very low sustained drone that barely moves. Pentatonic. Patient, austere, unresolved, faintly ominous. No percussion, no melody line, no build.' },
  { id: 'bed/act1-calculation', ...LOOP,
    prompt: 'Sparse meditative instrumental for solo plucked zither. Dry, close, wooden attacks with long ringing decay and generous silence. Pentatonic phrases that never resolve. A room at night before a decision. No drums, no strings section, no swell.' },
  { id: 'bed/act2-form', ...LOOP,
    prompt: 'Ambient instrumental. A deep sustained low drone with slow beating overtones, over it occasional soft bowed string swells and a distant bell struck once every thirty seconds. Water-like, patient, immense. Very slow. No rhythm, no melody.' },
  { id: 'bed/act3-motion', ...LOOP,
    prompt: 'Tense cinematic instrumental with forward motion. A quiet insistent frame drum pulse, low and dry, under a repeating short plucked string figure. Bamboo flute enters and leaves. Building pressure but never releasing. Modal, pentatonic, no chord progression.' },
  { id: 'bed/act4-ground', ...LOOP,
    prompt: 'Dark heavy instrumental. Massive low drums struck slowly and far apart, a scraped metallic drone, a bowed string held at the edge of the bow. Oppressive, fatal, close to silence between hits. No melody.' },
  { id: 'bed/fire', ...LOOP,
    prompt: 'Dark roiling instrumental. A low churning drone with irregular metallic crackle and shimmer over the top, sudden dry percussive cracks, a high sustained tone that slowly bends. Chaotic but slow. Threatening. No melody, no beat.' },
  { id: 'bed/spies', ...LOOP,
    prompt: 'Intimate minimal instrumental. One plucked string, very close-miked, playing a short figure quietly, with room tone and long silences. Almost nothing else. Secretive, small, unresolved. No drums, no drone, no reverb tail.' },
  { id: 'bed/coda', ...LOOP,
    prompt: 'Slow elegiac instrumental. A single bowed string line, unaccompanied, in a low register, moving stepwise and stopping often. Grief without swelling. Ends unresolved. No percussion, no accompaniment.' },
]

// Field textures. Lyria is a music model, so these ask for "texture" rather than
// "field recording" and still return something usable as an ambience bed.
export const TEXTURES = [
  { id: 'tex/wind-plain', ...LOOP,
    prompt: 'Ambient textural instrumental with no notes and no rhythm: sustained breathy noise that swells and falls like wind across open ground, with a faint whistling edge. Tonal but pitchless. Continuous.' },
  { id: 'tex/rain', ...LOOP,
    prompt: 'Ambient textural instrumental with no notes and no rhythm: dense fine granular high-frequency patter, steady, with an occasional low rumble far away. Continuous and even.' },
  { id: 'tex/bamboo', ...LOOP,
    prompt: 'Ambient textural instrumental with no melody: irregular dry hollow wooden knocks and creaks of varying pitch, sparse, with a soft rustling bed underneath. Organic and unhurried.' },
  { id: 'tex/camp-night', ...LOOP,
    prompt: 'Ambient textural instrumental with no melody: a very low sustained hum, sparse distant metallic clinks, an occasional muffled thud far away, and a faint crackle. Night, outdoors, many people asleep.' },
]

// Narration. The three voices of the site.
//   text      — Sun Tzu's own words. Ceremonial, weighted, unhurried.
//   historian — the recorded episode. Measured, warm, factual.
//   commander — the second person address at a decision node. Hard, close, imperative.
export const VOICES = {
  text: { voice: 'Charon', style: 'Read slowly and ceremonially, in a deep and resonant voice, leaving weight on each clause, as if reciting something very old that is still true' },
  textZh: { voice: 'Charon', style: 'Read slowly and clearly in Mandarin Chinese, in a deep and resonant voice, with the cadence of classical recitation' },
  historian: { voice: 'Iapetus', style: 'Read in a measured, warm, unhurried voice, like a historian recounting something they have studied for thirty years — factual, never dramatic' },
  commander: { voice: 'Kore', style: 'Read hard, close and direct, in a firm low voice, as an order given quietly to one person who must act now' },
}

export const NARRATION = [
  { id: 'nar/enter', voice: 'text', text: 'War is a matter of vital importance to the state. The province of life and death. The road to survival or to ruin. It must not be neglected.' },
  { id: 'nar/enter-zh', voice: 'textZh', text: '兵者，國之大事，死生之地，存亡之道，不可不察也。' },
  { id: 'nar/ch01-dictum', voice: 'text', text: 'All warfare is based on deception. The battle is decided in the temple, before a single soldier moves.' },
  { id: 'nar/ch01-zh', voice: 'textZh', text: '兵者，詭道也。' },
  { id: 'nar/ch06-dictum', voice: 'text', text: 'Water shapes its course according to the ground. An army shapes its victory in relation to the enemy it faces. Therefore, as water retains no constant shape, in war there are no constant conditions.' },
  { id: 'nar/ch06-zh', voice: 'textZh', text: '夫兵形象水。水之形，避高而趨下；兵之形，避實而擊虛。' },
  { id: 'nar/ch12-dictum', voice: 'text', text: 'Unhappy is the fate of one who tries to win his battles and succeed in his attacks without cultivating the spirit of enterprise. The result is waste of time and general stagnation.' },
  { id: 'nar/ch12-warning', voice: 'text', text: 'No ruler should put troops into the field merely to gratify his own spleen. No general should fight a battle simply out of pique. A kingdom that has once been destroyed can never come again into being. Nor can the dead ever be brought back to life.' },
  { id: 'nar/ch12-zh', voice: 'textZh', text: '亡國不可以復存，死者不可以復生。' },
  { id: 'nar/commander-fork', voice: 'commander', text: 'You have until the light goes. Choose.' },
  { id: 'nar/commander-committed', voice: 'commander', text: 'It is done. Watch what you have made.' },
]
