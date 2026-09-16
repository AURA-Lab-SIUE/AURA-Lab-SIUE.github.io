// The eight questions, asked of every source in the same order.
//
// The hints under each field say what the field is FOR, because a student who
// knows a field feeds the gap detector fills it differently from a student who
// thinks it is bookkeeping.

import { useState } from 'react'
import { Check, Star, Trash2, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { METHODS, DIRECTIONS, citeLabel, type Source } from '../../types/source'
import { isComplete, needsRef as needsRefFor } from '../../lib/sourceState'
import { TheoryPicker } from '../design/TheoryPicker'

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
      {children}
    </p>
  )
}

export function SourceForm({ source }: { source: Source }) {
  const store = useAppStore()
  const s = source
  const set = (patch: Partial<Source>) => store.updateSource(s.id, patch)
  const [citedDraft, setCitedDraft] = useState('')

  const otherSources = store.sources.filter((o) => o.id !== s.id)
  const complete = isComplete(s)
  const needsRef = needsRefFor(s)

  function addCited() {
    const v = citedDraft.trim()
    if (!v) return
    if (!s.citedFoundational.some((c) => c.toLowerCase() === v.toLowerCase())) {
      set({ citedFoundational: [...s.citedFoundational, v] })
    }
    setCitedDraft('')
  }

  return (
    <section className="card card-pad">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="seclabel mb-2">Source {s.examinedAt}</div>
          <h3 className="font-display font-extrabold text-lg tracking-display truncate">
            {s.title || citeLabel(s)}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="btn-ghost"
            onClick={() => set({ keystone: !s.keystone })}
            aria-pressed={s.keystone}
            title="A keystone is a source central enough to chain forward and backward from."
          >
            <Star size={14} aria-hidden fill={s.keystone ? 'currentColor' : 'none'} />
            {s.keystone ? 'Keystone' : 'Mark keystone'}
          </button>
          <button className="btn-ghost" onClick={() => store.setEditing(null)} aria-label="Close this source">
            <X size={15} aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── bibliographic ── */}
        <details className="rounded-lg" style={{ background: 'var(--paper)' }} open={!s.title}>
          <summary className="cursor-pointer px-3 py-2 text-xs font-sans font-bold uppercase tracking-ui"
            style={{ color: 'var(--ink-soft)' }}>
            Citation details
          </summary>
          <div className="p-3 pt-1 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor={`t-${s.id}`}>Title</label>
              <input id={`t-${s.id}`} className="field-input" value={s.title}
                onChange={(e) => set({ title: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor={`a-${s.id}`}>Authors (family names, comma separated)</label>
              <input id={`a-${s.id}`} className="field-input" value={s.authors.join(', ')}
                onChange={(e) => set({ authors: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
            </div>
            <div>
              <label className="field-label" htmlFor={`y-${s.id}`}>Year</label>
              <input id={`y-${s.id}`} className="field-input" value={s.year}
                onChange={(e) => set({ year: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor={`c-${s.id}`}>Journal or publisher</label>
              <input id={`c-${s.id}`} className="field-input" value={s.container}
                onChange={(e) => set({ container: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor={`d-${s.id}`}>DOI or URL</label>
              <input id={`d-${s.id}`} className="field-input" value={s.doi || s.url}
                onChange={(e) => set({ doi: e.target.value })} />
            </div>
          </div>
        </details>

        {/* ── 1. how you found it ── */}
        <div>
          <label className="field-label" htmlFor={`fv-${s.id}`}>1. How did you find this?</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              id={`fv-${s.id}`}
              className="field-input"
              value={s.foundVia.kind}
              onChange={(e) => {
                const kind = e.target.value as Source['foundVia']['kind']
                // With exactly one search logged there is nothing to choose, so
                // choose it. Leaving it null would silently make that search
                // look like it yielded nothing.
                const ref = kind === 'search' && store.searches.length === 1 ? store.searches[0].id : null
                set({ foundVia: { kind, ref } })
              }}
            >
              <option value="search">A logged search</option>
              <option value="backward">Backward chaining (cited BY another source)</option>
              <option value="forward">Forward chaining (cites another source)</option>
              <option value="assigned">Assigned or recommended</option>
              <option value="other">Other</option>
            </select>
            {s.foundVia.kind === 'search' && (
              <select className="field-input" value={s.foundVia.ref ?? ''}
                style={s.foundVia.ref ? undefined : { borderColor: 'var(--brick)' }}
                onChange={(e) => set({ foundVia: { kind: 'search', ref: e.target.value || null } })}>
                <option value="">Which search?</option>
                {store.searches.map((q) => (
                  <option key={q.id} value={q.id}>{q.date} · {q.database}</option>
                ))}
              </select>
            )}
            {(s.foundVia.kind === 'backward' || s.foundVia.kind === 'forward') && (
              <select className="field-input" value={s.foundVia.ref ?? ''}
                style={s.foundVia.ref ? undefined : { borderColor: 'var(--brick)' }}
                onChange={(e) => set({ foundVia: { kind: s.foundVia.kind, ref: e.target.value || null } })}>
                <option value="">From which source?</option>
                {otherSources.map((o) => (
                  <option key={o.id} value={o.id}>{citeLabel(o)}</option>
                ))}
              </select>
            )}
          </div>
          <Hint>
            Searches that stop producing anything new are one of the three saturation signs,
            so this is the field that tells the tool whether your reading has run dry.
          </Hint>
        </div>

        {/* ── 2 & 3. population and context ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor={`p-${s.id}`}>2. Who or what was studied?</label>
            <input id={`p-${s.id}`} className="field-input" value={s.population}
              onChange={(e) => set({ population: e.target.value })}
              placeholder="Twitch viewers aged 18–35" />
            <Hint>Every source naming the same population is a topical void waiting to be named.</Hint>
          </div>
          <div>
            <label className="field-label" htmlFor={`x-${s.id}`}>3. In what context?</label>
            <input id={`x-${s.id}`} className="field-input" value={s.context}
              onChange={(e) => set({ context: e.target.value })}
              placeholder="Twitch, gaming channels" />
            <Hint>Platform, medium, country, setting. Whatever bounds the study.</Hint>
          </div>
        </div>

        {/* ── 4 & 5. theory and method ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">4. What theory did they use?</label>
            <TheoryPicker
              value={s.theory}
              onChange={(v) => set({ theory: v })}
              placeholder="Search 55 theories, type one, or leave blank"
            />
            <Hint>
              Leave it blank if none was named, which is itself worth knowing. Unsure what a
              named theory is?{' '}
              <a className="link-underline" style={{ color: 'var(--brick)' }}
                href="https://aura-lab.siue.edu/theories/" target="_blank" rel="noreferrer">
                Look it up in the theory explorer
              </a>.
            </Hint>
          </div>
          <div>
            <label className="field-label" htmlFor={`m-${s.id}`}>5. What method?</label>
            <select id={`m-${s.id}`} className="field-input" value={s.method}
              onChange={(e) => set({ method: e.target.value as Source['method'] })}>
              <option value="">Choose one</option>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <Hint>A literature that is all one method is a methodological gap, and this is the column that shows it.</Hint>
          </div>
        </div>

        {/* ── 6. the finding ── */}
        <div>
          <label className="field-label" htmlFor={`f-${s.id}`}>6. What did they find? One sentence.</label>
          <textarea id={`f-${s.id}`} className="field-input" rows={2} value={s.finding}
            onChange={(e) => set({ finding: e.target.value })}
            placeholder="social and tension-release motivations were central to why people watched" />
          <Hint>
            Write it as a bare claim with no citation, starting in lower case unless it starts
            with a name, so it reads on from "found that". This exact sentence becomes part of
            your first literature review, with the citation attached for you.
          </Hint>
        </div>

        {/* ── 7. the relationship ── */}
        <div>
          <label className="field-label">7. What relationship did they report?</label>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
            <input className="field-input" value={s.constructX}
              onChange={(e) => set({ constructX: e.target.value })} placeholder="X: social motivation"
              aria-label="Construct X" />
            <input className="field-input" value={s.constructY}
              onChange={(e) => set({ constructY: e.target.value })} placeholder="Y: chat engagement"
              aria-label="Construct Y" />
            <select className="field-input" value={s.direction}
              onChange={(e) => set({ direction: e.target.value as Source['direction'] })}
              aria-label="Direction">
              <option value="">Direction</option>
              {DIRECTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <Hint>
            Two sources reporting opposite directions on the same pair is a contradiction, and a
            contradiction is an opening. The tool can only find one if the direction is a field
            rather than a sentence.
          </Hint>
        </div>

        {/* ── 8. what it cites ── */}
        <div>
          <label className="field-label" htmlFor={`cf-${s.id}`}>
            8. Which works does it keep citing?
          </label>
          <div className="flex gap-2">
            <input
              id={`cf-${s.id}`}
              className="field-input"
              value={citedDraft}
              onChange={(e) => setCitedDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCited() } }}
              placeholder="Horton & Wohl 1956"
            />
            <button type="button" className="btn-secondary shrink-0" onClick={addCited}>Add</button>
          </div>
          {s.citedFoundational.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {s.citedFoundational.map((c) => (
                <li key={c}>
                  <button className="pill-tag" onClick={() => set({ citedFoundational: s.citedFoundational.filter((x) => x !== c) })}
                    aria-label={`Remove ${c}`}>
                    {c} <X size={11} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Hint>
            Five or so from its reference list, the ones that look foundational. When new papers
            stop introducing new names here, that is the second saturation sign.
          </Hint>
        </div>

        {/* ── graduate extension ── */}
        <details className="rounded-lg" style={{ background: 'var(--paper)' }}>
          <summary className="cursor-pointer px-3 py-2 text-xs font-sans font-bold uppercase tracking-ui"
            style={{ color: 'var(--ink-soft)' }}>
            Effect size, if reported (graduate)
          </summary>
          <div className="p-3 pt-1 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor={`es-${s.id}`}>Effect size</label>
              <input id={`es-${s.id}`} className="field-input" value={s.effectSize}
                onChange={(e) => set({ effectSize: e.target.value })} placeholder="d = 0.42" />
            </div>
            <div>
              <label className="field-label" htmlFor={`en-${s.id}`}>N</label>
              <input id={`en-${s.id}`} className="field-input" value={s.effectN}
                onChange={(e) => set({ effectN: e.target.value })} placeholder="1,097" />
            </div>
            <p className="sm:col-span-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
              These become the inputs to the power analysis in Chapter 6. A review that cannot
              supply an effect size estimate has not finished its job.
            </p>
          </div>
        </details>

        {/* ── screening ── */}
        <div className="pt-1">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={s.setAside}
              onChange={(e) => set({ setAside: e.target.checked })} />
            Examined, but set aside as not relevant
          </label>
          <Hint>
            Keep it. Sources you screened out still count as examined, and that is what makes the
            saturation curve honest rather than flattering.
          </Hint>
          {s.setAside && (
            <div className="mt-3">
              <label className="field-label" htmlFor={`n-${s.id}`}>Why?</label>
              <input id={`n-${s.id}`} className="field-input" value={s.notes}
                onChange={(e) => set({ notes: e.target.value })} placeholder="different medium, no empirical data" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--line)' }}>
        <span className="inline-flex items-center gap-2 text-sm" style={{ color: complete ? 'var(--brick)' : 'var(--ink-soft)' }}>
          {complete ? <Check size={15} aria-hidden /> : null}
          {complete
            ? 'Logged'
            : needsRef && !s.foundVia.ref
              ? 'Needs to say which search or source it came from'
              : 'Needs population, method, and the one-sentence finding'}
        </span>
        <div className="flex items-center gap-2">
          <button className="btn-ghost"
            onClick={() => { if (confirm('Delete this source?')) store.removeSource(s.id) }}>
            <Trash2 size={14} aria-hidden /> Delete
          </button>
          <button className="btn-primary" onClick={() => store.setEditing(null)}>Done</button>
        </div>
      </div>
    </section>
  )
}
