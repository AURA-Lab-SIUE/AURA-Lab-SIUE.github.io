import { useRef, useState } from 'react'
import { Plus, Upload, Star, AlertCircle, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { parseBibliography } from '../../lib/bibImport'
import { citeLabel, METHODS, type Source } from '../../types/source'
import { sourceState, partition, STATE_LABEL } from '../../lib/sourceState'
import { SourceForm } from './SourceForm'

function ImportDropzone() {
  const store = useAppStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')

  async function handle(file: File) {
    setError('')
    try {
      const refs = parseBibliography(await file.text())
      const added = store.addImported(refs, { kind: 'other', ref: null })
      if (added === 0) {
        setError(`Parsed ${refs.length} reference${refs.length === 1 ? '' : 's'}, but you already have all of them.`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.')
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) void handle(f)
        }}
        className="rounded-lg text-center px-4 py-6 transition-colors"
        style={{
          border: `1.5px dashed ${over ? 'var(--brick)' : 'var(--line)'}`,
          background: over ? 'var(--brick-wash)' : 'transparent',
        }}
      >
        <Upload size={20} aria-hidden className="mx-auto mb-2" style={{ color: 'var(--brick-text)' }} />
        <p className="text-sm mb-1">Drop a Zotero export here</p>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
          CSL JSON, BibTeX, or RIS. In Zotero: right-click a collection, Export Collection.
          The file is read in your browser and never uploaded.
        </p>
        <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
          Choose a file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.bib,.bibtex,.ris,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handle(f)
            e.target.value = ''
          }}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs inline-flex items-start gap-1.5" style={{ color: 'var(--brick-text)' }}>
          <AlertCircle size={13} aria-hidden className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

function SourceRow({ s }: { s: Source }) {
  const store = useAppStore()
  const state = sourceState(s)
  const done = state === 'kept'
  const method = METHODS.find((m) => m.value === s.method)?.label
  // How much of the eight is actually filled, so "not finished" stops meaning
  // both "untouched" and "one field short".
  const filled = [
    s.foundVia.kind !== 'other' && (!['search', 'backward', 'forward'].includes(s.foundVia.kind) || s.foundVia.ref),
    s.population.trim(), s.context.trim(), s.theory.trim(), s.method,
    s.finding.trim(), s.constructX.trim() || s.direction, s.citedFoundational.length > 0,
  ].filter(Boolean).length
  return (
    <li>
      <button
        onClick={() => store.setEditing(s.id)}
        className="w-full text-left rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--brick-wash)]"
        style={{ border: '1px solid var(--line)', opacity: state === 'aside' ? 0.55 : 1 }}
      >
        <div className="flex items-start gap-2">
          <span className="font-mono text-[0.65rem] mt-1 shrink-0" style={{ color: 'var(--ink-soft)' }}>
            {String(s.examinedAt).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans font-semibold text-sm">{citeLabel(s)}</span>
              {s.keystone && <Star size={12} aria-hidden fill="currentColor" style={{ color: 'var(--brick-text)' }} />}
              {state === 'aside' && <span className="pill-muted">{STATE_LABEL.aside}</span>}
            </span>
            <span className="block text-xs truncate" style={{ color: 'var(--ink-soft)' }}>
              {s.title || 'Untitled'}
            </span>
            <span className="block text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              {done
                ? [method, s.population].filter(Boolean).join(' · ')
                : state === 'aside'
                  ? s.notes.trim() || 'Read and rejected'
                  : `${filled} of 8 answered`}
            </span>
          </span>
          <span className="shrink-0 mt-1">
            {done
              ? <Check size={14} aria-hidden style={{ color: 'var(--brick-text)' }} />
              : <AlertCircle size={14} aria-hidden style={{ color: 'var(--ink-soft)' }} />}
          </span>
        </div>
      </button>
    </li>
  )
}

export function SourcesPanel() {
  const store = useAppStore()
  const sources = [...store.sources].sort((a, b) => a.examinedAt - b.examinedAt)
  const editing = sources.find((s) => s.id === store.editingId) ?? null
  const { kept, aside, pile } = partition(sources)

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
      <div className="space-y-4">
        <section className="card card-pad">
          <h2 className="seclabel mb-4">Add sources</h2>
          <ImportDropzone />
          <button className="btn-primary w-full mt-3" onClick={() => store.addBlankSource()}>
            <Plus size={15} aria-hidden /> Add one by hand
          </button>
        </section>

        <section className="card card-pad">
          <h2 className="seclabel mb-4">
            Reading list ({kept.length} logged, {aside.length} set aside, {pile.length} unread)
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
              Nothing here yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {sources.map((s) => <SourceRow key={s.id} s={s} />)}
            </ul>
          )}
        </section>
      </div>

      <div>
        {editing ? (
          <SourceForm source={editing} />
        ) : (
          <section className="card card-pad">
            <h2 className="seclabel mb-4">The eight questions</h2>
            <p className="text-sm max-w-measure mb-4">
              Pick a source from the list, or add one. Every source gets the same eight
              questions, which is the point: the answers only become useful when they are
              answered the same way each time, so the columns can be compared.
            </p>
            <ol className="text-sm space-y-1.5 list-decimal pl-5" style={{ color: 'var(--ink-soft)' }}>
              <li>How did you find it?</li>
              <li>Who or what was studied?</li>
              <li>In what context?</li>
              <li>What theory did they use?</li>
              <li>What method?</li>
              <li>What did they find, in one sentence?</li>
              <li>What relationship did they report, and in which direction?</li>
              <li>Which works does it keep citing?</li>
            </ol>
            <p className="text-sm max-w-measure mt-4" style={{ color: 'var(--ink-soft)' }}>
              About five minutes a paper once the citation is imported. Three papers in, you
              get a literature review.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
