// ── Core domain types ──────────────────────────────────────────────────
//
// The model mirrors the grounded-theory pipeline the tool teaches:
//   Stage 1  Annotation  — open coding, each synced to a video moment
//   Stage 2  Category     — axial coding (open codes clustered)
//            Theme        — selective coding (categories grouped)
//   Stage 3  CodebookRow  — operationalized quantitative variable

/** A single open-coded observation, anchored to an exact video moment. */
export interface Annotation {
  id: string
  videoId: string
  timestamp: number          // seconds into the video (float, from the player)
  observationText: string
  openCodes: string[]
  analyticalMemo: string
  createdAt: number
}

/** An axial category: a cluster of open codes given a higher-order name. */
export interface Category {
  id: string
  label: string
  memo: string               // why these codes belong together
  openCodes: string[]        // the open-code strings assigned here
  createdAt: number
}

/** An overarching theme: a group of categories (selective coding). */
export interface Theme {
  id: string
  label: string
  memo: string
  categoryIds: string[]
  createdAt: number
}

/** Measurement level of a codebook variable — drives the values scaffold. */
export type VariableType = 'binary' | 'categorical' | 'ordinal' | 'count'

export const VARIABLE_TYPES: { value: VariableType; label: string; hint: string; scaleTemplate: string }[] = [
  {
    value: 'binary',
    label: 'Binary (present / absent)',
    hint: 'The category is either there or it is not.',
    scaleTemplate: '0 = Absent\n1 = Present\n-99 = Missing / Uncodable',
  },
  {
    value: 'categorical',
    label: 'Categorical (nominal)',
    hint: 'Unordered mutually exclusive types. Number the options.',
    scaleTemplate: '1 = <type A>\n2 = <type B>\n3 = <type C>\n-99 = Missing / Uncodable',
  },
  {
    value: 'ordinal',
    label: 'Ordinal (ranked)',
    hint: 'Ordered levels of degree or intensity.',
    scaleTemplate: '1 = Low\n2 = Moderate\n3 = High\n-99 = Missing / Uncodable',
  },
  {
    value: 'count',
    label: 'Count / frequency',
    hint: 'How many times it occurs in the coded unit.',
    scaleTemplate: 'Integer count of occurrences (0, 1, 2, …)\n-99 = Missing / Uncodable',
  },
]

/** A quantitative variable in the codebook. */
export interface CodebookRow {
  id: string
  origin: 'category' | 'theme' | 'manual'
  sourceId: string | null    // Category.id or Theme.id it was seeded from
  variableName: string       // snake_case, statistics-safe
  variableLabel: string
  variableType: VariableType
  definitionText: string
  inclusionRules: string
  exclusionRules: string
  valuesScale: string
  anchorExample: string
  anchorVideoId: string | null
  anchorTimestamp: number | null   // seconds — becomes a deep-link on export
}

/** Shape of a saved/loaded project file (JSON). */
export interface ProjectFile {
  app: 'methodosync'
  version: 2
  savedAt: string
  videoUrl: string
  videoId: string | null
  annotations: Annotation[]
  categories: Category[]
  themes: Theme[]
  codebookRows: CodebookRow[]
}

// ── YouTube IFrame API types ───────────────────────────────────────────

export type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5

export interface YTPlayerEvent {
  target: YTPlayer
  data: YTPlayerState
}

export interface YTPlayer {
  loadVideoById(videoId: string): void
  pauseVideo(): void
  playVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getPlayerState(): YTPlayerState
  destroy(): void
}
