import { useRef, useState } from 'react'
import { Save, FolderOpen, RotateCcw, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { exportProject, parseProject } from '../../lib/projectIO'

export function ProjectBar() {
  const store = useAppStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  function handleSave() {
    exportProject({
      videoUrl: store.videoUrl,
      videoId: store.videoId,
      annotations: store.annotations,
      categories: store.categories,
      themes: store.themes,
      codebookRows: store.codebookRows,
    })
    store.announce('Project file downloaded.')
  }

  async function handleOpenFile(file: File) {
    setError('')
    try {
      const text = await file.text()
      const project = parseProject(text)
      store.loadProject(project)
      store.announce('Project loaded.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open that file.')
    }
  }

  function handleReset() {
    const total =
      store.annotations.length + store.categories.length + store.codebookRows.length
    if (total > 0) {
      const ok = window.confirm(
        'Clear everything and start a new project? This cannot be undone. ' +
          'Consider using “Save project” first.'
      )
      if (!ok) return
    }
    store.resetAll()
    store.announce('Started a new project.')
  }

  return (
    <div className="mx-auto max-w-page px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--line)' }}>
        <p className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft">
          <Check size={13} aria-hidden="true" style={{ color: 'var(--brick)' }} />
          Autosaved in this browser
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleSave} className="btn-ghost" title="Download a project file to keep or move to another computer">
            <Save size={14} aria-hidden="true" /> Save project
          </button>
          <button onClick={() => fileInput.current?.click()} className="btn-ghost">
            <FolderOpen size={14} aria-hidden="true" /> Open project
          </button>
          <button onClick={handleReset} className="btn-ghost">
            <RotateCcw size={14} aria-hidden="true" /> New / reset
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleOpenFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="pt-2 text-sm" style={{ color: 'var(--brick-deep)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
