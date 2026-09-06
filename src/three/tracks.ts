import { LENS, type CameraTrack } from './cameraTrack'

/**
 * Camera tracks.
 *
 * Each is a shot list, not a path: the keys are the marks the camera hits, and
 * the rig eases between them. Every focal length here comes from the four-lens
 * kit; nothing is shot on an in-between value.
 */

/** The opening. A slow push through the ranges while the title soaks in. */
export const heroTrack: CameraTrack = {
  monotonic: false,
  keys: [
    { at: 0.0, position: [0, 0.35, 9.2], target: [0, 0.1, 0], lens: LENS.wide },
    { at: 0.55, position: [0.3, 0.15, 7.4], target: [0.1, 0.0, 0], lens: LENS.wide },
    { at: 1.0, position: [0.8, -0.25, 5.6], target: [0.2, -0.2, 0], lens: LENS.standard },
  ],
}

/**
 * The default chapter move: arrive wide, close to command distance while the
 * argument is made, then compress to the long lens for the decision, which is
 * where the ground should start to feel narrow.
 */
export function chapterTrack(chapter: number): CameraTrack {
  const drift = ((chapter * 37) % 11) / 11 - 0.5 // deterministic per-chapter variety
  return {
    monotonic: true,
    keys: [
      { at: 0.0, position: [drift * 1.6, 0.6, 10.5], target: [0, 0.2, 0], lens: LENS.wide },
      { at: 0.34, position: [drift * 0.9, 0.25, 8.0], target: [0, 0.1, 0], lens: LENS.standard },
      { at: 0.66, position: [-drift * 1.1, 0.0, 6.2], target: [drift * 0.4, 0.0, 0], lens: LENS.standard },
      { at: 0.86, position: [-drift * 0.6, -0.1, 4.4], target: [drift * 0.2, -0.05, 0], lens: LENS.long },
      { at: 1.0, position: [0, -0.2, 3.9], target: [0, -0.1, 0], lens: LENS.long },
    ],
  }
}

/**
 * THE MAP DESCENT — chapter 6, and the only place in the project the camera
 * starts overhead. The reader begins as the commander reading a map and ends
 * standing on the ground it describes.
 */
export const mapDescentTrack: CameraTrack = {
  monotonic: false,
  keys: [
    { at: 0.0, position: [0, 8.0, 2.2], target: [0, -1.4, -5], lens: LENS.wide },
    { at: 0.34, position: [0, 6.0, 3.6], target: [0, -1.4, -5], lens: LENS.wide },
    { at: 0.62, position: [1.4, 3.8, 4.8], target: [0.4, -1.3, -4.6], lens: LENS.standard },
    { at: 0.84, position: [0.7, 1.8, 5.2], target: [0, -1.2, -4.4], lens: LENS.standard },
    { at: 1.0, position: [0, 1.0, 4.8], target: [0, -1.1, -4.2], lens: LENS.long },
  ],
}
