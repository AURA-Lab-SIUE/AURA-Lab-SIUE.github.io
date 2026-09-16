// A source is in one of THREE states, not two.
//
// This was originally a single `relevant` boolean defaulting to true, which
// meant a reference imported from a .bib and never opened counted as a source
// the student had read and kept. A forty-item import opened the tool on a
// curve that read as nearly saturated before a word had been read. The export
// made it obvious: three all-dash rows sitting in the source matrix and in the
// reference list.
//
//   pile   in the pile, not yet read   counts toward nothing
//   kept   read and logged             counts toward the curve
//   aside  read and rejected           counts as examined, not toward the curve
//
// State is DERIVED, never stored, so it cannot go stale against the fields it
// is a summary of.

import type { Source } from '../types/source'

export type SourceState = 'pile' | 'kept' | 'aside'

/** A source is logged when the fields the counting depends on are filled.
 *
 *  "Found via a search" without saying WHICH search is the case that bit in
 *  testing: the source looks logged, but the search it came from still counts
 *  as having yielded nothing, so the saturation signal reads as flat when it
 *  is not. The same applies to a chain with no source attached. */
export function isComplete(s: Source): boolean {
  if (needsRef(s) && !s.foundVia.ref) return false
  return Boolean(s.method) && s.finding.trim().length > 0 && s.population.trim().length > 0
}

/** True when this way of finding a source has to name the search or source. */
export function needsRef(s: Source): boolean {
  return s.foundVia.kind === 'search' || s.foundVia.kind === 'backward' || s.foundVia.kind === 'forward'
}

/** True when the ONLY thing missing is which search or which source it came from. */
export function missingRefOnly(s: Source): boolean {
  return (
    needsRef(s) &&
    !s.foundVia.ref &&
    Boolean(s.method) &&
    s.finding.trim().length > 0 &&
    s.population.trim().length > 0
  )
}

export function sourceState(s: Source): SourceState {
  if (s.setAside) return 'aside'
  return isComplete(s) ? 'kept' : 'pile'
}

export const isKept = (s: Source) => sourceState(s) === 'kept'
export const isAside = (s: Source) => sourceState(s) === 'aside'
export const isPile = (s: Source) => sourceState(s) === 'pile'

/** Read and judged, either way. This is the denominator on the curve's x-axis. */
export const isExamined = (s: Source) => sourceState(s) !== 'pile'

export function partition(sources: Source[]): { kept: Source[]; aside: Source[]; pile: Source[] } {
  const kept: Source[] = []
  const aside: Source[] = []
  const pile: Source[] = []
  for (const s of sources) {
    const st = sourceState(s)
    if (st === 'kept') kept.push(s)
    else if (st === 'aside') aside.push(s)
    else pile.push(s)
  }
  return { kept, aside, pile }
}

export const STATE_LABEL: Record<SourceState, string> = {
  pile: 'In the pile',
  kept: 'Logged',
  aside: 'Set aside',
}
