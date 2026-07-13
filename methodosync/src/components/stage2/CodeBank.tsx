import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'

/**
 * The bank of every open code the student produced in Stage 1, with how often
 * each appears. Assigning a code to a category is how axial coding happens —
 * unassigned codes are flagged so nothing is silently dropped.
 */
export function CodeBank() {
  const annotations = useAppStore((s) => s.annotations)
  const categories = useAppStore((s) => s.categories)
  const getCodeStats = useAppStore((s) => s.getCodeStats)
  const assignCodeToCategory = useAppStore((s) => s.assignCodeToCategory)
  const unassignCodeFromCategory = useAppStore((s) => s.unassignCodeFromCategory)
  const addCategory = useAppStore((s) => s.addCategory)

  // Recompute whenever annotations change.
  const stats = useMemo(() => getCodeStats(), [annotations, getCodeStats])

  const catsByCode = useMemo(() => {
    const map = new Map<string, { id: string; label: string }[]>()
    categories.forEach((c) =>
      c.openCodes.forEach((code) => {
        const arr = map.get(code) ?? []
        arr.push({ id: c.id, label: c.label })
        map.set(code, arr)
      })
    )
    return map
  }, [categories])

  function handleAssign(code: string, value: string) {
    if (value === '__new__') {
      const label = window.prompt('Name the new category for this code:', code)
      if (label && label.trim()) {
        const id = addCategory(label.trim())
        assignCodeToCategory(id, code)
      }
    } else if (value) {
      assignCodeToCategory(value, code)
    }
  }

  if (stats.length === 0) {
    return (
      <div className="card card-pad">
        <p className="font-serif text-ink-soft">
          No open codes yet. Go back to <strong>Stage 1</strong> and code some moments
          first — every code you create will appear here to be clustered.
        </p>
      </div>
    )
  }

  const unassignedCount = stats.filter((s) => !catsByCode.has(s.code)).length

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <p className="seclabel">Open code bank</p>
        <span className="font-mono text-xs text-ink-soft">
          {stats.length} code{stats.length !== 1 ? 's' : ''}
          {unassignedCount > 0 && <> · {unassignedCount} unassigned</>}
        </span>
      </div>

      <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--line)' }}>
        {stats.map((s) => {
          const assigned = catsByCode.get(s.code) ?? []
          const isUnassigned = assigned.length === 0
          return (
            <li key={s.code} className="flex flex-wrap items-center gap-2 py-2.5">
              <span className={isUnassigned ? 'pill-muted' : 'pill-tag'}>{s.code}</span>
              <span className="font-mono text-xs text-ink-soft" title={`Appears in ${s.count} annotation(s)`}>
                ×{s.count}
              </span>

              {assigned.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--brick-wash)', color: 'var(--brick-deep)' }}>
                  → {c.label}
                  <button
                    onClick={() => unassignCodeFromCategory(c.id, s.code)}
                    aria-label={`Remove ${s.code} from ${c.label}`}
                    className="hover:opacity-60"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="ml-auto">
                <label className="sr-only" htmlFor={`assign-${s.code}`}>Assign {s.code} to a category</label>
                <select
                  id={`assign-${s.code}`}
                  value=""
                  onChange={(e) => { handleAssign(s.code, e.target.value); e.target.value = '' }}
                  className="field-input py-1.5 text-xs"
                  style={{ width: 'auto', minWidth: 160 }}
                >
                  <option value="">Assign to category…</option>
                  {categories
                    .filter((c) => !c.openCodes.includes(s.code))
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  <option value="__new__">＋ New category…</option>
                </select>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
