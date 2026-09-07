'use client'

import { useSyncExternalStore } from 'react'
import { getDecisionSnapshot, getServerDecisionSnapshot, subscribeDecision, type DecisionSnapshot } from './decision'

type Discrete = Pick<DecisionSnapshot, 'chapter' | 'phase' | 'hovered' | 'chosen'>

/**
 * Subscribes to one derived value of the decision state. Every beat on the
 * page asks "does a node own my chapter's frame?", and without a selector each
 * of them re-rendered on every hover over an option — a boolean that never
 * changed for seventy-seven of the seventy-eight of them.
 */
export function useDecisionSignal<T extends string | number | boolean | null>(selector: (d: Discrete) => T): T {
  return useSyncExternalStore(
    subscribeDecision,
    () => selector(getDecisionSnapshot()),
    () => selector(getServerDecisionSnapshot()),
  )
}
