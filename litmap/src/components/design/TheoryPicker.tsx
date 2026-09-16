// A searchable picker over the lab's own 55 theories, with free text still
// allowed because a source may use something the explorer does not list.

import { useMemo, useState } from 'react'
import { ExternalLink, Search, X } from 'lucide-react'
import { searchTheories, findTheory, relatedTo, theoryUrl, THEORY_CATEGORIES } from '../../lib/theories'

export function TheoryPicker({
  value,
  onChange,
  showRelated = false,
  placeholder = 'Search 55 theories, or type your own',
}: {
  value: string
  onChange: (v: string) => void
  showRelated?: boolean
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const results = useMemo(() => searchTheories(query, category).slice(0, 12), [query, category])
  const picked = findTheory(value)
  const related = showRelated && picked ? relatedTo(picked.slug) : []

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--ink-soft)' }}
          />
          <input
            className="field-input pl-9"
            value={open ? query : value}
            placeholder={placeholder}
            onFocus={() => { setQuery(''); setOpen(true) }}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onBlur={() => {
              // A typed value that matches nothing is still a valid answer.
              if (query.trim()) onChange(query.trim())
              setTimeout(() => setOpen(false), 150)
            }}
          />
        </div>
        {value && (
          <button className="btn-secondary shrink-0" onClick={() => { onChange(''); setQuery('') }}>
            <X size={13} aria-hidden /> Clear
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <button
              className={category === null ? 'pill-tag' : 'pill-muted'}
              onMouseDown={(e) => { e.preventDefault(); setCategory(null) }}
            >
              all fields
            </button>
            {THEORY_CATEGORIES.map((c) => (
              <button
                key={c}
                className={category === c ? 'pill-tag' : 'pill-muted'}
                onMouseDown={(e) => { e.preventDefault(); setCategory(category === c ? null : c) }}
              >
                {c.replace(' / Advertising, Marketing and Consumer Behavior', ' / Advertising')}
              </button>
            ))}
          </div>
          <ul
            className="max-h-64 overflow-auto rounded-lg"
            style={{ border: '1px solid var(--line)', background: 'var(--card)' }}
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                Nothing matches. Whatever you type is kept as it is.
              </li>
            ) : (
              results.map((t) => (
                <li key={t.slug}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-[var(--brick-wash)]"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange(t.name)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <span className="block text-sm font-sans font-semibold">
                      {t.name}
                      {t.aka?.[0] ? <span style={{ color: 'var(--ink-soft)' }}> ({t.aka[0]})</span> : null}
                    </span>
                    <span className="block text-xs" style={{ color: 'var(--ink-soft)' }}>{t.summary}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {picked && !open && (
        <div className="mt-2">
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
            {picked.summary}{' '}
            <a
              className="link-underline inline-flex items-center gap-1"
              style={{ color: 'var(--brick)' }}
              href={theoryUrl(picked.slug)}
              target="_blank"
              rel="noreferrer"
            >
              read it in the explorer <ExternalLink size={11} aria-hidden />
            </a>
          </p>
          {related.length > 0 && (
            <div className="mt-2">
              <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>
                A second lens on the same data, which Chapter 5 asks you to try:
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {related.map((r) => (
                  <li key={r.slug}>
                    <button className="pill-muted" onClick={() => onChange(r.name)}>{r.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {value && !picked && !open && (
        <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
          Not one of the 55 in the explorer. Kept as you typed it.
        </p>
      )}
    </div>
  )
}
