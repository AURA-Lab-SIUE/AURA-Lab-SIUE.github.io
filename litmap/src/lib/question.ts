// The question workbench.
//
// LitMap does not draft a research question. It does something more useful and
// much less impressive: it makes the SHAPE of one visible, fills the slots from
// what the student has already logged, and then checks the result against the
// five criteria and the three failure modes Chapter 6 names.
//
// Chapter 6's own template is the structure here: "some combination of does
// there exist, plus a specific variable or concept, plus a relationship,
// pattern, or difference, plus a bounded population or context, plus, where
// relevant, the confounds being accounted for."
//
// Of the five criteria, three are checkable and two are not. The two that are
// not — whether it has already been answered, and whether it matters — are
// reported as unanswerable rather than quietly skipped, because a checklist
// that shows five ticks when it only tested three is worse than no checklist.

import type { Source } from '../types/source'
import { partition } from './sourceState'
import type { FeasibilityReport } from './feasibility'

export type Goal = 'exploratory' | 'descriptive' | 'explanatory'

export const GOALS: { value: Goal; label: string; asks: string; produces: string; form: 'question' | 'either' }[] = [
  {
    value: 'exploratory',
    label: 'Exploratory',
    asks: 'What is going on here?',
    produces: 'patterns, themes, a preliminary framework',
    form: 'question',
  },
  {
    value: 'descriptive',
    label: 'Descriptive',
    asks: 'What does the landscape look like?',
    produces: 'frequencies, distributions, prevalence',
    form: 'question',
  },
  {
    value: 'explanatory',
    label: 'Explanatory',
    asks: 'Why does this happen? Does X relate to Y?',
    produces: 'support or disconfirmation of a prediction',
    form: 'either',
  },
]

export type Relation = 'nature' | 'prevalence' | 'differs' | 'associated' | 'predicts' | 'varies'

export const RELATIONS: { value: Relation; label: string; goals: Goal[]; needsComparator: boolean }[] = [
  { value: 'nature', label: 'what it looks like', goals: ['exploratory'], needsComparator: false },
  { value: 'prevalence', label: 'how common it is', goals: ['descriptive'], needsComparator: false },
  { value: 'varies', label: 'how it varies by', goals: ['descriptive', 'explanatory'], needsComparator: true },
  { value: 'differs', label: 'differs between', goals: ['explanatory'], needsComparator: true },
  { value: 'associated', label: 'is associated with', goals: ['explanatory'], needsComparator: true },
  { value: 'predicts', label: 'is predicted by', goals: ['explanatory'], needsComparator: true },
]

export type Direction = 'higher' | 'lower' | 'positive' | 'negative'

export interface QuestionDraft {
  goal: Goal
  form: 'question' | 'hypothesis'
  relation: Relation
  /** The outcome, the thing being measured. */
  focus: string
  /** The grouping or predictor, when the relation needs one. */
  comparator: string
  population: string
  context: string
  /** Time window, corpus, sampling frame. */
  bounds: string
  /** For a hypothesis: which way it is predicted to go. */
  direction: Direction | ''
  /** Chapter 6's three failure modes, answered by the student, not guessed. */
  selfSelected: boolean | null
  sameMeasure: boolean | null
  forcedChoice: boolean | null
  /** Their own phrasing, which always wins over the assembled version. */
  ownWording: string
}

export const EMPTY_DRAFT: QuestionDraft = {
  goal: 'explanatory',
  form: 'question',
  relation: 'differs',
  focus: '',
  comparator: '',
  population: '',
  context: '',
  bounds: '',
  direction: '',
  selfSelected: null,
  sameMeasure: null,
  forcedChoice: null,
  ownWording: '',
}

function among(d: QuestionDraft): string {
  const bits = [d.population.trim(), d.context.trim()].filter(Boolean)
  const where = bits.join(' on ')
  const bounds = d.bounds.trim()
  if (!where && !bounds) return ''
  if (where && bounds) return ` among ${where}, ${bounds}`
  return ` among ${where || bounds}`
}

/** The assembled question. Never shown in place of the student's own wording. */
export function assembleQuestion(d: QuestionDraft): string {
  const focus = d.focus.trim() || '[what you are measuring]'
  const comp = d.comparator.trim() || '[what you are comparing it against]'
  const tail = among(d)

  if (d.form === 'hypothesis') {
    const dir =
      d.direction === 'higher' ? 'will be higher in'
        : d.direction === 'lower' ? 'will be lower in'
          : d.direction === 'negative' ? 'will be negatively associated with'
            : 'will be positively associated with'
    return `${capitalise(focus)} ${dir} ${comp}${tail}.`
  }

  switch (d.relation) {
    case 'nature':
      return `What does ${focus} look like${tail}?`
    case 'prevalence':
      return `How common is ${focus}${tail}?`
    case 'varies':
      return `How does ${focus} vary by ${comp}${tail}?`
    case 'differs':
      return `Does ${focus} differ between ${comp}${tail}?`
    case 'associated':
      return `Is ${focus} associated with ${comp}${tail}?`
    case 'predicts':
      return `Does ${comp} predict ${focus}${tail}?`
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function finalQuestion(d: QuestionDraft): string {
  return d.ownWording.trim() || assembleQuestion(d)
}

// ── the checks ────────────────────────────────────────────────────────

export type CheckState = 'pass' | 'fail' | 'unknown' | 'unanswerable'

export interface QuestionCheck {
  id: string
  label: string
  state: CheckState
  detail: string
}

export function needsComparator(relation: Relation): boolean {
  return RELATIONS.find((r) => r.value === relation)?.needsComparator ?? false
}

/** Constructs the student has actually met in the literature. */
export function loggedConstructs(sources: Source[]): string[] {
  const out = new Set<string>()
  for (const s of partition(sources).kept) {
    for (const c of [s.constructX, s.constructY]) {
      const v = c.trim()
      if (v) out.add(v)
    }
  }
  return [...out].sort((a, b) => a.localeCompare(b))
}

function usesLoggedConstruct(value: string, constructs: string[]): boolean {
  const v = value.trim().toLowerCase()
  if (!v) return false
  return constructs.some((c) => {
    const k = c.toLowerCase()
    return k === v || v.includes(k) || k.includes(v)
  })
}

export function checkQuestion(
  d: QuestionDraft,
  sources: Source[],
  feasibility: FeasibilityReport | null
): QuestionCheck[] {
  const constructs = loggedConstructs(sources)
  const wantsComparator = needsComparator(d.relation) && d.form !== 'hypothesis' ? true : d.form === 'hypothesis'
  const checks: QuestionCheck[] = []

  // ── 1. specific ──
  const missing: string[] = []
  if (!d.focus.trim()) missing.push('what you are measuring')
  if (wantsComparator && !d.comparator.trim()) missing.push('what you are comparing it against')
  if (!d.population.trim()) missing.push('a population')
  if (!d.context.trim() && !d.bounds.trim()) missing.push('a context or a boundary')
  checks.push({
    id: 'specific',
    label: 'It is specific',
    state: missing.length === 0 ? 'pass' : 'fail',
    detail:
      missing.length === 0
        ? 'Every slot is filled, so the question names what is measured, in whom, and where.'
        : `Still unbounded. Missing: ${missing.join(', ')}.`,
  })

  // ── 2. measurable ──
  // Only the OUTCOME has to be a measurable construct. The thing you compare
  // against is often a grouping variable (stream category, time of day) that no
  // study ever "measured" as a construct, and requiring it here marked sound
  // questions as unknown.
  const focusKnown = usesLoggedConstruct(d.focus, constructs)
  const compKnown = wantsComparator && usesLoggedConstruct(d.comparator, constructs)
  checks.push({
    id: 'measurable',
    label: 'It is measurable',
    state: !d.focus.trim() ? 'unknown' : focusKnown ? 'pass' : 'unknown',
    detail: !d.focus.trim()
      ? 'Fill in what you are measuring first.'
      : focusKnown
        ? compKnown
          ? 'Both are constructs your sources actually measured, so somebody has already shown they can be.'
          : 'Your outcome is a construct your sources measured, so somebody has shown it can be. Your grouping variable is not, which is usually fine when it is something you can simply read off the data.'
        : 'No source you logged measured this. That is not fatal, but you now owe an operational definition nobody has tested for you.',
  })

  // ── 3. answerable within constraints ──
  checks.push({
    id: 'answerable',
    label: 'It is answerable in the time you have',
    state:
      !feasibility || feasibility.verdict === 'empty'
        ? 'unknown'
        : feasibility.verdict === 'comfortable' || feasibility.verdict === 'tight'
          ? 'pass'
          : 'fail',
    detail:
      !feasibility || feasibility.verdict === 'empty'
        ? 'Fill in the feasibility numbers below and this answers itself.'
        : feasibility.headline,
  })

  // ── 4 and 5: the two nobody can compute ──
  checks.push({
    id: 'novel',
    label: 'It is not already definitively answered',
    state: 'unanswerable',
    detail:
      'No tool can check this. Your literature map is the evidence: if ten sources have tested this and agree, you need a new angle, population or moderator.',
  })
  checks.push({
    id: 'matters',
    label: 'It matters',
    state: 'unanswerable',
    detail:
      'No tool can check this either. "Do streams starting on Tuesdays draw more viewers than Thursdays" is answerable and trivial. This one is for your instructor.',
  })

  return checks
}

// ── Chapter 6's three named failure modes ─────────────────────────────

export interface FailureMode {
  id: 'impossible-comparison' | 'circular' | 'false-binary'
  question: string
  hint: string
  /** Shown when the student answers yes. */
  problem: string
  fix: string
  triggered: boolean
  answered: boolean
}

export function failureModes(d: QuestionDraft): FailureMode[] {
  return [
    {
      id: 'impossible-comparison',
      question: 'Is the thing you are comparing something people chose for themselves?',
      hint: 'Viewers versus non-viewers, subscribers versus not, people who opted in.',
      problem:
        'That is the impossible comparison. Groups people sorted themselves into differ in dozens of ways besides the one you are studying, so any difference you find could be caused by any of them. "Are people who watch Twitch lonelier than people who do not" compares two groups that were never comparable.',
      fix:
        'Either compare something not self-selected (stream category, time of day, message type), or keep the comparison and state plainly that it cannot support a causal claim.',
      triggered: d.selfSelected === true,
      answered: d.selfSelected !== null,
    },
    {
      id: 'circular',
      question: 'Would the two things you named come from the same measurement?',
      hint: 'If both would be read off the same column, or one is defined using the other.',
      problem:
        'That is the circular question. "Do popular streamers attract large audiences because people want to watch them" defines its terms in a loop, so the answer is guaranteed and tells you nothing.',
      fix:
        'Make one of them come from somewhere else: a different column, a different level, a different moment in time.',
      triggered: d.sameMeasure === true,
      answered: d.sameMeasure !== null,
    },
    {
      id: 'false-binary',
      question: 'Does your question force a choice between two explanations?',
      hint: 'Anything shaped like "is it X or is it Y".',
      problem:
        'That is the false binary. "Is it the streamer or the game that matters" assumes you must pick, when the data almost never requires it.',
      fix:
        'Ask how much each contributes, and whether they interact. That is usually the more interesting question anyway.',
      triggered: d.forcedChoice === true,
      answered: d.forcedChoice !== null,
    },
  ]
}

export interface QuestionVerdict {
  checks: QuestionCheck[]
  modes: FailureMode[]
  passed: number
  checkable: number
  triggered: FailureMode[]
  unanswered: number
  ready: boolean
}

export function judgeQuestion(
  d: QuestionDraft,
  sources: Source[],
  feasibility: FeasibilityReport | null
): QuestionVerdict {
  const checks = checkQuestion(d, sources, feasibility)
  const modes = failureModes(d)
  const checkable = checks.filter((c) => c.state !== 'unanswerable').length
  const passed = checks.filter((c) => c.state === 'pass').length
  const triggered = modes.filter((m) => m.triggered)
  const unanswered = modes.filter((m) => !m.answered).length
  // Readiness is the absence of a FAILURE, not the presence of five ticks.
  // "Nobody you read has measured this" is a legitimate place to be; being
  // over budget, or unbounded, or built on a self-selected comparison is not.
  const failed = checks.filter((c) => c.state === 'fail').length
  return {
    checks,
    modes,
    passed,
    checkable,
    triggered,
    unanswered,
    ready: failed === 0 && triggered.length === 0 && unanswered === 0,
  }
}
