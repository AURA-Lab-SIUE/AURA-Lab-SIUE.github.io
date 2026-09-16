// The design brief: everything FIG.6 produced, as one Markdown file.
//
// Deliberately includes what did NOT hold up. A brief that printed only the
// question would let a student hand in something the tool had already told
// them was over budget, or built on a comparison people sorted themselves
// into. The failures are the useful part.

import type { QuestionDraft, QuestionVerdict } from './question'
import { finalQuestion, assembleQuestion, GOALS } from './question'
import type { FeasibilityInput, FeasibilityReport } from './feasibility'
import type { MethodFitReport } from './methodFit'
import type { Gap } from './gaps'
import { gapParagraph } from './gaps'
import { findTheory, theoryUrl } from './theories'
import { METHODS } from '../types/source'

export interface DesignBriefInput {
  projectTitle: string
  question: QuestionDraft
  verdict: QuestionVerdict
  feasibility: FeasibilityReport
  feasibilityInput: FeasibilityInput
  theory: string
  method: string
  methods: MethodFitReport
  gap: Gap | null
  gapClause: string
}

const round = (n: number) => Math.round(n * 10) / 10

export function buildDesignBrief(input: DesignBriefInput): string {
  const { projectTitle, question: d, verdict, feasibility, feasibilityInput, theory, method, methods, gap, gapClause } = input
  const out: string[] = []
  const q = finalQuestion(d)

  out.push(`# Design brief: ${projectTitle || 'untitled'}`)
  out.push('')
  out.push(`_From LitMap, ${new Date().toISOString().slice(0, 10)}. Chapter 6 of Vibes to Variables._`)
  out.push('')

  // ── the question ──
  out.push(d.form === 'hypothesis' ? '## Hypothesis' : '## Research question')
  out.push('')
  out.push(`**${q}**`)
  out.push('')
  if (d.ownWording.trim() && d.ownWording.trim() !== assembleQuestion(d)) {
    out.push(`_Assembled from the slots as:_ ${assembleQuestion(d)}`)
    out.push('')
  }
  const goal = GOALS.find((g) => g.value === d.goal)
  if (goal) {
    out.push(`${goal.label} work: asks ${goal.asks.toLowerCase().replace(/\?$/, '')}, and produces ${goal.produces}.`)
    out.push('')
  }

  // ── what held up ──
  out.push('## What held up')
  out.push('')
  for (const c of verdict.checks) {
    const mark =
      c.state === 'pass' ? 'yes'
        : c.state === 'fail' ? '**NO**'
          : c.state === 'unknown' ? 'not yet'
            : 'cannot be checked by any tool'
    out.push(`- **${c.label}** — ${mark}. ${c.detail}`)
  }
  out.push('')

  if (verdict.triggered.length > 0) {
    out.push('### Flagged')
    out.push('')
    for (const m of verdict.triggered) {
      out.push(`**${m.question}** You said yes.`)
      out.push('')
      out.push(m.problem)
      out.push('')
      out.push(`_What to do:_ ${m.fix}`)
      out.push('')
    }
  } else if (verdict.unanswered > 0) {
    out.push(`> ${verdict.unanswered} of the three failure-mode questions are still unanswered. They take a minute each and they are the ones that catch a bad question.`)
    out.push('')
  } else {
    out.push('None of Chapter 6’s three failure modes apply, by your own answers.')
    out.push('')
  }

  // ── the gap it answers ──
  if (gap) {
    out.push('## The gap it answers')
    out.push('')
    out.push(gapParagraph(gap, gapClause))
    out.push('')
    out.push(`_Evidence: ${gap.evidence}_`)
    out.push('')
  }

  // ── lens ──
  out.push('## Theoretical lens')
  out.push('')
  if (theory.trim()) {
    const t = findTheory(theory)
    out.push(t ? `**${t.name}**${t.originator ? ` (${t.originator}, ${t.year})` : ''}` : `**${theory.trim()}**`)
    out.push('')
    if (t) {
      out.push(t.summary)
      out.push('')
      out.push(`<${theoryUrl(t.slug)}>`)
      out.push('')
    } else {
      out.push('_Not one of the 55 in the AURA Lab theory explorer, so no summary is carried here._')
      out.push('')
    }
  } else {
    out.push('_None chosen yet._')
    out.push('')
  }

  // ── method ──
  out.push('## Method')
  out.push('')
  if (method) {
    const chosen = methods.verdicts.find((v) => v.method === method)
    const label = METHODS.find((m) => m.value === method)?.label ?? method
    out.push(`**${label}**`)
    out.push('')
    if (chosen) {
      out.push(`Reaches ${chosen.reaches}. Blind to ${chosen.blind}.`)
      out.push('')
    }
  } else {
    out.push('_None chosen yet._')
    out.push('')
  }
  if (methods.ready) {
    const fits = methods.verdicts.filter((v) => v.fit === 'fits').map((v) => v.label)
    const blocked = methods.verdicts.filter((v) => v.fit === 'blocked').map((v) => v.label)
    if (fits.length > 0) out.push(`Also possible: ${fits.join(', ')}.`)
    if (blocked.length > 0) out.push(`Ruled out by your question or your access: ${blocked.join(', ')}.`)
    out.push('')
  }

  // ── feasibility ──
  out.push('## Feasibility')
  out.push('')
  out.push(feasibility.headline)
  out.push('')
  if (feasibility.lines.length > 0) {
    out.push('| | Hours |')
    out.push('|---|---|')
    for (const l of feasibility.lines) {
      out.push(`| ${l.label} — ${l.detail} | ${round(l.hours)} |`)
    }
    out.push(`| **Total** | **${round(feasibility.totalHours)}** |`)
    out.push(`| Available (${feasibilityInput.weeksAvailable} weeks × ${feasibilityInput.hoursPerWeek} h) | ${round(feasibility.availableHours)} |`)
    out.push('')
  }
  if (feasibility.remedies.length > 0) {
    out.push('Any one of these would bring it inside the budget:')
    out.push('')
    for (const r of feasibility.remedies) out.push(`- ${r}`)
    out.push('')
  }

  out.push('---')
  out.push('')
  out.push(
    'Two things in Chapter 6 nothing here can settle: whether this question has already been ' +
    'answered, and whether it matters. Both are conversations with your instructor, and your ' +
    'literature map is the evidence you bring to them.'
  )
  out.push('')

  return out.join('\n')
}
