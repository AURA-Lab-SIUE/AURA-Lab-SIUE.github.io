// The way in for a student who has an interest but not a search.
//
// "I'm interested in Twitch chat" is not a search, and typing it into a
// database returns either nothing or everything. Chapter 4's fix is concept
// blocks: two or three ideas joined by AND, each holding the synonyms scholars
// actually use, joined by OR. This builds that shape and leaves the thinking —
// which concepts, which synonyms — where it belongs.

import { useState } from 'react'
import { Plus, X, CornerDownLeft, Check, AlertCircle } from 'lucide-react'
import { buildSearchString, adviseSearch, type ConceptBlock } from '../../lib/searchString'
import { newId } from '../../utils/id'

const STARTER: ConceptBlock[] = [
  { id: 'c1', label: 'The thing itself', terms: [] },
  { id: 'c2', label: 'What about it', terms: [] },
  { id: 'c3', label: 'Who or where (optional)', terms: [] },
]

const EXAMPLE: Record<string, string> = {
  'The thing itself': 'livestream*, "live streaming", Twitch',
  'What about it': 'motivation*, gratification*, engagement',
  'Who or where (optional)': 'viewer*, audience*, chat',
}

export function ConceptBuilder({ onUse }: { onUse: (query: string) => void }) {
  const [blocks, setBlocks] = useState<ConceptBlock[]>(STARTER)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [used, setUsed] = useState(false)

  const query = buildSearchString(blocks)
  const advice = adviseSearch(blocks)

  function addTerm(id: string) {
    const raw = (drafts[id] ?? '').trim()
    if (!raw) return
    // A student pasting "a, b, c" means three terms, not one.
    const incoming = raw.split(',').map((t) => t.trim()).filter(Boolean)
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === id
          ? { ...b, terms: [...b.terms, ...incoming.filter((t) => !b.terms.includes(t))] }
          : b
      )
    )
    setDrafts((d) => ({ ...d, [id]: '' }))
    setUsed(false)
  }

  function removeTerm(id: string, term: string) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, terms: b.terms.filter((t) => t !== term) } : b)))
    setUsed(false)
  }

  return (
    <section className="card card-pad">
      <div className="seclabel mb-4">No search yet? Build one</div>
      <p className="text-sm max-w-measure mb-2">
        A search is not your interest typed into a box. It is two or three separate ideas, joined
        by AND, each holding the different words scholars use for that idea, joined by OR.
      </p>
      <p className="text-sm max-w-measure mb-5" style={{ color: 'var(--ink-soft)' }}>
        Start with the thing you are curious about, then say what about it you want to know.
        Think of two or three ways each idea might be phrased in a title.
      </p>

      <div className="space-y-4">
        {blocks.map((b, i) => (
          <div key={b.id}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="field-label mb-0" htmlFor={`cb-${b.id}`}>
                {i + 1}. {b.label}
              </label>
              {blocks.length > 2 && (
                <button
                  className="btn-ghost"
                  onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}
                  aria-label={`Remove the block ${b.label}`}
                >
                  <X size={12} aria-hidden /> remove
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                id={`cb-${b.id}`}
                className="field-input"
                value={drafts[b.id] ?? ''}
                placeholder={EXAMPLE[b.label] ?? 'a word, or several separated by commas'}
                onChange={(e) => setDrafts((d) => ({ ...d, [b.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTerm(b.id) }
                }}
              />
              <button type="button" className="btn-secondary shrink-0" onClick={() => addTerm(b.id)}>
                <CornerDownLeft size={13} aria-hidden /> Add
              </button>
            </div>
            {b.terms.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {b.terms.map((t) => (
                  <li key={t}>
                    <button className="pill-tag" onClick={() => removeTerm(b.id, t)} aria-label={`Remove ${t}`}>
                      {t} <X size={11} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {blocks.length < 4 && (
        <button
          className="btn-ghost mt-3"
          onClick={() =>
            setBlocks((bs) => [...bs, { id: newId(), label: 'Another idea', terms: [] }])
          }
        >
          <Plus size={13} aria-hidden /> Add another idea
        </button>
      )}

      {query && (
        <div className="mt-5">
          <div className="seclabel mb-2">Your search string</div>
          <pre
            className="rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-words"
            style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
          >
            {query}
          </pre>
        </div>
      )}

      {advice.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {advice.map((a, i) => (
            <li key={i} className="text-xs inline-flex items-start gap-1.5">
              {a.level === 'warn'
                ? <AlertCircle size={12} aria-hidden className="mt-0.5 shrink-0" style={{ color: 'var(--brick)' }} />
                : <Check size={12} aria-hidden className="mt-0.5 shrink-0" style={{ color: 'var(--ink-soft)' }} />}
              <span style={{ color: a.level === 'warn' ? 'var(--brick)' : 'var(--ink-soft)' }}>{a.text}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn-primary mt-5"
        disabled={!query}
        onClick={() => { onUse(query); setUsed(true) }}
      >
        {used ? <><Check size={14} aria-hidden /> Copied into the log</> : 'Use this in the search log'}
      </button>
      <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
        Paste it into Communication &amp; Mass Media Complete or Google Scholar, then come back and
        record what it returned. If it gives you nothing, drop the third idea. If it gives you
        thousands, add one.
      </p>
    </section>
  )
}
