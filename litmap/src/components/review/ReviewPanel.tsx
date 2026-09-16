import { useMemo, useState } from 'react'
import { Check, Copy, Download, Minus, Wand2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { computeSaturation, MIN_KEPT_FOR_SATURATION } from '../../lib/saturation'
import { buildMvlr, suggestTrio, mvlrMarkdown, MVLR_SIZE } from '../../lib/mvlr'
import { buildMarkdown } from '../../lib/markdownBuilder'
import { slugify } from '../../lib/projectIO'
import { downloadBlob } from '../../utils/downloadBlob'
import { citeLabel } from '../../types/source'
import { partition } from '../../lib/sourceState'
import { SaturationChart } from './SaturationChart'

const STATUS_COPY: Record<string, string> = {
  early: 'Too early to tell',
  building: 'Still building',
  approaching: 'Approaching saturation',
  saturated: 'Saturated',
}

export function ReviewPanel() {
  const store = useAppStore()
  const [copied, setCopied] = useState(false)

  const report = useMemo(
    () => computeSaturation(store.sources, store.searches, store.predictableAbstracts),
    [store.sources, store.searches, store.predictableAbstracts]
  )

  const eligible = partition(store.sources).kept
  const mvlr = useMemo(
    () => buildMvlr(store.sources, store.reviewSourceIds),
    [store.sources, store.reviewSourceIds]
  )
  const paragraph = mvlrMarkdown(mvlr, store.gapSentence)

  function exportMarkdown() {
    const md = buildMarkdown({
      projectTitle: store.projectTitle,
      topic: store.topic,
      sources: store.sources,
      searches: store.searches,
      saturation: report,
      mvlr,
      gapSentence: store.gapSentence,
    })
    const slug = slugify(store.projectTitle, 'literature-map')
    downloadBlob(new Blob([md], { type: 'text/markdown' }), `${slug}.md`)
    store.announce('Literature map exported as Markdown.')
  }

  async function copyParagraph() {
    try {
      await navigator.clipboard.writeText(paragraph)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      store.announce('Could not reach the clipboard. Select the text and copy it.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
      {/* ── saturation ── */}
      <section className="card card-pad">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
          <h2 className="seclabel">Saturation</h2>
          <span
            className="text-xs font-sans font-bold uppercase tracking-ui"
            style={{ color: report.status === 'saturated' ? 'var(--brick-text)' : 'var(--ink-soft)' }}
          >
            {STATUS_COPY[report.status]}
          </span>
        </div>

        <p className="text-sm mb-4 max-w-measure">{report.headline}</p>

        <SaturationChart report={report} />

        <div className="mt-6 space-y-3">
          <h2 className="seclabel">The three signs</h2>
          {report.tests.map((t) => (
            <div key={t.id} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 18, height: 18,
                  background: t.passed ? 'var(--brick-fill)' : 'transparent',
                  border: t.passed ? 'none' : '1.5px solid var(--line)',
                  color: '#fff',
                }}
              >
                {t.passed ? <Check size={11} aria-hidden /> : <Minus size={11} aria-hidden style={{ color: 'var(--ink-soft)' }} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-sans font-semibold">
                  {t.label}
                  {!t.computed && (
                    <span className="ml-2 pill-muted">your call</span>
                  )}
                </span>
                <span className="block text-xs" style={{ color: 'var(--ink-soft)' }}>{t.detail}</span>
                {t.id === 'predictable' && (
                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.predictableAbstracts}
                      onChange={(e) => store.setPredictable(e.target.checked)}
                    />
                    I can predict what an article says from its abstract
                  </label>
                )}
              </span>
            </div>
          ))}
          {report.keptCount < MIN_KEPT_FOR_SATURATION && (
            <p className="text-xs pt-1" style={{ color: 'var(--ink-soft)' }}>
              These signs are held back until {MIN_KEPT_FOR_SATURATION} sources are logged. Three
              empty searches on your first afternoon is a narrow search, not an exhausted literature,
              and the tool will not congratulate you for it.
            </p>
          )}
        </div>

        {report.core.length > 0 && (
          <div className="mt-6">
            <h2 className="seclabel mb-3">Works your sources keep citing</h2>
            <ul className="flex flex-wrap gap-1.5">
              {report.core.map((c) => (
                <li key={c.work} className="pill-tag">{c.work} · {c.count}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
              If you have not read these, read them next. They are the conversation everyone in
              your pile is having.
            </p>
          </div>
        )}
      </section>

      {/* ── minimum viable review ── */}
      <section className="card card-pad">
        <h2 className="seclabel mb-4">Three sources and a gap</h2>

        {eligible.length < MVLR_SIZE ? (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            {eligible.length} of {MVLR_SIZE} sources fully logged. At three you get a defensible
            first pass, assembled from sentences you have already written.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-sans font-semibold" style={{ color: 'var(--ink-soft)' }}>
                Choose three ({store.reviewSourceIds.length}/3)
              </span>
              <button
                className="btn-ghost"
                onClick={() => store.setReviewSourceIds(suggestTrio(store.sources))}
              >
                <Wand2 size={13} aria-hidden /> Suggest
              </button>
            </div>

            <ul className="space-y-1.5 mb-5 max-h-56 overflow-auto pr-1">
              {eligible.map((s) => {
                const checked = store.reviewSourceIds.includes(s.id)
                const full = store.reviewSourceIds.length >= MVLR_SIZE && !checked
                return (
                  <li key={s.id}>
                    <label
                      className="flex items-start gap-2 text-sm rounded-md px-2 py-1.5 cursor-pointer"
                      style={{ opacity: full ? 0.45 : 1, background: checked ? 'var(--brick-wash)' : 'transparent' }}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={full}
                        onChange={() => store.toggleReviewSource(s.id)}
                      />
                      <span className="min-w-0">
                        <span className="block font-sans font-semibold text-xs">{citeLabel(s)}</span>
                        <span className="block text-xs truncate" style={{ color: 'var(--ink-soft)' }}>
                          {s.title}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            {mvlr.chosen.length > 0 && (
              <>
                <div
                  className="rounded-lg p-4 text-sm leading-relaxed mb-4"
                  style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
                >
                  {mvlr.sentences.filter(Boolean).join(' ')}{' '}
                  {store.gapSentence.trim() ? (
                    <span>{store.gapSentence.trim()}</span>
                  ) : (
                    <span style={{ color: 'var(--brick-text)' }}>
                      [your gap sentence goes here]
                    </span>
                  )}
                </div>

                {mvlr.shared.length > 0 && (
                  <div className="mb-4">
                    <h2 className="seclabel mb-2">What these three share</h2>
                    <ul className="space-y-2">
                      {mvlr.shared.map((sh) => (
                        <li key={sh.field} className="text-xs">
                          <span className="font-sans font-semibold">{sh.label}:</span>{' '}
                          {sh.value}.{' '}
                          <span style={{ color: 'var(--ink-soft)' }}>Points at {sh.pointsAt}.</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                      These are counts, not conclusions. The sentence is still yours to write.
                    </p>
                  </div>
                )}

                <label className="field-label" htmlFor="gap">
                  The fourth sentence: what do these three leave unexplored?
                </label>
                <textarea
                  id="gap"
                  className="field-input"
                  rows={3}
                  value={store.gapSentence}
                  onChange={(e) => store.setGapSentence(e.target.value)}
                  placeholder="All three rely on self-report surveys, leaving the question of whether the same patterns appear in behavioural data largely unexamined."
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
                  Known, then the limitation, then what your study would do about it. This tool
                  will not write this one for you, and no tool should.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={copyParagraph} disabled={!paragraph.trim()}>
                    {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                    {copied ? 'Copied' : 'Copy paragraph'}
                  </button>
                  <button className="btn-primary" onClick={exportMarkdown}>
                    <Download size={14} aria-hidden /> Export literature map
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
