import { Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Theme } from '../../types/annotation'

export function ThemeCard({ theme }: { theme: Theme }) {
  const categories = useAppStore((s) => s.categories)
  const updateTheme = useAppStore((s) => s.updateTheme)
  const deleteTheme = useAppStore((s) => s.deleteTheme)
  const toggleCategoryInTheme = useAppStore((s) => s.toggleCategoryInTheme)

  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <input
          value={theme.label}
          onChange={(e) => updateTheme(theme.id, { label: e.target.value })}
          aria-label="Theme name"
          className="field-input font-sans font-semibold"
          style={{ fontSize: '1rem' }}
        />
        <button
          onClick={() => deleteTheme(theme.id)}
          className="btn-ghost shrink-0"
          aria-label={`Delete theme ${theme.label}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      <div>
        <span className="field-label">Categories in this theme</span>
        {categories.length === 0 ? (
          <p className="text-xs text-ink-soft">Create some categories first.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {categories.map((c) => {
              const checked = theme.categoryIds.includes(c.id)
              return (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategoryInTheme(theme.id, c.id)}
                    style={{ accentColor: 'var(--brick)' }}
                  />
                  <span style={{ color: checked ? 'var(--ink)' : 'var(--ink-soft)' }}>{c.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor={`theme-memo-${theme.id}`}>Theme memo</label>
        <textarea
          id={`theme-memo-${theme.id}`}
          value={theme.memo}
          onChange={(e) => updateTheme(theme.id, { memo: e.target.value })}
          rows={2}
          placeholder="What this theme claims about the data, and how it connects to your theory…"
          className="field-input resize-y text-sm"
        />
      </div>
    </div>
  )
}
