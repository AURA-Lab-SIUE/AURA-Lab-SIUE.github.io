import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Orientation } from '../layout/Orientation'
import { ConceptBuilder } from './ConceptBuilder'

const DATABASES = [
  'Communication & Mass Media Complete',
  'PsycINFO',
  'Web of Science',
  'Scopus',
  'Google Scholar',
  'Other',
]

const EXAMPLE = `(livestream* OR "live streaming" OR Twitch) AND
(motivation* OR gratification* OR engagement) AND
(viewer* OR audience* OR chat)`

export function SearchLogPanel() {
  const store = useAppStore()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [database, setDatabase] = useState(DATABASES[0])
  const [queryString, setQueryString] = useState('')
  const [limiters, setLimiters] = useState('')
  const [nResults, setNResults] = useState('')
  const [nKept, setNKept] = useState('')

  const searches = [...store.searches].sort((a, b) => b.createdAt - a.createdAt)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!queryString.trim()) return
    store.addSearch({
      date,
      database,
      queryString: queryString.trim(),
      limiters: limiters.trim(),
      nResults: nResults === '' ? null : Number(nResults),
      nKept: nKept === '' ? null : Number(nKept),
    })
    setQueryString('')
    setLimiters('')
    setNResults('')
    setNKept('')
  }

  return (
    <div className="space-y-6">
      <Orientation />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
      <div className="space-y-6">
        <section className="card card-pad">
          <div className="seclabel mb-4">The project</div>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="ptitle">Working title</label>
              <input
                id="ptitle"
                className="field-input"
                value={store.projectTitle}
                onChange={(e) => store.setProjectTitle(e.target.value)}
                placeholder="Chat participation across stream categories"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="ptopic">
                What are you interested in, right now?
              </label>
              <textarea
                id="ptopic"
                className="field-input"
                rows={3}
                value={store.topic}
                onChange={(e) => store.setTopic(e.target.value)}
                placeholder="I am interested in Twitch chat."
              />
              <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                As broad as it honestly is. You will come back and narrow this after
                the reading has done its work, not before.
              </p>
            </div>
          </div>
        </section>

        <ConceptBuilder onUse={(q) => setQueryString(q)} />

        <section className="card card-pad">
          <div className="seclabel mb-4">Log a search</div>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="sdate">Date</label>
                <input id="sdate" type="date" className="field-input" value={date}
                  onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="sdb">Database</label>
                <select id="sdb" className="field-input" value={database}
                  onChange={(e) => setDatabase(e.target.value)}>
                  {DATABASES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="sq">Exact search string</label>
              <textarea
                id="sq"
                className="field-input font-mono text-xs"
                rows={4}
                value={queryString}
                onChange={(e) => setQueryString(e.target.value)}
                placeholder={EXAMPLE}
                required
              />
              <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                Paste what you actually typed, not a description of it. AND narrows,
                OR widens, an asterisk catches word endings (<code className="font-mono">stream*</code>).
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="slim">Limiters</label>
                <input id="slim" className="field-input" value={limiters}
                  onChange={(e) => setLimiters(e.target.value)} placeholder="peer-reviewed, 2015–" />
              </div>
              <div>
                <label className="field-label" htmlFor="snr">Results</label>
                <input id="snr" type="number" min="0" className="field-input" value={nResults}
                  onChange={(e) => setNResults(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="snk">Screened in</label>
                <input id="snk" type="number" min="0" className="field-input" value={nKept}
                  onChange={(e) => setNKept(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={!queryString.trim()}>
              <Plus size={15} aria-hidden /> Log this search
            </button>
          </form>
        </section>
      </div>

      <section className="card card-pad">
        <div className="seclabel mb-4">Searches logged ({searches.length})</div>
        {searches.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            Nothing yet. Build a search on the left, run it in a database, then record
            what it returned here.
            <br /><br />
            The log is what makes saturation measurable later: a curve that flattens after
            two lazy searches is not saturation, and the tool can only tell the difference
            if the searches are written down.
          </p>
        ) : (
          <ul className="space-y-3">
            {searches.map((q) => (
              <li key={q.id} className="pb-3 border-b last:border-0" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-sans font-semibold" style={{ color: 'var(--ink-soft)' }}>
                      {q.date} · {q.database}
                    </div>
                    <pre className="mt-1 text-[0.7rem] font-mono whitespace-pre-wrap break-words">
                      {q.queryString}
                    </pre>
                    <div className="mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>
                      {q.nResults ?? '—'} results, {q.nKept ?? '—'} screened in
                      {q.limiters ? ` · ${q.limiters}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn-ghost shrink-0"
                    onClick={() => store.removeSearch(q.id)}
                    aria-label={`Delete the search from ${q.date}`}
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </div>
  )
}
