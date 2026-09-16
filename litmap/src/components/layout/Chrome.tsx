import { useEffect, useRef, useState } from 'react'
import { BookOpen, FilePlus2, FolderOpen, Save, Sun, Moon } from 'lucide-react'
import { useAppStore, type Stage } from '../../store/useAppStore'
import { exportProject, parseProject } from '../../lib/projectIO'

// ── polite live region ────────────────────────────────────────────────

export function LiveRegion() {
  const announcement = useAppStore((s) => s.announcement)
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {announcement}
    </div>
  )
}

// ── theme toggle, matching the site's localStorage key ────────────────

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch { /* private mode */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch { /* private mode */ }
  }, [theme])

  return (
    <button
      className="btn-ghost"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? <Sun size={15} aria-hidden /> : <Moon size={15} aria-hidden />}
    </button>
  )
}

// ── header + project bar ──────────────────────────────────────────────

export function AppHeader() {
  const fileRef = useRef<HTMLInputElement>(null)
  const store = useAppStore()
  // Shown in the bar rather than through alert(): a modal blocks the page, and
  // a failed file open is something to read, not something to acknowledge.
  const [error, setError] = useState('')

  function save() {
    exportProject(
      {
        projectTitle: store.projectTitle,
        topic: store.topic,
        searches: store.searches,
        sources: store.sources,
        reviewSourceIds: store.reviewSourceIds,
        gapSentence: store.gapSentence,
        predictableAbstracts: store.predictableAbstracts,
        chosenGapId: store.chosenGapId,
        gapClauses: store.gapClauses,
        question: store.question,
        feasibility: store.feasibility,
        chosenTheory: store.chosenTheory,
        access: store.access,
        chosenMethod: store.chosenMethod,
      },
      store.passthrough
    )
    store.announce('Project saved to your downloads.')
  }

  async function open(file: File) {
    setError('')
    try {
      const p = parseProject(await file.text())
      const lit = p.literature
      store.loadProject({
        projectTitle: lit.projectTitle,
        topic: lit.topic,
        searches: lit.searches,
        sources: lit.sources,
        reviewSourceIds: lit.reviewSourceIds,
        gapSentence: lit.gapSentence,
        predictableAbstracts: lit.predictableAbstracts,
        chosenGapId: lit.chosenGapId ?? null,
        gapClauses: lit.gapClauses ?? {},
        question: lit.question,
        feasibility: lit.feasibility,
        chosenTheory: lit.chosenTheory,
        access: lit.access,
        chosenMethod: lit.chosenMethod,
        passthrough: {
          videoUrl: p.videoUrl,
          videoId: p.videoId,
          annotations: p.annotations,
          categories: p.categories,
          themes: p.themes,
          codebookRows: p.codebookRows,
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not open that file.'
      setError(msg)
      store.announce(msg)
    }
  }

  return (
    <header className="border-b" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-page px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3">
          <span className="inline-flex items-center gap-2">
            <BookOpen size={18} aria-hidden style={{ color: 'var(--brick)' }} />
            <span className="font-display font-extrabold tracking-display text-lg">LitMap</span>
          </span>
          <span className="text-xs font-sans" style={{ color: 'var(--ink-soft)' }}>
            AURA Lab · SIUE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost"
            onClick={() => {
              if (store.sources.length > 0 && !confirm('Start a new project? Save first if you want to keep this one.')) return
              store.resetProject()
            }}
          >
            <FilePlus2 size={15} aria-hidden /> New
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <FolderOpen size={15} aria-hidden /> Open
          </button>
          <button className="btn-ghost" onClick={save}>
            <Save size={15} aria-hidden /> Save
          </button>
          <ThemeToggle />
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void open(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="mx-auto max-w-page px-4 md:px-6 pb-3 text-sm"
          style={{ color: 'var(--brick)' }}
        >
          {error}
        </div>
      )}
    </header>
  )
}

// ── stage navigation ──────────────────────────────────────────────────

const STAGES: { id: Stage; fig: string; label: string }[] = [
  { id: 1, fig: 'FIG.1', label: 'Search log' },
  { id: 2, fig: 'FIG.2', label: 'Sources' },
  { id: 3, fig: 'FIG.3', label: 'Saturation and first review' },
  { id: 4, fig: 'FIG.4', label: 'The gap' },
  { id: 5, fig: 'FIG.5', label: 'Synthesis and handoff' },
  { id: 6, fig: 'FIG.6', label: 'From gap to question' },
]

export function StageNav() {
  const stage = useAppStore((s) => s.stage)
  const setStage = useAppStore((s) => s.setStage)
  return (
    <nav aria-label="Stages" className="mx-auto max-w-page px-4 md:px-6 pt-5">
      <ul className="flex flex-wrap gap-2">
        {STAGES.map((s) => {
          const active = s.id === stage
          return (
            <li key={s.id}>
              <button
                onClick={() => setStage(s.id)}
                aria-current={active ? 'step' : undefined}
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm transition-colors"
                style={{
                  background: active ? 'var(--brick-wash)' : 'transparent',
                  border: `1px solid ${active ? 'var(--brick)' : 'var(--line)'}`,
                  color: active ? 'var(--brick-deep)' : 'var(--ink-soft)',
                }}
              >
                <span className="font-mono text-[0.65rem] tracking-wider">{s.fig}</span>
                <span className="font-sans font-semibold">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
