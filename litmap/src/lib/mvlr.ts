// The minimum viable literature review — Chapter 4's on-ramp.
//
//   1. Source A, one sentence. What did this study find?
//   2. Source B, one sentence. What did this study find?
//   3. Source C, one sentence. What did this study find?
//   4. The gap, one sentence. What do these three, together, leave unexplored?
//
// Sentences 1 to 3 are assembled from the `finding` field the student already
// wrote when logging each source. Sentence 4 is theirs and is never drafted
// for them: the gap is the argument, and handing it over would hand over the
// only part that is actually thinking.
//
// What this file DOES supply for sentence 4 is a factual readout of what the
// three chosen sources have in common. That is a count, not a claim, and it is
// what makes the sentence writable.

import type { Source } from '../types/source'
import { citeLabel, METHODS, DIRECTIONS } from '../types/source'
import { isKept } from './sourceState'

export const MVLR_SIZE = 3

export interface SharedAttribute {
  field: 'method' | 'population' | 'context' | 'theory' | 'direction'
  label: string
  value: string
  /** The gap type this shared attribute points at, in Chapter 4's vocabulary. */
  pointsAt: string
}

export interface MvlrReport {
  ready: boolean
  chosen: Source[]
  missingFindings: Source[]
  shared: SharedAttribute[]
  sentences: string[]
}

function methodLabel(v: string): string {
  return METHODS.find((m) => m.value === v)?.label ?? v
}

function directionLabel(v: string): string {
  return DIRECTIONS.find((d) => d.value === v)?.label ?? v
}

/** Suggest three sources: keystones first, then earliest examined. */
export function suggestTrio(sources: Source[]): string[] {
  return [...sources]
    .filter((s) => isKept(s) && s.finding.trim())
    .sort((a, b) => Number(b.keystone) - Number(a.keystone) || a.examinedAt - b.examinedAt)
    .slice(0, MVLR_SIZE)
    .map((s) => s.id)
}

/** Every field on which all three chosen sources agree. */
function sharedAcross(chosen: Source[]): SharedAttribute[] {
  if (chosen.length < 2) return []
  const out: SharedAttribute[] = []

  const allSame = (pick: (s: Source) => string): string | null => {
    const first = pick(chosen[0]).trim().toLowerCase()
    if (!first) return null
    return chosen.every((s) => pick(s).trim().toLowerCase() === first) ? pick(chosen[0]).trim() : null
  }

  const method = allSame((s) => s.method)
  if (method) {
    out.push({
      field: 'method',
      label: 'All used the same method',
      value: methodLabel(method),
      pointsAt: 'a methodological gap',
    })
  }
  const population = allSame((s) => s.population)
  if (population) {
    out.push({
      field: 'population',
      label: 'All studied the same population',
      value: population,
      pointsAt: 'a topical void, if another population is unexamined',
    })
  }
  const context = allSame((s) => s.context)
  if (context) {
    out.push({
      field: 'context',
      label: 'All worked in the same context',
      value: context,
      pointsAt: 'a topical void, if another context is unexamined',
    })
  }
  const theory = allSame((s) => s.theory)
  if (theory) {
    out.push({
      field: 'theory',
      label: 'All used the same theoretical lens',
      value: theory,
      pointsAt: 'a theoretical gap, if another lens would show something else',
    })
  }

  // A disagreement, not an agreement — but the same shape of observation, and
  // the one Chapter 4 calls a contradiction.
  const dirs = new Set(chosen.map((s) => s.direction).filter((d) => d !== 'na'))
  if (dirs.has('positive') && dirs.has('negative')) {
    out.push({
      field: 'direction',
      label: 'These sources disagree',
      value: chosen
        .filter((s) => s.direction === 'positive' || s.direction === 'negative')
        .map((s) => `${citeLabel(s)}: ${directionLabel(s.direction).split(' — ')[0].toLowerCase()}`)
        .join('; '),
      pointsAt: 'a contradiction worth resolving',
    })
  }

  return out
}

export function buildMvlr(sources: Source[], chosenIds: string[]): MvlrReport {
  const byId = new Map(sources.map((s) => [s.id, s]))
  const chosen = chosenIds.map((id) => byId.get(id)).filter((s): s is Source => Boolean(s))
  const missingFindings = chosen.filter((s) => !s.finding.trim())

  const sentences = chosen.map((s) => {
    const finding = s.finding.trim().replace(/\s+/g, ' ')
    if (!finding) return ''
    // The student writes the finding as a bare claim; the citation goes in
    // front of it so the sentence reads the way the book's example reads.
    //
    // The first character is left exactly as typed. An earlier version
    // lowercased it so the clause would read on from "found that", and it
    // turned "Twitch streams operate..." into "twitch streams operate...".
    // A capital mid-sentence is a style nit; lowercasing a proper noun is an
    // error, and the form now asks for a lower-case opening instead.
    const lead = citeLabel(s)
    const tail = /[.!?]$/.test(finding) ? finding : `${finding}.`
    return `${lead} found that ${tail}`
  })

  return {
    ready: chosen.length === MVLR_SIZE && missingFindings.length === 0,
    chosen,
    missingFindings,
    shared: sharedAcross(chosen),
    sentences,
  }
}

/** The four-sentence paragraph, as Markdown the student can paste. */
export function mvlrMarkdown(report: MvlrReport, gapSentence: string): string {
  const body = report.sentences.filter(Boolean).join(' ')
  const gap = gapSentence.trim()
  return [body, gap].filter(Boolean).join(' ')
}
