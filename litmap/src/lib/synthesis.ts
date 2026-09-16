// The synthesis skeleton — Chapter 4's "synthesis, not summary".
//
// The weak literature review is one paragraph per source. The strong one is
// one paragraph per CLAIM, with two or more sources under it. The chapter
// demonstrates both; this builds the second shape out of what the student
// logged, and refuses to produce the first.
//
// The only honest grouping signal in the data is the construct pair: two
// studies that name the same pair of constructs are talking about the same
// thing, whatever words their abstracts use. Same pair and same direction is
// convergence. Same pair and opposing directions is the contradiction the gap
// detector also reports, and it belongs in the outline too, because a
// disagreement is a paragraph.
//
// What this does NOT do is write the claim. The claim is the interpretation,
// and interpretation is the whole assignment.

import type { Source } from '../types/source'
import { citeLabel } from '../types/source'
import { partition } from './sourceState'

export type GroupKind = 'convergent' | 'divergent'

export interface SynthesisGroup {
  id: string
  kind: GroupKind
  /** The construct pair, as the student wrote it. */
  about: string
  sources: Source[]
  /** One shared direction, when they agree. */
  direction: string | null
}

export interface SynthesisReport {
  ready: boolean
  groups: SynthesisGroup[]
  /** Logged sources whose construct pair nothing else shares. */
  orphans: Source[]
  /** Logged but with no construct pair recorded, so ungroupable. */
  unpaired: Source[]
  keptCount: number
}

function norm(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function buildSynthesis(sources: Source[]): SynthesisReport {
  const kept = partition(sources).kept
  const pairs = new Map<string, { label: string; list: Source[] }>()
  const unpaired: Source[] = []

  for (const s of kept) {
    const x = norm(s.constructX)
    const y = norm(s.constructY)
    if (!x || !y) { unpaired.push(s); continue }
    const key = [x, y].sort().join(' ~ ')
    const label = `${s.constructX.trim()} and ${s.constructY.trim()}`
    const hit = pairs.get(key)
    if (hit) hit.list.push(s)
    else pairs.set(key, { label, list: [s] })
  }

  const groups: SynthesisGroup[] = []
  const orphans: Source[] = []

  for (const [key, { label, list }] of pairs) {
    if (list.length < 2) { orphans.push(...list); continue }
    const directions = new Set(list.map((s) => s.direction).filter((d) => d && d !== 'na'))
    const kind: GroupKind = directions.size > 1 ? 'divergent' : 'convergent'
    groups.push({
      id: key,
      kind,
      about: label,
      sources: [...list].sort((a, b) => a.examinedAt - b.examinedAt),
      direction: directions.size === 1 ? [...directions][0] : null,
    })
  }

  // Biggest groups first: the strongest claim opens the review.
  groups.sort((a, b) => b.sources.length - a.sources.length || a.about.localeCompare(b.about))

  return {
    ready: groups.length > 0,
    groups,
    orphans: orphans.sort((a, b) => a.examinedAt - b.examinedAt),
    unpaired: unpaired.sort((a, b) => a.examinedAt - b.examinedAt),
    keptCount: kept.length,
  }
}

/** The outline, as Markdown. Every claim line is blank on purpose. */
export function synthesisMarkdown(report: SynthesisReport): string {
  const out: string[] = []
  out.push('## Synthesis outline')
  out.push('')
  out.push(
    'One paragraph per claim, not one per source. Write the claim on the blank line; ' +
    'the sources under it are your evidence for it.'
  )
  out.push('')

  if (!report.ready) {
    out.push(
      '_No two sources yet name the same pair of constructs, so there is nothing to group. ' +
      'Keep reading, or check that you recorded the relationship each study reports._'
    )
    out.push('')
    return out.join('\n')
  }

  report.groups.forEach((g, i) => {
    out.push(`### Paragraph ${i + 1}: ${g.about}`)
    out.push('')
    out.push(
      g.kind === 'divergent'
        ? '**Your claim here.** These sources disagree, so the claim is about the disagreement, not about who is right.'
        : '**Your claim here.** These sources point the same way; say what they converge on.'
    )
    out.push('')
    for (const s of g.sources) {
      out.push(`- ${citeLabel(s)} — ${s.finding.trim()}`)
    }
    out.push('')
  })

  if (report.orphans.length > 0) {
    out.push('### Not yet grouped')
    out.push('')
    out.push(
      'Nothing else you have logged names the same constructs as these. That is either ' +
      'a sign you have more to read, or a sign these belong to a different argument.'
    )
    out.push('')
    for (const s of report.orphans) {
      out.push(`- ${citeLabel(s)} — ${s.constructX.trim()} and ${s.constructY.trim()}`)
    }
    out.push('')
  }

  if (report.unpaired.length > 0) {
    out.push('### No relationship recorded')
    out.push('')
    for (const s of report.unpaired) {
      out.push(`- ${citeLabel(s)} — ${s.finding.trim()}`)
    }
    out.push('')
  }

  return out.join('\n')
}
