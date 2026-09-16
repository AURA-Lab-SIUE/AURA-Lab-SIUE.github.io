import type { ProjectFile, SearchEvent, Source } from '../types/source'
import { EMPTY_DRAFT, type QuestionDraft } from './question'
import { DEFAULT_FEASIBILITY, type FeasibilityInput } from './feasibility'
import type { Access } from './methodFit'
import { downloadBlob } from '../utils/downloadBlob'

export interface LiteratureSnapshot {
  projectTitle: string
  topic: string
  searches: SearchEvent[]
  sources: Source[]
  reviewSourceIds: string[]
  gapSentence: string
  predictableAbstracts: boolean
  chosenGapId: string | null
  gapClauses: Record<string, string>
  question: QuestionDraft
  feasibility: FeasibilityInput
  chosenTheory: string
  access: Access[]
  chosenMethod: string
}

/** Anything MethodoSync owns, carried through untouched so that one file can
 *  hold a project from the first reading to the finished codebook. */
export interface PassthroughSections {
  videoUrl?: string
  videoId?: string | null
  annotations?: unknown[]
  categories?: unknown[]
  themes?: unknown[]
  codebookRows?: unknown[]
}

export function exportProject(
  snapshot: LiteratureSnapshot,
  passthrough: PassthroughSections
): void {
  const project: ProjectFile = {
    app: 'methodosync',
    version: 2,
    savedAt: new Date().toISOString(),
    literature: snapshot,
    ...passthrough,
  }
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const stamp = new Date().toISOString().slice(0, 10)
  downloadBlob(blob, `${slugify(snapshot.projectTitle, 'litmap')}-${stamp}.methodosync.json`)
}

/** A filename-safe slug capped at 48 characters, cut at a word boundary.
 *  A blind slice(0, 40) produced "directed-and-broadcast-chat-across-strea". */
export function slugify(title: string, fallback: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return fallback
  const out: string[] = []
  for (const w of words) {
    const next = out.length === 0 ? w : `${out.join('-')}-${w}`
    if (next.length > 48) break
    out.push(w)
  }
  // A single first word longer than the cap still has to produce something.
  return out.length > 0 ? out.join('-') : words[0].slice(0, 48)
}

/** What `parseProject` guarantees: the loose on-disk shape, normalised. */
export interface ParsedProject extends Omit<ProjectFile, 'literature'> {
  literature: LiteratureSnapshot
}

/** Parse a project file. A file written by MethodoSync alone is valid and
 *  simply has no literature section yet, which is the normal way a student
 *  arrives here from the other direction. */
export function parseProject(text: string): ParsedProject {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON. Choose a .methodosync.json project file.')
  }
  const p = data as Partial<ProjectFile>
  if (!p || p.app !== 'methodosync') {
    throw new Error('That does not look like a LitMap or MethodoSync project file.')
  }
  const lit = p.literature
  return {
    app: 'methodosync',
    version: 2,
    savedAt: p.savedAt ?? new Date().toISOString(),
    literature: {
      projectTitle: lit?.projectTitle ?? '',
      topic: lit?.topic ?? '',
      searches: Array.isArray(lit?.searches) ? lit.searches : [],
      sources: Array.isArray(lit?.sources) ? lit.sources.map(migrateSource) : [],
      reviewSourceIds: Array.isArray(lit?.reviewSourceIds) ? lit.reviewSourceIds : [],
      gapSentence: lit?.gapSentence ?? '',
      predictableAbstracts: Boolean(lit?.predictableAbstracts),
      chosenGapId: lit?.chosenGapId ?? null,
      gapClauses: lit?.gapClauses ?? {},
      // Merged onto the defaults so a project file written before FIG.6
      // existed opens with a complete draft rather than undefined fields.
      question: { ...EMPTY_DRAFT, ...((lit?.question ?? {}) as Partial<QuestionDraft>) },
      feasibility: { ...DEFAULT_FEASIBILITY, ...((lit?.feasibility ?? {}) as Partial<FeasibilityInput>) },
      chosenTheory: lit?.chosenTheory ?? '',
      access: (lit?.access ?? []) as Access[],
      chosenMethod: lit?.chosenMethod ?? '',
    },
    videoUrl: p.videoUrl,
    videoId: p.videoId,
    annotations: p.annotations,
    categories: p.categories,
    themes: p.themes,
    codebookRows: p.codebookRows,
  }
}

/** Project files written before 2026-09-16 carried `relevant: boolean`, where
 *  `false` meant "read and rejected" and `true` covered both "read and kept"
 *  and "imported, never opened". Only the false case carries information, so
 *  that is the only one mapped; everything else re-derives from the fields. */
function migrateSource(raw: unknown): Source {
  const s = raw as Source & { relevant?: boolean }
  if (typeof s.setAside === 'boolean') return s
  const { relevant, ...rest } = s
  return { ...(rest as Source), setAside: relevant === false }
}
