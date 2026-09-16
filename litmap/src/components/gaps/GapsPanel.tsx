import { useMemo } from 'react'
import { AlertTriangle, Check, Info } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { detectGaps, gapParagraph, GAP_KIND_LABEL, MIN_SOURCES_FOR_GAPS, type Gap } from '../../lib/gaps'

function GapCard({ gap, chosen }: { gap: Gap; chosen: boolean }) {
  const store = useAppStore()
  const clause = store.gapClauses[gap.id] ?? ''

  return (
    <li>
      <article
        className="card card-pad"
        style={{ borderColor: chosen ? 'var(--brick)' : 'var(--line)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <span className="figtag">{GAP_KIND_LABEL[gap.kind]}</span>
          <button
            className={chosen ? 'btn-primary' : 'btn-secondary'}
            onClick={() => store.chooseGap(chosen ? null : gap.id)}
          >
            {chosen ? <><Check size={14} aria-hidden /> Building on this</> : 'Build on this one'}
          </button>
        </div>

        <h3 className="font-display font-extrabold text-base tracking-display mb-2">{gap.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{gap.evidence}</p>

        <div
          className="rounded-lg p-4 text-sm leading-relaxed"
          style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
        >
          {gapParagraph(gap, clause)}
          {!clause.trim() && (
            <span style={{ color: 'var(--brick)' }}> [what your study does about it]</span>
          )}
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor={`clause-${gap.id}`}>
            The third clause: what does your study do about it?
          </label>
          <textarea
            id={`clause-${gap.id}`}
            className="field-input"
            rows={2}
            value={clause}
            onChange={(e) => store.setGapClause(gap.id, e.target.value)}
            placeholder="This study examines whether the same pattern appears in behavioural chat-log data."
          />
          <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
            The first two sentences are assembled from your own reading. This one is the argument,
            and it is the only part no tool should write.
          </p>
        </div>
      </article>
    </li>
  )
}

export function GapsPanel() {
  const sources = useAppStore((s) => s.sources)
  const chosenGapId = useAppStore((s) => s.chosenGapId)
  const report = useMemo(() => detectGaps(sources), [sources])

  if (!report.ready) {
    return (
      <section className="card card-pad max-w-measure">
        <div className="seclabel mb-4">Not yet</div>
        <p className="text-sm mb-3">
          You have {report.keptCount} {report.keptCount === 1 ? 'source' : 'sources'} logged.
          Gaps are found by looking for concentration across your columns, and below{' '}
          {MIN_SOURCES_FOR_GAPS} sources any concentration is an accident of what you happened to
          read first.
        </p>
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
          Keep logging. The detector turns on at {MIN_SOURCES_FOR_GAPS}.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <section
        className="card card-pad flex items-start gap-3"
        style={{ borderColor: 'var(--brick)' }}
      >
        <AlertTriangle size={18} aria-hidden className="mt-0.5 shrink-0" style={{ color: 'var(--brick)' }} />
        <div>
          <h2 className="font-display font-extrabold text-base tracking-display mb-1">
            Read this before you use any of it
          </h2>
          <p className="text-sm max-w-measure">{report.caveat}</p>
          <p className="text-sm max-w-measure mt-2" style={{ color: 'var(--ink-soft)' }}>
            The tool cannot tell a thin literature from a thin search. Your search log is the only
            thing that can, which is why it is worth keeping honestly.
          </p>
        </div>
      </section>

      {report.gaps.length === 0 ? (
        <section className="card card-pad max-w-measure">
          <div className="seclabel mb-4">No concentration found</div>
          <p className="text-sm">
            Your {report.keptCount} sources are spread across methods, populations, contexts and
            lenses, and none of them contradict each other on a shared pair of constructs. That is
            a real result, not a failure: it means the gap you argue for will have to come from
            your own reading of the literature rather than from a count of it.
          </p>
        </section>
      ) : (
        <>
          <p className="text-sm inline-flex items-start gap-2" style={{ color: 'var(--ink-soft)' }}>
            <Info size={14} aria-hidden className="mt-0.5 shrink-0" />
            {report.gaps.length} {report.gaps.length === 1 ? 'candidate' : 'candidates'}, strongest
            first. Pick one to build on; the others stay here.
          </p>
          <ul className="space-y-4">
            {report.gaps.map((g) => (
              <GapCard key={g.id} gap={g} chosen={g.id === chosenGapId} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
