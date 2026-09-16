// ── Core domain types ──────────────────────────────────────────────────
//
// The model follows Chapter 4 of *Vibes to Variables* ("Intelligence
// Gathering"). Every field exists because something downstream counts it:
//
//   SearchEvent  — the search log the chapter requires, and the unit the
//                  saturation rule "three consecutive searches, zero new"
//                  is measured over.
//   Source       — one read paper. The analytic fields are the eight
//                  questions the student answers about every source; the
//                  gap detector (not built yet) reads their columns.
//
// Nothing here is scored or judged. Every derived number in lib/ is a count.

/** How a source was found. Chapter 4, phases one to three. */
export type FoundViaKind = 'search' | 'backward' | 'forward' | 'assigned' | 'other'

export interface FoundVia {
  kind: FoundViaKind
  /** SearchEvent.id when kind === 'search'; Source.id when chaining. */
  ref: string | null
}

/** Method used by the study being logged. Feeds methodological-gap detection. */
export type Method =
  | 'survey'
  | 'experiment'
  | 'content-analysis'
  | 'interview'
  | 'focus-group'
  | 'ethnography'
  | 'existing-data'
  | 'mixed'
  | 'conceptual'
  | 'other'

export const METHODS: { value: Method; label: string }[] = [
  { value: 'survey',           label: 'Survey / questionnaire' },
  { value: 'experiment',       label: 'Experiment' },
  { value: 'content-analysis', label: 'Content analysis' },
  { value: 'interview',        label: 'Interviews' },
  { value: 'focus-group',      label: 'Focus groups' },
  { value: 'ethnography',      label: 'Ethnography / observation' },
  { value: 'existing-data',    label: 'Existing / trace data' },
  { value: 'mixed',            label: 'Mixed methods' },
  { value: 'conceptual',       label: 'Conceptual / review (no new data)' },
  { value: 'other',            label: 'Other' },
]

/** Direction of the reported relationship. Two sources with the same pair and
 *  opposing directions is a contradiction, which is why direction is a field
 *  and not prose. */
export type Direction = 'positive' | 'negative' | 'null' | 'mixed' | 'na'

export const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'positive', label: 'Positive — more X went with more Y' },
  { value: 'negative', label: 'Negative — more X went with less Y' },
  { value: 'null',     label: 'No relationship found' },
  { value: 'mixed',    label: 'Mixed / conditional' },
  { value: 'na',       label: 'Not applicable (not a relationship study)' },
]

/** One logged database search. */
export interface SearchEvent {
  id: string
  date: string          // yyyy-mm-dd
  database: string
  queryString: string
  limiters: string
  nResults: number | null
  nKept: number | null
  createdAt: number
}

/** One source the student has read and logged. */
export interface Source {
  id: string

  // ── bibliographic: imported from Zotero, not typed ──
  authors: string[]     // family names, in order
  year: string
  title: string
  container: string     // journal / book / proceedings
  doi: string
  url: string

  // ── the eight analytic questions ──
  keystone: boolean
  foundVia: FoundVia
  population: string    // who / what was studied
  context: string       // platform, medium, setting
  theory: string        // named theory, or '' for none named
  method: Method
  finding: string       // one sentence — this is the review sentence
  constructX: string
  constructY: string
  direction: Direction

  // ── graduate extension: effect size extraction (Chapter 4) ──
  effectSize: string
  effectN: string

  /** Works this source cites that the student recognised as foundational.
   *  Chapter 4's second saturation signal: new articles citing the same
   *  eight to ten sources you have already met. */
  citedFoundational: string[]

  /** Explicitly read and rejected. This is NOT the inverse of "kept": a source
   *  that is neither set aside nor fully logged is still in the pile, unread.
   *  See lib/sourceState.ts for why that third state exists. */
  setAside: boolean

  notes: string
  /** Order examined — the x-axis of the saturation curve. */
  examinedAt: number
  createdAt: number
}

/** Short author-year label used throughout the interface and the exports. */
export function citeLabel(s: Pick<Source, 'authors' | 'year'>): string {
  const a = s.authors.filter(Boolean)
  const year = s.year || 'n.d.'
  if (a.length === 0) return `Unknown (${year})`
  if (a.length === 1) return `${a[0]} (${year})`
  if (a.length === 2) return `${a[0]} and ${a[1]} (${year})`
  return `${a[0]} et al. (${year})`
}

/** Shape of a saved/loaded project file.
 *  `app` is shared with MethodoSync on purpose: one project file is meant to
 *  carry a study from the first reading through to the finished codebook, so
 *  MethodoSync's own sections are preserved verbatim on round trip even though
 *  this tool never touches them. */
export interface ProjectFile {
  app: 'methodosync'
  version: 2
  savedAt: string
  /** LitMap's section. Absent in a file written by MethodoSync alone. */
  literature?: {
    projectTitle: string
    topic: string
    searches: SearchEvent[]
    sources: Source[]
    reviewSourceIds: string[]
    gapSentence: string
    predictableAbstracts: boolean
    chosenGapId?: string | null
    gapClauses?: Record<string, string>
  }
  /** MethodoSync's sections, passed through untouched. */
  videoUrl?: string
  videoId?: string | null
  annotations?: unknown[]
  categories?: unknown[]
  themes?: unknown[]
  codebookRows?: unknown[]
}
