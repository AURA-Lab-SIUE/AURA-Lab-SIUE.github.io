import { Trash2, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Category } from '../../types/annotation'

export function CategoryCard({ category }: { category: Category }) {
  const updateCategory = useAppStore((s) => s.updateCategory)
  const deleteCategory = useAppStore((s) => s.deleteCategory)
  const unassignCodeFromCategory = useAppStore((s) => s.unassignCodeFromCategory)

  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <input
          value={category.label}
          onChange={(e) => updateCategory(category.id, { label: e.target.value })}
          aria-label="Category name"
          className="field-input font-sans font-semibold"
          style={{ fontSize: '1rem' }}
        />
        <button
          onClick={() => deleteCategory(category.id)}
          className="btn-ghost shrink-0"
          aria-label={`Delete category ${category.label}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      <div>
        <span className="field-label">Codes in this category</span>
        {category.openCodes.length === 0 ? (
          <p className="text-xs text-ink-soft">
            None yet — assign open codes to this category from the bank above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {category.openCodes.map((code) => (
              <span key={code} className="pill-tag">
                {code}
                <button
                  onClick={() => unassignCodeFromCategory(category.id, code)}
                  aria-label={`Remove ${code}`}
                  className="rounded-full p-0.5 hover:opacity-60"
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor={`cat-memo-${category.id}`}>Why these belong together</label>
        <textarea
          id={`cat-memo-${category.id}`}
          value={category.memo}
          onChange={(e) => updateCategory(category.id, { memo: e.target.value })}
          rows={2}
          placeholder="The property that unites these codes — this becomes your variable definition later…"
          className="field-input resize-y text-sm"
        />
      </div>
    </div>
  )
}
