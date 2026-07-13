import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Annotation,
  Category,
  Theme,
  CodebookRow,
  VariableType,
  ProjectFile,
  YTPlayerState,
} from '../types/annotation'
import { VARIABLE_TYPES } from '../types/annotation'
import { sanitizeVariableName } from '../lib/sanitize'

function generateId(): string {
  // 12 hex-ish chars from two random slices — collision-safe at classroom scale.
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 8)
  )
}

function scaleTemplateFor(type: VariableType): string {
  return VARIABLE_TYPES.find((t) => t.value === type)?.scaleTemplate ?? ''
}

export type Stage = 'stage1' | 'stage2' | 'stage3'

export interface DraftAnnotation {
  observationText: string
  openCodes: string[]
  analyticalMemo: string
}

const emptyDraft: DraftAnnotation = {
  observationText: '',
  openCodes: [],
  analyticalMemo: '',
}

export interface CodeStat {
  code: string
  count: number
  annotationIds: string[]
}

interface AppState {
  // ── Navigation ──────────────────────────────────────────────────────
  activeStage: Stage
  setActiveStage: (stage: Stage) => void

  // ── Video ────────────────────────────────────────────────────────────
  videoUrl: string
  videoId: string | null
  playerState: YTPlayerState
  capturedTimestamp: number
  timestampLocked: boolean
  setVideoUrl: (url: string) => void
  setVideoId: (id: string | null) => void
  setPlayerState: (state: YTPlayerState) => void
  captureTimestamp: (t: number) => void
  nudgeTimestamp: (delta: number) => void

  // ── Stage 1: draft + annotations ────────────────────────────────────
  draft: DraftAnnotation
  editingAnnotationId: string | null
  updateDraft: (patch: Partial<DraftAnnotation>) => void
  clearDraft: () => void
  annotations: Annotation[]
  saveAnnotation: () => void
  beginEditAnnotation: (id: string) => void
  cancelEdit: () => void
  deleteAnnotation: (id: string) => void

  // ── Derived helpers ─────────────────────────────────────────────────
  getCodeStats: () => CodeStat[]
  getAssignedCodes: () => Set<string>

  // ── Stage 2: categories + themes ────────────────────────────────────
  categories: Category[]
  addCategory: (label: string) => string
  updateCategory: (id: string, patch: Partial<Pick<Category, 'label' | 'memo'>>) => void
  deleteCategory: (id: string) => void
  assignCodeToCategory: (categoryId: string, code: string) => void
  unassignCodeFromCategory: (categoryId: string, code: string) => void

  themes: Theme[]
  addTheme: (label: string) => string
  updateTheme: (id: string, patch: Partial<Pick<Theme, 'label' | 'memo'>>) => void
  deleteTheme: (id: string) => void
  toggleCategoryInTheme: (themeId: string, categoryId: string) => void

  // ── Stage 3: codebook ───────────────────────────────────────────────
  codebookRows: CodebookRow[]
  seedCodebook: () => void
  addManualRow: () => void
  updateCodebookRow: (id: string, patch: Partial<CodebookRow>) => void
  setVariableType: (id: string, type: VariableType) => void
  deleteCodebookRow: (id: string) => void

  // ── Project I/O ─────────────────────────────────────────────────────
  loadProject: (project: ProjectFile) => void
  resetAll: () => void

  // ── Accessibility announcements ─────────────────────────────────────
  announcement: string
  announce: (message: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Navigation ────────────────────────────────────────────────────
      activeStage: 'stage1',
      setActiveStage: (stage) => set({ activeStage: stage }),

      // ── Video ──────────────────────────────────────────────────────────
      videoUrl: '',
      videoId: null,
      playerState: -1,
      capturedTimestamp: 0,
      timestampLocked: false,
      setVideoUrl: (url) => set({ videoUrl: url }),
      setVideoId: (id) => set({ videoId: id }),
      setPlayerState: (state) => set({ playerState: state }),
      captureTimestamp: (t) => set({ capturedTimestamp: t, timestampLocked: true }),
      nudgeTimestamp: (delta) =>
        set((s) => ({
          capturedTimestamp: Math.max(0, s.capturedTimestamp + delta),
          timestampLocked: true,
        })),

      // ── Stage 1: draft + annotations ───────────────────────────────────
      draft: { ...emptyDraft },
      editingAnnotationId: null,
      updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      clearDraft: () =>
        set({
          draft: { ...emptyDraft },
          capturedTimestamp: 0,
          timestampLocked: false,
          editingAnnotationId: null,
        }),

      annotations: [],
      saveAnnotation: () => {
        const { videoId, capturedTimestamp, draft, editingAnnotationId } = get()
        if (!videoId) return
        if (!draft.observationText.trim() && draft.openCodes.length === 0) return

        if (editingAnnotationId) {
          set((s) => ({
            annotations: s.annotations.map((a) =>
              a.id === editingAnnotationId
                ? { ...a, timestamp: capturedTimestamp, ...draft }
                : a
            ),
          }))
          get().announce('Annotation updated.')
        } else {
          const annotation: Annotation = {
            id: generateId(),
            videoId,
            timestamp: capturedTimestamp,
            ...draft,
            createdAt: Date.now(),
          }
          set((s) => ({ annotations: [...s.annotations, annotation] }))
          get().announce(`Annotation saved. ${get().annotations.length} total.`)
        }
        get().clearDraft()
      },

      beginEditAnnotation: (id) => {
        const a = get().annotations.find((x) => x.id === id)
        if (!a) return
        set({
          editingAnnotationId: id,
          capturedTimestamp: a.timestamp,
          timestampLocked: true,
          draft: {
            observationText: a.observationText,
            openCodes: [...a.openCodes],
            analyticalMemo: a.analyticalMemo,
          },
        })
      },
      cancelEdit: () => get().clearDraft(),

      deleteAnnotation: (id) => {
        const a = get().annotations.find((x) => x.id === id)
        set((s) => ({ annotations: s.annotations.filter((x) => x.id !== id) }))
        // Drop the removed annotation's now-orphaned codes from categories only
        // if they no longer appear anywhere.
        if (a) {
          const stillPresent = new Set(
            get().annotations.flatMap((x) => x.openCodes)
          )
          set((s) => ({
            categories: s.categories.map((c) => ({
              ...c,
              openCodes: c.openCodes.filter((code) => stillPresent.has(code)),
            })),
          }))
        }
        if (get().editingAnnotationId === id) get().clearDraft()
        get().announce('Annotation deleted.')
      },

      // ── Derived helpers ────────────────────────────────────────────────
      getCodeStats: () => {
        const map = new Map<string, CodeStat>()
        get().annotations.forEach((a) => {
          a.openCodes.forEach((code) => {
            const existing = map.get(code)
            if (existing) {
              existing.count += 1
              existing.annotationIds.push(a.id)
            } else {
              map.set(code, { code, count: 1, annotationIds: [a.id] })
            }
          })
        })
        return [...map.values()].sort(
          (a, b) => b.count - a.count || a.code.localeCompare(b.code)
        )
      },
      getAssignedCodes: () => {
        const set2 = new Set<string>()
        get().categories.forEach((c) => c.openCodes.forEach((code) => set2.add(code)))
        return set2
      },

      // ── Stage 2: categories ────────────────────────────────────────────
      categories: [],
      addCategory: (label) => {
        const id = generateId()
        const clean = label.trim() || 'New category'
        set((s) => ({
          categories: [
            ...s.categories,
            { id, label: clean, memo: '', openCodes: [], createdAt: Date.now() },
          ],
        }))
        get().announce(`Category "${clean}" created.`)
        return id
      },
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          themes: s.themes.map((t) => ({
            ...t,
            categoryIds: t.categoryIds.filter((cid) => cid !== id),
          })),
          codebookRows: s.codebookRows.filter(
            (r) => !(r.origin === 'category' && r.sourceId === id)
          ),
        })),
      assignCodeToCategory: (categoryId, code) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId && !c.openCodes.includes(code)
              ? { ...c, openCodes: [...c.openCodes, code] }
              : c
          ),
        })),
      unassignCodeFromCategory: (categoryId, code) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, openCodes: c.openCodes.filter((x) => x !== code) }
              : c
          ),
        })),

      // ── Stage 2: themes ────────────────────────────────────────────────
      themes: [],
      addTheme: (label) => {
        const id = generateId()
        const clean = label.trim() || 'New theme'
        set((s) => ({
          themes: [
            ...s.themes,
            { id, label: clean, memo: '', categoryIds: [], createdAt: Date.now() },
          ],
        }))
        get().announce(`Theme "${clean}" created.`)
        return id
      },
      updateTheme: (id, patch) =>
        set((s) => ({
          themes: s.themes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTheme: (id) =>
        set((s) => ({
          themes: s.themes.filter((t) => t.id !== id),
          codebookRows: s.codebookRows.filter(
            (r) => !(r.origin === 'theme' && r.sourceId === id)
          ),
        })),
      toggleCategoryInTheme: (themeId, categoryId) =>
        set((s) => ({
          themes: s.themes.map((t) => {
            if (t.id !== themeId) return t
            const has = t.categoryIds.includes(categoryId)
            return {
              ...t,
              categoryIds: has
                ? t.categoryIds.filter((c) => c !== categoryId)
                : [...t.categoryIds, categoryId],
            }
          }),
        })),

      // ── Stage 3: codebook ──────────────────────────────────────────────
      codebookRows: [],
      seedCodebook: () => {
        const { categories, themes, codebookRows } = get()
        // Preserve any row the student has already edited: match by sourceId.
        const existingBySource = new Map(
          codebookRows.filter((r) => r.sourceId).map((r) => [r.sourceId as string, r])
        )
        const manualRows = codebookRows.filter((r) => r.origin === 'manual')

        const themeRows: CodebookRow[] = themes.map((t) => {
          const existing = existingBySource.get(t.id)
          if (existing) return existing
          return {
            id: generateId(),
            origin: 'theme',
            sourceId: t.id,
            variableName: sanitizeVariableName(t.label),
            variableLabel: t.label,
            variableType: 'ordinal',
            definitionText: t.memo,
            inclusionRules: '',
            exclusionRules: '',
            valuesScale: scaleTemplateFor('ordinal'),
            anchorExample: '',
            anchorVideoId: null,
            anchorTimestamp: null,
          }
        })

        const categoryRows: CodebookRow[] = categories.map((c) => {
          const existing = existingBySource.get(c.id)
          if (existing) return existing
          return {
            id: generateId(),
            origin: 'category',
            sourceId: c.id,
            variableName: sanitizeVariableName(c.label),
            variableLabel: c.label,
            variableType: 'binary',
            definitionText: c.memo,
            inclusionRules: c.openCodes.length
              ? `Coded present when the segment reflects any of: ${c.openCodes.join(', ')}.`
              : '',
            exclusionRules: '',
            valuesScale: scaleTemplateFor('binary'),
            anchorExample: '',
            anchorVideoId: null,
            anchorTimestamp: null,
          }
        })

        const rows = [...themeRows, ...categoryRows, ...manualRows]
        set({ codebookRows: rows })
        get().announce(
          `${themeRows.length + categoryRows.length} variable${
            themeRows.length + categoryRows.length !== 1 ? 's' : ''
          } seeded from your themes and categories.`
        )
      },
      addManualRow: () =>
        set((s) => ({
          codebookRows: [
            ...s.codebookRows,
            {
              id: generateId(),
              origin: 'manual',
              sourceId: null,
              variableName: '',
              variableLabel: '',
              variableType: 'binary',
              definitionText: '',
              inclusionRules: '',
              exclusionRules: '',
              valuesScale: scaleTemplateFor('binary'),
              anchorExample: '',
              anchorVideoId: null,
              anchorTimestamp: null,
            },
          ],
        })),
      updateCodebookRow: (id, patch) =>
        set((s) => ({
          codebookRows: s.codebookRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      setVariableType: (id, type) =>
        set((s) => ({
          codebookRows: s.codebookRows.map((r) => {
            if (r.id !== id) return r
            // Only overwrite the scale if it's still an untouched template.
            const templates = VARIABLE_TYPES.map((t) => t.scaleTemplate)
            const isTemplate = templates.includes(r.valuesScale) || r.valuesScale.trim() === ''
            return {
              ...r,
              variableType: type,
              valuesScale: isTemplate ? scaleTemplateFor(type) : r.valuesScale,
            }
          }),
        })),
      deleteCodebookRow: (id) =>
        set((s) => ({ codebookRows: s.codebookRows.filter((r) => r.id !== id) })),

      // ── Project I/O ────────────────────────────────────────────────────
      loadProject: (project) =>
        set({
          videoUrl: project.videoUrl ?? '',
          videoId: project.videoId ?? null,
          annotations: project.annotations ?? [],
          categories: project.categories ?? [],
          themes: project.themes ?? [],
          codebookRows: project.codebookRows ?? [],
          draft: { ...emptyDraft },
          editingAnnotationId: null,
          capturedTimestamp: 0,
          timestampLocked: false,
        }),
      resetAll: () =>
        set({
          videoUrl: '',
          videoId: null,
          capturedTimestamp: 0,
          timestampLocked: false,
          draft: { ...emptyDraft },
          editingAnnotationId: null,
          annotations: [],
          categories: [],
          themes: [],
          codebookRows: [],
          activeStage: 'stage1',
        }),

      // ── Accessibility announcements ────────────────────────────────────
      announcement: '',
      announce: (message) => {
        set({ announcement: message })
        setTimeout(() => set({ announcement: '' }), 2500)
      },
    }),
    {
      name: 'methodosync-v2',
      partialize: (s) => ({
        activeStage: s.activeStage,
        videoUrl: s.videoUrl,
        videoId: s.videoId,
        draft: s.draft,
        annotations: s.annotations,
        categories: s.categories,
        themes: s.themes,
        codebookRows: s.codebookRows,
      }),
    }
  )
)
