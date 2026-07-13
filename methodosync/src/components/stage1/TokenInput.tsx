import { useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { X } from 'lucide-react'

interface TokenInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  inputValue: string
  onInputChange: (value: string) => void
  id?: string
}

/** A chip/token field for open codes. Enter or comma commits; Backspace on an
    empty field removes the last chip; paste splits on commas/newlines. */
export function TokenInput({ tags, onChange, inputValue, onInputChange, id }: TokenInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function commitTag(raw: string) {
    const trimmed = raw.trim().replace(/,+$/, '').trim()
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
    onInputChange('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '') {
      onChange(tags.slice(0, -1))
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const newTags = e.clipboardData
      .getData('text')
      .split(/[,\n]+/)
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t))
    if (newTags.length) onChange([...tags, ...newTags])
  }

  return (
    <div
      role="group"
      aria-label="Open codes"
      className="flex min-h-[44px] cursor-text flex-wrap gap-1.5 rounded-lg p-2.5"
      style={{ border: '1.5px solid var(--line)', background: 'var(--card)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} className="pill-tag">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)) }}
            aria-label={`Remove open code: ${tag}`}
            className="rounded-full p-0.5 transition-opacity hover:opacity-60"
          >
            <X size={10} aria-hidden="true" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => { if (inputValue.trim()) commitTag(inputValue) }}
        placeholder={tags.length === 0 ? 'Type a code, press Enter or comma…' : ''}
        aria-describedby="token-hint"
        className="min-w-[140px] flex-1 bg-transparent py-0.5 font-mono text-sm outline-none"
        style={{ color: 'var(--ink)' }}
      />
      <p id="token-hint" className="sr-only">
        Press Enter or comma to add a code. Press Backspace on an empty field to remove the last code.
      </p>
    </div>
  )
}
