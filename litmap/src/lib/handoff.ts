// Where LitMap ends: a prospectus scaffold, and a handoff into MethodoSync.
//
// Chapter 6 defines the prospectus as six components. LitMap can honestly
// fill three of them from what the student logged — the gap statement, the
// theoretical framework, and the key sources — and it must not pretend to the
// other three. The research question, the method overview and the expected
// contribution are Chapter 6 and 7 decisions made after the reading, and they
// ship as marked blanks with the question that answers each one.
//
// A scaffold that quietly filled all six would hand back a prospectus the
// student never wrote, which is the failure mode of every AI research-question
// generator this tool exists as an alternative to.

import type { Source } from '../types/source'
import { citeLabel } from '../types/source'
import { partition } from './sourceState'
import type { Gap } from './gaps'
import { gapParagraph } from './gaps'

// ── the prospectus scaffold ───────────────────────────────────────────

export interface ProspectusInput {
  projectTitle: string
  sources: Source[]
  /** The gap the student chose to build on, if they have chosen one. */
  gap: Gap | null
  /** Their own third clause for that gap. */
  gapClause: string
  /** The four-sentence review, if it has been assembled. */
  reviewParagraph: string
}

const BLANK = '_[write this]_'

function seenInGap(gap: Gap | null, s: Source): boolean {
  return Boolean(gap?.sources.includes(s.id))
}

export function buildProspectus(input: ProspectusInput): string {
  const { projectTitle, sources, gap, gapClause, reviewParagraph } = input
  const kept = partition(sources).kept

  // The sources the gap RESTS ON come first. An earlier version listed only
  // keystones, so a prospectus whose gap was a contradiction between two
  // specific studies cited neither of them. Chapter 6 asks the gap statement
  // to cite its key sources, and the key sources are its evidence.
  const byId = new Map(kept.map((s) => [s.id, s]))
  const evidence = (gap?.sources ?? []).map((id) => byId.get(id)).filter((s): s is Source => Boolean(s))
  const seen = new Set(evidence.map((s) => s.id))
  const cited = [...evidence]
  for (const s of [...kept.filter((x) => x.keystone), ...kept]) {
    if (cited.length >= 4) break
    if (seen.has(s.id)) continue
    seen.add(s.id)
    cited.push(s)
  }

  // The theory the reading actually used, not one picked for the student.
  const theories = new Map<string, number>()
  for (const s of kept) {
    const t = s.theory.trim()
    if (t) theories.set(t, (theories.get(t) ?? 0) + 1)
  }
  const topTheory = [...theories.entries()].sort((a, b) => b[1] - a[1])[0]

  const out: string[] = []
  out.push(`# Prospectus: ${projectTitle || BLANK}`)
  out.push('')
  out.push(
    '_Scaffolded by LitMap from your literature map. Three sections are filled from what ' +
    'you logged; the rest are yours. Chapter 6 has the full specification._'
  )
  out.push('')

  out.push('## 1. Title')
  out.push('')
  out.push(projectTitle || BLANK)
  out.push('')
  out.push('> A descriptive title that hints at the key variables.')
  out.push('')

  out.push('## 2. Research question or hypothesis')
  out.push('')
  out.push(BLANK)
  out.push('')
  out.push(
    '> One to three, not five and not ten. A question when you are exploring or describing; ' +
    'a hypothesis when theory makes a specific prediction. LitMap will not draft this: the ' +
    'gap below is what it is an answer to, and getting from one to the other is the work.'
  )
  out.push('')

  out.push('## 3. Theoretical framework')
  out.push('')
  if (topTheory) {
    out.push(
      `${topTheory[0]} — used by ${topTheory[1]} of the ${kept.length} sources you logged.`
    )
    out.push('')
    out.push(`${BLANK} Two to three sentences: what the theory claims, and how it bears on your question.`)
  } else {
    out.push(BLANK)
    out.push('')
    out.push('> None of your sources named a theory, which is itself worth a sentence.')
  }
  out.push('')

  out.push('## 4. Gap in the literature')
  out.push('')
  if (gap) {
    const para = gapParagraph(gap, gapClause)
    out.push(para)
    if (!gapClause.trim()) {
      out.push('')
      out.push(`> ${BLANK} — what your study does about it. The third clause is missing.`)
    }
    out.push('')
    out.push(`_Evidence: ${gap.evidence}_`)
  } else if (reviewParagraph.trim()) {
    out.push(reviewParagraph)
  } else {
    out.push(BLANK)
  }
  out.push('')
  if (cited.length > 0) {
    out.push('Key sources:')
    out.push('')
    for (const s of cited) {
      const tags = [
        seenInGap(gap, s) ? 'the gap rests on this' : '',
        s.keystone ? 'keystone' : '',
      ].filter(Boolean)
      const suffix = tags.length > 0 ? ` (${tags.join('; ')})` : ''
      out.push(`- ${citeLabel(s)}${suffix} — ${s.finding.trim()}`)
    }
    out.push('')
  }

  out.push('## 5. Method')
  out.push('')
  out.push(BLANK)
  out.push('')
  out.push(
    '> Three to four sentences: the data, the coding or measurement, and the number of cases. ' +
    'If you are heading into a content analysis, MethodoSync picks up from here.'
  )
  out.push('')

  out.push('## 6. Expected contribution')
  out.push('')
  out.push(BLANK)
  out.push('')
  out.push('> One to two sentences, scoped to what this study can actually deliver.')
  out.push('')

  out.push('---')
  out.push('')
  out.push(
    '**Before you finalise:** can you access the data, can you analyse it in the time you have, ' +
    'does your method match your question, and have you controlled scope creep? Chapter 6 ends ' +
    'on that feasibility test and it is not rhetorical.'
  )
  out.push('')

  return out.join('\n')
}

// ── the MethodoSync handoff ───────────────────────────────────────────

/** MethodoSync's codebook row, matched to its own `types/annotation.ts`. */
export interface CodebookRow {
  id: string
  origin: 'category' | 'theme' | 'manual'
  sourceId: string | null
  variableName: string
  variableLabel: string
  variableType: 'binary' | 'categorical' | 'ordinal' | 'count'
  definitionText: string
  inclusionRules: string
  exclusionRules: string
  valuesScale: string
  anchorExample: string
  anchorVideoId: string | null
  anchorTimestamp: number | null
}

/** statistics-safe snake_case, as MethodoSync expects for a variable name. */
function snake(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'variable'
}

/**
 * Turn the constructs the student met in the literature into candidate
 * codebook variables.
 *
 * `binary` and `origin: 'manual'` are MethodoSync's own defaults for a row
 * nobody has classified yet, so a seeded row arrives looking exactly like one
 * the student started by hand. The measurement level is a Chapter 9 decision
 * and deciding it here would be guessing on their behalf.
 *
 * Existing rows are never touched, and a construct already present by name is
 * skipped, so re-running the handoff cannot duplicate or overwrite work.
 */
export function seedCodebookFromConstructs(
  sources: Source[],
  existing: CodebookRow[],
  newId: () => string
): CodebookRow[] {
  const kept = partition(sources).kept
  const taken = new Set(existing.map((r) => r.variableName))
  const seen = new Set<string>()
  const rows: CodebookRow[] = []

  for (const s of kept) {
    for (const construct of [s.constructX, s.constructY]) {
      const label = construct.trim()
      if (!label) continue
      const name = snake(label)
      if (taken.has(name) || seen.has(name)) continue
      seen.add(name)
      rows.push({
        id: newId(),
        origin: 'manual',
        sourceId: null,
        variableName: name,
        variableLabel: label,
        variableType: 'binary',
        definitionText:
          `From the literature: ${label}, as used by ${citeLabel(s)}. Replace this with your own conceptual definition.`,
        inclusionRules: '',
        exclusionRules: '',
        valuesScale: '0 = Absent\n1 = Present\n-99 = Missing / Uncodable',
        anchorExample: '',
        anchorVideoId: null,
        anchorTimestamp: null,
      })
    }
  }
  return [...existing, ...rows]
}
