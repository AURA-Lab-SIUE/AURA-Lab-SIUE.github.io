// Markdown export. Chapter 4 asks for the literature map to live as a
// Markdown file in the project, so that is what comes out: one file the
// student commits, pastes into a prospectus, or hands in.

import type { SearchEvent, Source } from '../types/source'
import { citeLabel, METHODS, DIRECTIONS } from '../types/source'
import type { MvlrReport } from './mvlr'
import { mvlrMarkdown } from './mvlr'
import type { SaturationReport } from './saturation'
import { partition } from './sourceState'

function methodLabel(v: string): string {
  return METHODS.find((m) => m.value === v)?.label ?? v
}
function directionLabel(v: string): string {
  return DIRECTIONS.find((d) => d.value === v)?.label.split(' — ')[0] ?? v
}
/** Escape pipes so a stray one in a student's prose cannot break a table row. */
function cell(s: string): string {
  return (s || '—').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
}

export interface ExportInput {
  projectTitle: string
  topic: string
  sources: Source[]
  searches: SearchEvent[]
  saturation: SaturationReport
  mvlr: MvlrReport
  gapSentence: string
}

export function buildMarkdown(input: ExportInput): string {
  const { projectTitle, topic, sources, searches, saturation, mvlr, gapSentence } = input
  const today = new Date().toISOString().slice(0, 10)
  const byOrder = (a: Source, b: Source) => a.examinedAt - b.examinedAt
  const { kept, aside, pile } = partition(sources)
  const relevant = [...kept].sort(byOrder)
  const examinedCount = kept.length + aside.length
  const out: string[] = []

  out.push(`# ${projectTitle || 'Literature map'}`)
  out.push('')
  if (topic.trim()) {
    out.push(`**Topic as it stands.** ${topic.trim()}`)
    out.push('')
  }
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  const pileNote = pile.length > 0 ? ` ${plural(pile.length, 'reference', 'references')} still unread.` : ''
  out.push(
    `_${plural(relevant.length, 'source', 'sources')} kept of ${examinedCount} examined.${pileNote} ` +
    `${plural(searches.length, 'search', 'searches')} logged. Exported ${today} from LitMap._`
  )
  out.push('')

  // ── the four-sentence review ──
  const paragraph = mvlrMarkdown(mvlr, gapSentence)
  if (paragraph.trim()) {
    out.push('## First pass: three sources and a gap')
    out.push('')
    out.push(paragraph)
    out.push('')
    if (!gapSentence.trim()) {
      out.push('> The gap sentence is still missing. Three findings without a gap is a summary, not a review.')
      out.push('')
    }
    if (mvlr.shared.length > 0) {
      out.push('What these three have in common:')
      out.push('')
      for (const s of mvlr.shared) {
        out.push(`- **${s.label}:** ${s.value}. Points at ${s.pointsAt}.`)
      }
      out.push('')
    }
  }

  // ── saturation ──
  out.push('## Saturation')
  out.push('')
  out.push(saturation.headline)
  out.push('')
  for (const t of saturation.tests) {
    const mark = t.passed ? 'yes' : 'not yet'
    out.push(`- **${t.label}** — ${mark}. ${t.detail}`)
  }
  out.push('')
  if (saturation.core.length > 0) {
    out.push('Foundational works, by how many of your sources cite them:')
    out.push('')
    for (const c of saturation.core) {
      out.push(`- ${c.work} (${c.count})`)
    }
    out.push('')
  }

  // ── the matrix ──
  out.push('## Sources')
  out.push('')
  out.push('| # | Source | Population | Context | Theory | Method | Direction | Finding |')
  out.push('|---|---|---|---|---|---|---|---|')
  relevant.forEach((s, i) => {
    out.push(
      `| ${i + 1} | ${cell(citeLabel(s))}${s.keystone ? ' **(keystone)**' : ''} | ${cell(s.population)} | ${cell(s.context)} | ${cell(s.theory)} | ${cell(methodLabel(s.method))} | ${cell(directionLabel(s.direction))} | ${cell(s.finding)} |`
    )
  })
  out.push('')

  if (aside.length > 0) {
    out.push(`### Examined and set aside (${aside.length})`)
    out.push('')
    for (const s of [...aside].sort(byOrder)) {
      out.push(`- ${citeLabel(s)}. ${cell(s.title)}${s.notes.trim() ? ` — ${cell(s.notes)}` : ''}`)
    }
    out.push('')
  }

  // Imported and never opened. Listed under its own heading and kept out of
  // the matrix and the reference list, so this document can never imply a
  // paper was read when it was not.
  if (pile.length > 0) {
    out.push(`### In the pile, not yet read (${pile.length})`)
    out.push('')
    for (const s of [...pile].sort(byOrder)) {
      out.push(`- ${citeLabel(s)}. ${cell(s.title)}`)
    }
    out.push('')
  }

  // ── full references: ONLY what was actually read and logged ──
  out.push('## References logged')
  out.push('')
  for (const s of relevant) {
    const bits = [
      s.authors.join(', ') || 'Unknown',
      s.year ? `(${s.year}).` : '(n.d.).',
      s.title ? (/[.!?]$/.test(s.title) ? s.title : `${s.title}.`) : '',
      s.container ? `*${s.container}*.` : '',
      s.doi ? `https://doi.org/${s.doi.replace(/^https?:\/\/doi\.org\//, '')}` : s.url,
    ]
    out.push(`- ${bits.filter(Boolean).join(' ')}`)
  }
  out.push('')

  // ── search log ──
  if (searches.length > 0) {
    out.push('## Search log')
    out.push('')
    out.push('| Date | Database | Search string | Limiters | Results | Screened in |')
    out.push('|---|---|---|---|---|---|')
    for (const q of [...searches].sort((a, b) => a.createdAt - b.createdAt)) {
      out.push(
        `| ${cell(q.date)} | ${cell(q.database)} | \`${(q.queryString || '').replace(/\|/g, '\\|').replace(/`/g, '')}\` | ${cell(q.limiters)} | ${q.nResults ?? '—'} | ${q.nKept ?? '—'} |`
      )
    }
    out.push('')
  }

  // ── effect sizes, when any were extracted ──
  const withEffects = relevant.filter((s) => s.effectSize.trim())
  if (withEffects.length > 0) {
    out.push('## Effect sizes extracted')
    out.push('')
    out.push('| Source | Effect size | N |')
    out.push('|---|---|---|')
    for (const s of withEffects) {
      out.push(`| ${cell(citeLabel(s))} | ${cell(s.effectSize)} | ${cell(s.effectN)} |`)
    }
    out.push('')
  }

  return out.join('\n')
}
