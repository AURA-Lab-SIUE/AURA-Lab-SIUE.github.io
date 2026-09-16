import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchEvent, Source, Method, Direction, FoundVia } from '../types/source'
import type { ImportedRef } from '../lib/bibImport'
import type { PassthroughSections } from '../lib/projectIO'
import { newId } from '../utils/id'
import { seedCodebookFromConstructs, type CodebookRow } from '../lib/handoff'

export type Stage = 1 | 2 | 3 | 4 | 5

interface AppState {
  stage: Stage
  projectTitle: string
  topic: string
  searches: SearchEvent[]
  sources: Source[]
  reviewSourceIds: string[]
  gapSentence: string
  predictableAbstracts: boolean
  /** Which detected gap the student is building on. */
  chosenGapId: string | null
  /** Their own "what this study does about it" clause, per gap. */
  gapClauses: Record<string, string>
  /** MethodoSync's half of the project file, held so a round trip cannot eat it. */
  passthrough: PassthroughSections
  /** Source currently open in the form; null means the form is closed. */
  editingId: string | null
  announcement: string

  setStage: (s: Stage) => void
  setProjectTitle: (v: string) => void
  setTopic: (v: string) => void

  addSearch: (s: Omit<SearchEvent, 'id' | 'createdAt'>) => void
  updateSearch: (id: string, patch: Partial<SearchEvent>) => void
  removeSearch: (id: string) => void

  addBlankSource: (foundVia?: FoundVia) => string
  addImported: (refs: ImportedRef[], foundVia: FoundVia) => number
  updateSource: (id: string, patch: Partial<Source>) => void
  removeSource: (id: string) => void
  setEditing: (id: string | null) => void

  setReviewSourceIds: (ids: string[]) => void
  toggleReviewSource: (id: string) => void
  setGapSentence: (v: string) => void
  setPredictable: (v: boolean) => void
  chooseGap: (id: string | null) => void
  setGapClause: (id: string, v: string) => void
  handOffToMethodoSync: () => number

  announce: (msg: string) => void
  loadProject: (payload: {
    projectTitle: string
    topic: string
    searches: SearchEvent[]
    sources: Source[]
    reviewSourceIds: string[]
    gapSentence: string
    predictableAbstracts: boolean
    chosenGapId: string | null
    gapClauses: Record<string, string>
    passthrough: PassthroughSections
  }) => void
  resetProject: () => void
}

/** The slice of state that is persisted. Named so `migrate` can be typed
 *  against exactly the same shape rather than restating it. */
const partializeForTypes = (s: AppState) => ({
  stage: s.stage,
  projectTitle: s.projectTitle,
  topic: s.topic,
  searches: s.searches,
  sources: s.sources,
  reviewSourceIds: s.reviewSourceIds,
  gapSentence: s.gapSentence,
  predictableAbstracts: s.predictableAbstracts,
  chosenGapId: s.chosenGapId,
  gapClauses: s.gapClauses,
  passthrough: s.passthrough,
})

function blankSource(order: number, foundVia: FoundVia): Source {
  return {
    id: newId(),
    authors: [],
    year: '',
    title: '',
    container: '',
    doi: '',
    url: '',
    keystone: false,
    foundVia,
    population: '',
    context: '',
    theory: '',
    method: '' as unknown as Method,
    finding: '',
    constructX: '',
    constructY: '',
    direction: '' as unknown as Direction,
    effectSize: '',
    effectN: '',
    citedFoundational: [],
    setAside: false,
    notes: '',
    examinedAt: order,
    createdAt: Date.now(),
  }
}

const EMPTY = {
  stage: 1 as Stage,
  projectTitle: '',
  topic: '',
  searches: [] as SearchEvent[],
  sources: [] as Source[],
  reviewSourceIds: [] as string[],
  gapSentence: '',
  predictableAbstracts: false,
  chosenGapId: null as string | null,
  gapClauses: {} as Record<string, string>,
  passthrough: {} as PassthroughSections,
  editingId: null as string | null,
  announcement: '',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      setStage: (stage) => set({ stage }),
      setProjectTitle: (projectTitle) => set({ projectTitle }),
      setTopic: (topic) => set({ topic }),

      addSearch: (s) =>
        set((st) => ({
          searches: [...st.searches, { ...s, id: newId(), createdAt: Date.now() }],
          announcement: 'Search logged.',
        })),
      updateSearch: (id, patch) =>
        set((st) => ({
          searches: st.searches.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        })),
      removeSearch: (id) =>
        set((st) => ({
          searches: st.searches.filter((q) => q.id !== id),
          // Sources found by a deleted search keep their place in the reading
          // order but lose the link, rather than vanishing with it.
          sources: st.sources.map((s) =>
            s.foundVia.kind === 'search' && s.foundVia.ref === id
              ? { ...s, foundVia: { kind: 'other', ref: null } }
              : s
          ),
        })),

      addBlankSource: (foundVia = { kind: 'other', ref: null }) => {
        const order = get().sources.length + 1
        const s = blankSource(order, foundVia)
        set((st) => ({ sources: [...st.sources, s], editingId: s.id, stage: 2 }))
        return s.id
      },

      addImported: (refs, foundVia) => {
        const existing = get().sources
        const seen = new Set(
          existing.map((s) => `${(s.authors[0] ?? '').toLowerCase()}|${s.year}|${s.title.toLowerCase()}`)
        )
        const fresh: Source[] = []
        let order = existing.length
        for (const r of refs) {
          const key = `${(r.authors[0] ?? '').toLowerCase()}|${r.year}|${r.title.toLowerCase()}`
          if (seen.has(key)) continue
          seen.add(key)
          order++
          fresh.push({ ...blankSource(order, foundVia), ...r })
        }
        if (fresh.length > 0) {
          set((st) => ({
            sources: [...st.sources, ...fresh],
            stage: 2,
            announcement: `${fresh.length} references imported.`,
          }))
        }
        return fresh.length
      },

      updateSource: (id, patch) =>
        set((st) => ({ sources: st.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),

      removeSource: (id) =>
        set((st) => ({
          sources: st.sources
            .filter((s) => s.id !== id)
            .sort((a, b) => a.examinedAt - b.examinedAt)
            .map((s, i) => ({ ...s, examinedAt: i + 1 })),
          reviewSourceIds: st.reviewSourceIds.filter((r) => r !== id),
          editingId: st.editingId === id ? null : st.editingId,
        })),

      setEditing: (editingId) => set({ editingId }),

      setReviewSourceIds: (reviewSourceIds) => set({ reviewSourceIds }),
      toggleReviewSource: (id) =>
        set((st) => {
          const has = st.reviewSourceIds.includes(id)
          if (has) return { reviewSourceIds: st.reviewSourceIds.filter((r) => r !== id) }
          if (st.reviewSourceIds.length >= 3) return {}
          return { reviewSourceIds: [...st.reviewSourceIds, id] }
        }),
      setGapSentence: (gapSentence) => set({ gapSentence }),
      setPredictable: (predictableAbstracts) => set({ predictableAbstracts }),

      chooseGap: (chosenGapId) => set({ chosenGapId }),
      setGapClause: (id, v) =>
        set((st) => ({ gapClauses: { ...st.gapClauses, [id]: v } })),

      // Writes candidate variables into MethodoSync's own codebook array, in
      // its own shape, leaving anything already there untouched.
      handOffToMethodoSync: () => {
        const st = get()
        const existing = (st.passthrough.codebookRows ?? []) as CodebookRow[]
        const merged = seedCodebookFromConstructs(st.sources, existing, newId)
        const added = merged.length - existing.length
        if (added > 0) {
          set({
            passthrough: { ...st.passthrough, codebookRows: merged },
            announcement: `${added} candidate variables handed to MethodoSync.`,
          })
        }
        return added
      },

      announce: (announcement) => set({ announcement }),

      loadProject: (p) =>
        set({
          ...EMPTY,
          ...p,
          stage: p.sources.length > 0 ? 2 : 1,
          announcement: `Project loaded: ${p.sources.length} sources.`,
        }),

      resetProject: () => set({ ...EMPTY, announcement: 'New project started.' }),
    }),
    {
      name: 'litmap-v1',
      version: 2,
      // v1 stored `relevant: boolean`, where false meant "read and rejected"
      // and true covered both "kept" and "never opened". Only the false case
      // carried information; the rest re-derives from the fields themselves.
      migrate: (persisted, version) => {
        type Persisted = ReturnType<typeof partializeForTypes>
        type LegacySource = Omit<Source, 'setAside'> & { setAside?: boolean; relevant?: boolean }
        const st = persisted as Persisted
        if (version >= 2 || !Array.isArray(st?.sources)) return st
        const sources = (st.sources as unknown as LegacySource[]).map((raw): Source => {
          if (typeof raw.setAside === 'boolean') return raw as Source
          const { relevant, ...rest } = raw
          return { ...(rest as Omit<Source, 'setAside'>), setAside: relevant === false }
        })
        return { ...st, sources }
      },
      partialize: partializeForTypes,
    }
  )
)
