// A searchable picker over the lab's own 55 theories, with free text still
// allowed because a source may use something the explorer does not list.
//
// ACCESSIBILITY NOTE. The first version selected options with `onMouseDown` +
// preventDefault, to stop the input's blur firing before the click. That works
// with a mouse and is completely broken with a keyboard: Enter on a focused
// button fires `click`, never `mousedown`, so a keyboard user could reach an
// option and not choose it.
//
// The fix is to stop fighting blur. The whole control shares one blur handler
// that checks `relatedTarget`: if focus moved to something still inside this
// component, nothing closes. That is correct for mouse and keyboard equally,
// and it leaves the options as ordinary buttons with ordinary clicks.
//
// Arrow keys, Enter and Escape are wired up as well, because a combobox that
// can only be operated by tabbing through twelve options is technically
// accessible and practically unusable.

import { useMemo, useRef, useState } from 'react'
import { ExternalLink, Search, X } from 'lucide-react'
import { searchTheories, findTheory, relatedTo, theoryUrl, THEORY_CATEGORIES } from '../../lib/theories'

export function TheoryPicker({
  value,
  onChange,
  showRelated = false,
  placeholder = 'Search 55 theories, or type your own',
  id = 'theory',
}: {
  value: string
  onChange: (v: string) => void
  showRelated?: boolean
  placeholder?: string
  id?: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const root = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchTheories(query, category).slice(0, 12), [query, category])
  const picked = findTheory(value)
  const related = showRelated && picked ? relatedTo(picked.slug) : []
  const listId = `${id}-listbox`

  function choose(name: string) {
    onChange(name)
    setOpen(false)
    setQuery('')
    setActive(-1)
    inputRef.current?.focus()
  }

  /** Close only when focus has genuinely left the whole control. */
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (root.current?.contains(e.relatedTarget as Node | null)) return
    if (query.trim()) onChange(query.trim())
    setOpen(false)
    setActive(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); setActive(0); return }
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => {
        const next = i + step
        if (next < 0) return results.length - 1
        if (next >= results.length) return 0
        return next
      })
      return
    }
    if (e.key === 'Enter') {
      if (open && active >= 0 && results[active]) {
        e.preventDefault()
        choose(results[active].name)
      } else if (query.trim()) {
        e.preventDefault()
        onChange(query.trim())
        setOpen(false)
      }
    }
  }

  return (
    <div ref={root} onBlur={handleBlur}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--ink-soft)' }}
          />
          <input
            ref={inputRef}
            id={id}
            className="field-input pl-9"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 && results[active] ? `${id}-opt-${results[active].slug}` : undefined}
            value={open ? query : value}
            placeholder={placeholder}
            onFocus={() => { setQuery(''); setOpen(true) }}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(-1)
              if (!open) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        {value && (
          <button type="button" className="btn-secondary shrink-0" onClick={() => { onChange(''); setQuery('') }}>
            <X size={13} aria-hidden /> Clear
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5 mb-2" role="group" aria-label="Filter by field">
            <button
              type="button"
              className={category === null ? 'pill-tag' : 'pill-muted'}
              aria-pressed={category === null}
              onClick={() => { setCategory(null); setActive(-1) }}
            >
              all fields
            </button>
            {THEORY_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={category === c ? 'pill-tag' : 'pill-muted'}
                aria-pressed={category === c}
                onClick={() => { setCategory(category === c ? null : c); setActive(-1) }}
              >
                {c.replace(' / Advertising, Marketing and Consumer Behavior', ' / Advertising')}
              </button>
            ))}
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label="Theories"
            className="max-h-64 overflow-auto rounded-lg"
            style={{ border: '1px solid var(--line)', background: 'var(--card)' }}
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                Nothing matches. Whatever you type is kept as it is.
              </li>
            ) : (
              results.map((t, i) => (
                <li key={t.slug} role="option" id={`${id}-opt-${t.slug}`} aria-selected={i === active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="w-full text-left px-3 py-2"
                    style={{ background: i === active ? 'var(--brick-wash)' : 'transparent' }}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(t.name)}
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
          <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
            Arrow keys to move, Enter to choose, Escape to close. Anything you type that matches
            nothing is kept as you typed it.
          </p>
        </div>
      )}

      {picked && !open && (
        <div className="mt-2">
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
            {picked.summary}{' '}
            <a
              className="link-underline inline-flex items-center gap-1"
              style={{ color: 'var(--brick-text)' }}
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
                    <button type="button" className="pill-muted" onClick={() => choose(r.name)}>
                      {r.name}
                    </button>
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
