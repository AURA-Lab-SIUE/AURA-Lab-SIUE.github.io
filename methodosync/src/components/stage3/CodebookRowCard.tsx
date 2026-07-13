import { Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { CodebookRow, VariableType } from '../../types/annotation'
import { VARIABLE_TYPES } from '../../types/annotation'
import { sanitizeVariableName } from '../../lib/sanitize'
import { formatTimestamp, youtubeDeepLink } from '../../lib/time'

const ORIGIN_LABEL: Record<CodebookRow['origin'], string> = {
  theme: 'From theme',
  category: 'From category',
  manual: 'Added manually',
}

export function CodebookRowCard({ row, index }: { row: CodebookRow; index: number }) {
  const annotations = useAppStore((s) => s.annotations)
  const update = useAppStore((s) => s.updateCodebookRow)
  const setVariableType = useAppStore((s) => s.setVariableType)
  const remove = useAppStore((s) => s.deleteCodebookRow)

  const typeHint = VARIABLE_TYPES.find((t) => t.value === row.variableType)?.hint

  function pickAnchor(annotationId: string) {
    const a = annotations.find((x) => x.id === annotationId)
    if (!a) return
    update(row.id, {
      anchorVideoId: a.videoId,
      anchorTimestamp: a.timestamp,
      anchorExample: row.anchorExample.trim() || a.observationText.trim(),
    })
  }

  return (
    <div className="card card-pad flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="figtag">V{index + 1}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-soft">
            {ORIGIN_LABEL[row.origin]}
          </span>
          <button onClick={() => remove(row.id)} className="btn-ghost" aria-label="Delete variable">
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`vname-${row.id}`}>Variable name</label>
          <input
            id={`vname-${row.id}`}
            value={row.variableName}
            onChange={(e) => update(row.id, { variableName: e.target.value })}
            onBlur={(e) => update(row.id, { variableName: sanitizeVariableName(e.target.value) })}
            placeholder="e.g. affect_display"
            className="field-input font-mono"
          />
          <p className="mt-1 text-xs text-ink-soft">Lowercase, no spaces — safe for SPSS/R.</p>
        </div>
        <div>
          <label className="field-label" htmlFor={`vlabel-${row.id}`}>Variable label</label>
          <input
            id={`vlabel-${row.id}`}
            value={row.variableLabel}
            onChange={(e) => update(row.id, { variableLabel: e.target.value })}
            placeholder="Human-readable name"
            className="field-input"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`vtype-${row.id}`}>Measurement type</label>
          <select
            id={`vtype-${row.id}`}
            value={row.variableType}
            onChange={(e) => setVariableType(row.id, e.target.value as VariableType)}
            className="field-input"
          >
            {VARIABLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {typeHint && <p className="mt-1 text-xs text-ink-soft">{typeHint}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor={`vscale-${row.id}`}>Values / scale</label>
          <textarea
            id={`vscale-${row.id}`}
            value={row.valuesScale}
            onChange={(e) => update(row.id, { valuesScale: e.target.value })}
            rows={4}
            className="field-input resize-y font-mono text-xs"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor={`vdef-${row.id}`}>Definition</label>
        <textarea
          id={`vdef-${row.id}`}
          value={row.definitionText}
          onChange={(e) => update(row.id, { definitionText: e.target.value })}
          rows={2}
          placeholder="What this variable measures, conceptually…"
          className="field-input resize-y text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`vinc-${row.id}`}>Coding rules — include when</label>
          <textarea
            id={`vinc-${row.id}`}
            value={row.inclusionRules}
            onChange={(e) => update(row.id, { inclusionRules: e.target.value })}
            rows={3}
            className="field-input resize-y text-sm"
          />
        </div>
        <div>
          <label className="field-label" htmlFor={`vexc-${row.id}`}>Coding rules — exclude when</label>
          <textarea
            id={`vexc-${row.id}`}
            value={row.exclusionRules}
            onChange={(e) => update(row.id, { exclusionRules: e.target.value })}
            rows={3}
            className="field-input resize-y text-sm"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor={`vanchor-${row.id}`}>Anchor example</label>
        <textarea
          id={`vanchor-${row.id}`}
          value={row.anchorExample}
          onChange={(e) => update(row.id, { anchorExample: e.target.value })}
          rows={2}
          placeholder="A clear real example from your data…"
          className="field-input resize-y text-sm"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {annotations.length > 0 && (
            <>
              <label className="sr-only" htmlFor={`vpick-${row.id}`}>Pick an anchor from your annotations</label>
              <select
                id={`vpick-${row.id}`}
                value=""
                onChange={(e) => { pickAnchor(e.target.value); e.target.value = '' }}
                className="field-input py-1.5 text-xs"
                style={{ width: 'auto', minWidth: 200 }}
              >
                <option value="">Link a coded moment…</option>
                {[...annotations]
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatTimestamp(a.timestamp)} — {a.observationText.slice(0, 40) || a.openCodes.join(', ')}
                    </option>
                  ))}
              </select>
            </>
          )}
          {row.anchorVideoId && row.anchorTimestamp != null && (
            <a
              href={youtubeDeepLink(row.anchorVideoId, row.anchorTimestamp)}
              target="_blank"
              rel="noreferrer"
              className="link-underline font-mono text-xs"
              style={{ color: 'var(--brick)' }}
            >
              ▸ linked to {formatTimestamp(row.anchorTimestamp)} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
