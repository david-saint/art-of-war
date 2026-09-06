/**
 * Decision-node state, in the same two-tier shape as the scroll engine.
 *
 * The 3D side needs `phase`, `hovered` and `elapsed` every frame; the DOM side
 * needs to re-render only when `phase` or `hovered` changes. So the mutable
 * snapshot is read inside useFrame and a quantised subscription drives React.
 */

export type DecisionPhase =
  /** Off screen. Nothing is armed. */
  | 'dormant'
  /** The reader has reached the node; the scene is preparing but scroll is free. */
  | 'armed'
  /** Scroll is locked. The two options are on screen. */
  | 'presented'
  /** The reader has committed. The brush is loaded; this is the last still moment. */
  | 'committed'
  /** The consequence is playing out. No UI, no text. */
  | 'simulating'
  /** The consequence has finished; the ink is drying. */
  | 'consequence'
  /** The ink is dry. Only now is the historical reading allowed on screen. */
  | 'verdict'
  /** Done. Scroll released, the mark is permanent. */
  | 'resolved'

export type DecisionOption = 'a' | 'b'

export type DecisionSnapshot = {
  chapter: number
  phase: DecisionPhase
  /** Which option the pointer is over, for the preview. Null when neither. */
  hovered: DecisionOption | null
  chosen: DecisionOption | null
  /** Seconds since the current phase began. */
  elapsed: number
  /** 0..1 through the simulating phase. */
  sim: number
}

export const decision: DecisionSnapshot = {
  chapter: -1,
  phase: 'dormant',
  hovered: null,
  chosen: null,
  elapsed: 0,
  sim: 0,
}

type Discrete = Pick<DecisionSnapshot, 'chapter' | 'phase' | 'hovered' | 'chosen'>
let snapshot: Discrete = { chapter: -1, phase: 'dormant', hovered: null, chosen: null }
const listeners = new Set<() => void>()
const SERVER: Discrete = { chapter: -1, phase: 'dormant', hovered: null, chosen: null }

export const subscribeDecision = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getDecisionSnapshot = () => snapshot
export const getServerDecisionSnapshot = () => SERVER

function publish() {
  const next: Discrete = {
    chapter: decision.chapter,
    phase: decision.phase,
    hovered: decision.hovered,
    chosen: decision.chosen,
  }
  if (
    next.chapter === snapshot.chapter &&
    next.phase === snapshot.phase &&
    next.hovered === snapshot.hovered &&
    next.chosen === snapshot.chosen
  ) {
    return
  }
  snapshot = next
  for (const fn of listeners) fn()
}

/**
 * Phase durations, in seconds.
 *
 * `committed` is deliberately long enough to be uncomfortable. It is the moment
 * after you have given the order and before anything has happened, which is the
 * only emotion this text is really about.
 */
export const PHASE_MS = {
  committed: 1200,
  simulating: 4200,
  consequence: 2200,
} as const

export function setPhase(phase: DecisionPhase) {
  if (decision.phase === phase) return
  decision.phase = phase
  decision.elapsed = 0
  if (phase === 'simulating') decision.sim = 0
  publish()
}

export function arm(chapter: number) {
  decision.chapter = chapter
  decision.hovered = null
  decision.chosen = null
  decision.elapsed = 0
  decision.sim = 0
  setPhase('armed')
}

export function hover(option: DecisionOption | null) {
  if (decision.phase !== 'presented') return
  if (decision.hovered === option) return
  decision.hovered = option
  publish()
}

export function commit(option: DecisionOption) {
  if (decision.phase !== 'presented') return
  decision.chosen = option
  decision.hovered = null
  setPhase('committed')
}

export function reset() {
  decision.chapter = -1
  decision.hovered = null
  decision.chosen = null
  decision.sim = 0
  setPhase('dormant')
}

/** Advances the phase machine. Called once per frame by the node component. */
export function tickDecision(dt: number): void {
  decision.elapsed += dt
  const ms = decision.elapsed * 1000
  switch (decision.phase) {
    case 'committed':
      if (ms >= PHASE_MS.committed) setPhase('simulating')
      break
    case 'simulating':
      decision.sim = Math.min(1, ms / PHASE_MS.simulating)
      if (ms >= PHASE_MS.simulating) setPhase('consequence')
      break
    case 'consequence':
      if (ms >= PHASE_MS.consequence) setPhase('verdict')
      break
    default:
      break
  }
}
