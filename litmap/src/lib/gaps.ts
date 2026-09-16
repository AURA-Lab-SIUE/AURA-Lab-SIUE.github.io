// The gap detector — Chapter 4's four gap types, found by counting columns.
//
//   topical void      a population or context nobody in the pile has studied
//   methodological    the phenomenon is studied, but always the same way
//   contradiction     two sources, same pair of constructs, opposite directions
//   theoretical       one lens dominates, or no lens is named at all
//
// Every finding here is a COUNT OVER WHAT THE STUDENT LOGGED. It is not a
// claim about the field, and the interface says so. A student who read ten
// surveys because surveys were the first ten hits will be told they found a
// methodological gap, and they did not. The search log is the only defence
// against that, which is why it is required rather than optional.
//
// Drafts follow Chapter 4's structure — establish what is known, identify the
// limitation, argue for your study — and the third clause is always left
// blank. That clause is the student's contribution and drafting it for them
// would defeat the exercise.

import type { Source, Method } from '../types/source'
import { citeLabel, METHODS } from '../types/source'
import { partition } from './sourceState'

// ── thresholds ────────────────────────────────────────────────────────
//
// PROVISIONAL. These are the numbers a reasonable reader would defend, not
// numbers derived from student data, because no student data exists yet. Every
// finding prints the counts it was computed from so the student can disagree
// with the threshold rather than take it on faith. Revisit once real logs
// exist.

/** Below this many logged sources, no concentration means anything. */
export const MIN_SOURCES_FOR_GAPS = 5

/** Share of sources that must share a value before it counts as dominance. */
const DOMINANCE = 0.7

/** Theory concentrates more loosely than method, so it gets its own bar. */
const THEORY_DOMINANCE = 0.6

/** Share of sources naming no theory before that is worth surfacing. */
const ATHEORETICAL_SHARE = 0.5

export type GapKind = 'topical' | 'methodological' | 'contradiction' | 'theoretical' | 'atheoretical'

export interface Gap {
  kind: GapKind
  /** Stable key so a dismissal or an edit can be tied to one finding. */
  id: string
  title: string
  /** The counts, stated plainly, so the student can judge the threshold. */
  evidence: string
  /** Chapter 4's shape: what is known, then the limitation. */
  draftKnown: string
  draftLimitation: string
  /** Always empty. The student writes it. */
  draftPrompt: string
  sources: string[]
  strength: number
}

// ── what each method is structurally blind to ─────────────────────────
//
// Drawn from Chapter 5's own descriptions of the methods, not invented here.
// A methodological gap is only an argument if you can say what the dominant
// method cannot see.

const METHOD_LIMITATION: Record<Method, string> = {
  survey: 'capture what people say motivates them rather than what they do',
  experiment: 'buy causal clarity with a setting less like the world the behaviour happens in',
  'content-analysis': 'describe what is in the content without reaching how audiences received it',
  interview: 'trade breadth for depth and are not built to generalise',
  'focus-group': 'surface group talk, in which the loudest participant shapes what the others say',
  ethnography: 'are situated in one setting, which is their strength and their limit',
  'existing-data': 'are bounded by what somebody else already chose to collect',
  mixed: 'combine methods, which widens coverage but does not remove either method’s blind spot',
  conceptual: 'argue rather than measure, so no observation tests them',
  other: 'share a common limitation worth naming explicitly',
}

function methodLabel(m: string): string {
  return METHODS.find((x) => x.value === m)?.label ?? m
}

function norm(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Count values, ignoring blanks. Returns the winner and its share. */
function dominant(values: string[]): { value: string; count: number; total: number; share: number } | null {
  const present = values.map(norm).filter(Boolean)
  if (present.length === 0) return null
  const tally = new Map<string, number>()
  for (const v of present) tally.set(v, (tally.get(v) ?? 0) + 1)
  let best = ''
  let bestN = 0
  for (const [v, n] of tally) {
    if (n > bestN) { best = v; bestN = n }
  }
  return { value: best, count: bestN, total: present.length, share: bestN / present.length }
}

/** Restore the student's own casing for a normalised value. */
function original(sources: Source[], pick: (s: Source) => string, normalised: string): string {
  const hit = sources.find((s) => norm(pick(s)) === normalised)
  return hit ? pick(hit).trim() : normalised
}

function nOf(count: number, total: number): string {
  return `${count} of the ${total}`
}

// ── the detector ──────────────────────────────────────────────────────

export interface GapReport {
  ready: boolean
  keptCount: number
  gaps: Gap[]
  /** Said out loud in the interface, not buried in a doc. */
  caveat: string
}

export function detectGaps(sources: Source[]): GapReport {
  const kept = partition(sources).kept
  const caveat =
    'These are counts over the sources you logged, not facts about the field. If your searching was narrow, a gap here is a gap in your reading.'

  if (kept.length < MIN_SOURCES_FOR_GAPS) {
    return { ready: false, keptCount: kept.length, gaps: [], caveat }
  }

  const gaps: Gap[] = []

  // ── methodological ──
  const method = dominant(kept.map((s) => s.method))
  if (method && method.share >= DOMINANCE) {
    const label = methodLabel(method.value)
    const limitation = METHOD_LIMITATION[method.value as Method] ?? METHOD_LIMITATION.other
    gaps.push({
      kind: 'methodological',
      id: `method:${method.value}`,
      title: `Almost everything you have read uses one method: ${label.toLowerCase()}`,
      evidence: `${nOf(method.count, method.total)} sources that name a method use ${label.toLowerCase()}.`,
      draftKnown: `Research on this topic has been conducted almost entirely through ${label.toLowerCase()}.`,
      draftLimitation: `Studies of this kind ${limitation}.`,
      draftPrompt: '',
      sources: kept.filter((s) => norm(s.method) === method.value).map((s) => s.id),
      strength: method.share,
    })
  }

  // ── topical void: population, then context ──
  for (const field of ['population', 'context'] as const) {
    const pick = (s: Source) => s[field]
    const d = dominant(kept.map(pick))
    if (d && d.share >= DOMINANCE) {
      const shown = original(kept, pick, d.value)
      const word = field === 'population' ? 'population' : 'context'
      gaps.push({
        kind: 'topical',
        id: `${field}:${d.value}`,
        title: `Every source you have read works in the same ${word}: ${shown}`,
        evidence: `${nOf(d.count, d.total)} sources that name a ${word} name ${shown}.`,
        draftKnown: `What is known about this topic comes almost entirely from ${shown}.`,
        draftLimitation: `Whether the same pattern holds in another ${word} is unexamined.`,
        draftPrompt: '',
        sources: kept.filter((s) => norm(pick(s)) === d.value).map((s) => s.id),
        strength: d.share,
      })
    }
  }

  // ── contradiction ──
  // Two sources are talking about the same thing when they name the same pair
  // of constructs, in either order. Direction is a field precisely so this can
  // be found rather than noticed by luck.
  const pairs = new Map<string, Source[]>()
  for (const s of kept) {
    const x = norm(s.constructX)
    const y = norm(s.constructY)
    if (!x || !y) continue
    const key = [x, y].sort().join(' ~ ')
    const list = pairs.get(key)
    if (list) list.push(s)
    else pairs.set(key, [s])
  }
  for (const [key, group] of pairs) {
    if (group.length < 2) continue
    const pos = group.filter((s) => s.direction === 'positive')
    const neg = group.filter((s) => s.direction === 'negative')
    const nul = group.filter((s) => s.direction === 'null')
    const opposed = (pos.length > 0 && neg.length > 0) ||
      (nul.length > 0 && (pos.length > 0 || neg.length > 0))
    if (!opposed) continue
    const name = key.replace(' ~ ', ' and ')
    const describe = (list: Source[], word: string) =>
      list.length > 0 ? `${list.map(citeLabel).join(', ')} report ${word}` : ''
    const clauses = [
      describe(pos, 'a positive relationship'),
      describe(neg, 'a negative relationship'),
      describe(nul, 'no relationship'),
    ].filter(Boolean)
    gaps.push({
      kind: 'contradiction',
      id: `pair:${key}`,
      title: `Your sources disagree about ${name}`,
      evidence: `${clauses.join('; ')}.`,
      draftKnown: `The relationship between ${name} has been examined more than once.`,
      draftLimitation: 'The findings conflict, and the disagreement has not been resolved.',
      draftPrompt: '',
      sources: group.map((s) => s.id),
      strength: 1,
    })
  }

  // ── theoretical ──
  const theory = dominant(kept.map((s) => s.theory))
  if (theory && theory.share >= THEORY_DOMINANCE && theory.total >= MIN_SOURCES_FOR_GAPS) {
    const shown = original(kept, (s) => s.theory, theory.value)
    gaps.push({
      kind: 'theoretical',
      id: `theory:${theory.value}`,
      title: `One lens dominates your reading: ${shown}`,
      evidence: `${nOf(theory.count, theory.total)} sources that name a theory use ${shown}.`,
      draftKnown: `This topic has been read almost entirely through ${shown}.`,
      draftLimitation: `A different lens would foreground what ${shown} leaves at the edges.`,
      draftPrompt: '',
      sources: kept.filter((s) => norm(s.theory) === theory.value).map((s) => s.id),
      strength: theory.share,
    })
  }

  // ── no theory at all ──
  // Not one of Chapter 4's four, but the same kind of observation and worth
  // the student's attention: a literature that names no theory is a finding.
  const untheorised = kept.filter((s) => !s.theory.trim())
  if (untheorised.length / kept.length >= ATHEORETICAL_SHARE) {
    gaps.push({
      kind: 'atheoretical',
      id: 'theory:none',
      title: 'Most of what you have read names no theory',
      evidence: `${nOf(untheorised.length, kept.length)} sources you logged name no theoretical framework.`,
      draftKnown: 'Work on this topic has been largely descriptive.',
      draftLimitation: 'Findings have accumulated without a framework that explains why they should hold.',
      draftPrompt: '',
      sources: untheorised.map((s) => s.id),
      strength: untheorised.length / kept.length,
    })
  }

  gaps.sort((a, b) => b.strength - a.strength)
  return { ready: true, keptCount: kept.length, gaps, caveat }
}

/** The gap paragraph in Chapter 4's known-then-limitation-then-study shape. */
export function gapParagraph(gap: Gap, studentClause: string): string {
  return [gap.draftKnown, gap.draftLimitation, studentClause.trim()].filter(Boolean).join(' ')
}

export const GAP_KIND_LABEL: Record<GapKind, string> = {
  topical: 'Topical void',
  methodological: 'Methodological gap',
  contradiction: 'Contradiction',
  theoretical: 'Theoretical gap',
  atheoretical: 'No theory named',
}
