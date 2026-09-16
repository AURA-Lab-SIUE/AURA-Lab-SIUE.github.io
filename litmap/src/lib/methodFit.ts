// Which methods can actually answer the question you just wrote.
//
// Chapter 5 makes the argument this encodes: "choosing a method and choosing a
// theory are, in the end, the same decision approached from two directions."
// A method is not a preference. It is the operational expression of a way of
// seeing, and it either reaches the thing your question asks about or it does
// not.
//
// Two inputs decide it: what kind of question you are asking, and what you can
// actually get your hands on. Both come from the student. The mapping is
// authored from the chapter, not inferred, and every verdict says why.

import type { Method } from '../types/source'
import { METHODS } from '../types/source'
import type { Goal } from './question'

/** What a study needs to exist before it can be run. */
export type Access = 'content' | 'people' | 'setting'

export const ACCESS_OPTIONS: { value: Access; label: string; hint: string }[] = [
  {
    value: 'content',
    label: 'Content that already exists',
    hint: 'Chat logs, posts, articles, transcripts, broadcasts. Anything already recorded.',
  },
  {
    value: 'people',
    label: 'People I can recruit',
    hint: 'Participants who will answer a survey, sit for an interview, or take part in a study.',
  },
  {
    value: 'setting',
    label: 'A setting I can enter',
    hint: 'A community, workplace, or space you can spend real time inside.',
  },
]

interface MethodProfile {
  goals: Goal[]
  needs: Access[]
  /** The evidence this method actually produces. */
  reaches: string
  /** What it structurally cannot see. */
  blind: string
}

const PROFILES: Record<Method, MethodProfile> = {
  'content-analysis': {
    goals: ['descriptive', 'explanatory', 'exploratory'],
    needs: ['content'],
    reaches: 'what is in the communication itself, at a scale too large to eyeball',
    blind: 'how any audience received it, or why anyone produced it',
  },
  survey: {
    goals: ['descriptive', 'explanatory'],
    needs: ['people'],
    reaches: 'what people report about their own attitudes, motivations and behaviour',
    blind: 'the gap between what people say they do and what they do',
  },
  experiment: {
    goals: ['explanatory'],
    needs: ['people'],
    reaches: 'whether one thing causes another, with everything else held still',
    blind: 'how any of it behaves outside the setting you controlled',
  },
  interview: {
    goals: ['exploratory', 'descriptive'],
    needs: ['people'],
    reaches: 'how people make sense of something, in their own words and at length',
    blind: 'prevalence: depth bought with breadth, and it does not generalise statistically',
  },
  'focus-group': {
    goals: ['exploratory'],
    needs: ['people'],
    reaches: 'how a group talks something through, including the disagreement',
    blind: 'the quiet participant, and anything the loudest one has reframed',
  },
  ethnography: {
    goals: ['exploratory'],
    needs: ['setting'],
    reaches: 'what a community does and means, observed over time rather than reported',
    blind: 'anywhere that is not the setting you were in',
  },
  'existing-data': {
    goals: ['descriptive', 'explanatory'],
    needs: ['content'],
    reaches: 'behaviour at a scale you could never collect yourself',
    blind: 'anything the people who collected it did not think to record',
  },
  mixed: {
    goals: ['exploratory', 'descriptive', 'explanatory'],
    needs: ['content', 'people'],
    reaches: 'two kinds of evidence about the same question, each covering the other',
    blind: 'nothing in principle, and in practice the time it takes to do both properly',
  },
  conceptual: {
    goals: ['exploratory'],
    needs: [],
    reaches: 'an argument, a framework, a reading of what other work adds up to',
    blind: 'any observation at all, which is why it cannot test anything',
  },
  other: {
    goals: ['exploratory', 'descriptive', 'explanatory'],
    needs: [],
    reaches: 'whatever you design it to reach',
    blind: 'whatever you have not thought about yet',
  },
}

export type Fit = 'fits' | 'possible' | 'blocked'

export interface MethodVerdict {
  method: Method
  label: string
  fit: Fit
  reason: string
  reaches: string
  blind: string
}

export interface MethodFitReport {
  ready: boolean
  verdicts: MethodVerdict[]
  note: string
}

export function assessMethods(goal: Goal | null, access: Access[]): MethodFitReport {
  const note =
    'Content analysis is the flexible case: it can serve a study that counts and tests, or one that reads for meaning, depending on how you build the codebook. That is why this course teaches it end to end, and it is not a claim that it is the best method.'

  if (!goal || access.length === 0) {
    return {
      ready: false,
      verdicts: [],
      note,
    }
  }

  const verdicts: MethodVerdict[] = METHODS.filter((m) => m.value !== 'other').map(({ value, label }) => {
    const p = PROFILES[value]
    const goalOk = p.goals.includes(goal)
    const accessOk = p.needs.length === 0 || p.needs.every((n) => access.includes(n))
    const accessPartly = p.needs.length === 0 || p.needs.some((n) => access.includes(n))

    let fit: Fit
    let reason: string

    if (!accessPartly) {
      const needed = p.needs.map((n) => ACCESS_OPTIONS.find((a) => a.value === n)?.label.toLowerCase()).join(' and ')
      fit = 'blocked'
      reason = `Needs ${needed}, which you have not got.`
    } else if (!goalOk) {
      fit = 'blocked'
      reason = `Built for a different kind of question. It cannot answer a ${goal} one.`
    } else if (!accessOk) {
      fit = 'possible'
      reason = 'Fits the question, but needs more access than you have said you have.'
    } else {
      fit = 'fits'
      reason = `Answers a ${goal} question, and works with what you can get hold of.`
    }

    return { method: value, label, fit, reason, reaches: p.reaches, blind: p.blind }
  })

  const order: Record<Fit, number> = { fits: 0, possible: 1, blocked: 2 }
  verdicts.sort((a, b) => order[a.fit] - order[b.fit] || a.label.localeCompare(b.label))

  return { ready: true, verdicts, note }
}
