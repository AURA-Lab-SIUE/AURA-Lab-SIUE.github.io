import { useMemo, useState } from 'react'
import { Download, ArrowRightLeft, FileText } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { buildSynthesis, synthesisMarkdown } from '../../lib/synthesis'
import { detectGaps } from '../../lib/gaps'
import { buildProspectus } from '../../lib/handoff'
import { computeFeasibility } from '../../lib/feasibility'
import { buildMvlr, mvlrMarkdown } from '../../lib/mvlr'
import { slugify } from '../../lib/projectIO'
import { downloadBlob } from '../../utils/downloadBlob'
import { citeLabel } from '../../types/source'

export function SynthesisPanel() {
  const store = useAppStore()
  const report = useMemo(() => buildSynthesis(store.sources), [store.sources])
  const gaps = useMemo(() => detectGaps(store.sources), [store.sources])
  const chosenGap = gaps.gaps.find((g) => g.id === store.chosenGapId) ?? null
  const [handoffNote, setHandoffNote] = useState('')

  function download(text: string, suffix: string) {
    const slug = slugify(store.projectTitle, 'literature-map')
    downloadBlob(new Blob([text], { type: 'text/markdown' }), `${slug}-${suffix}.md`)
  }

  function exportOutline() {
    download(synthesisMarkdown(report), 'synthesis')
    store.announce('Synthesis outline exported.')
  }

  function exportProspectus() {
    const mvlr = buildMvlr(store.sources, store.reviewSourceIds)
    download(
      buildProspectus({
        projectTitle: store.projectTitle,
        sources: store.sources,
        gap: chosenGap,
        gapClause: chosenGap ? store.gapClauses[chosenGap.id] ?? '' : '',
        reviewParagraph: mvlrMarkdown(mvlr, store.gapSentence),
        question: store.question,
        theory: store.chosenTheory,
        method: store.chosenMethod,
        feasibility: computeFeasibility(store.feasibility),
      }),
      'prospectus'
    )
    store.announce('Prospectus scaffold exported.')
  }

  function handOff() {
    const added = store.handOffToMethodoSync()
    // Inline, not alert(): a modal dialog blocks the page, and there is nothing
    // here the student needs to acknowledge before carrying on.
    setHandoffNote(
      added > 0
        ? `${added} candidate ${added === 1 ? 'variable' : 'variables'} added to this project's codebook. Save the project file, then open it in MethodoSync.`
        : 'Nothing new to hand over. Either these constructs are already in the codebook, or no source records a relationship yet.'
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <section className="card card-pad">
        <div className="seclabel mb-4">Synthesis outline</div>
        <p className="text-sm max-w-measure mb-5">
          One paragraph per claim, not one per source. Sources are grouped where they name the same
          pair of constructs, because that is the honest signal that two studies are talking about
          the same thing. The claim lines are blank: that is the interpretation, and it is the
          assignment.
        </p>

        {!report.ready ? (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            No two sources yet name the same pair of constructs, so there is nothing to group.
            Keep reading, or check that you recorded the relationship each study reports.
          </p>
        ) : (
          <ol className="space-y-5">
            {report.groups.map((g, i) => (
              <li key={g.id}>
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[0.65rem]" style={{ color: 'var(--ink-soft)' }}>
                    ¶{i + 1}
                  </span>
                  <h3 className="font-display font-extrabold text-sm tracking-display">{g.about}</h3>
                  <span className={g.kind === 'divergent' ? 'pill-tag' : 'pill-muted'}>
                    {g.kind === 'divergent' ? 'they disagree' : 'they converge'}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--brick)' }}>
                  Your claim here.
                </p>
                <ul className="space-y-1">
                  {g.sources.map((s) => (
                    <li key={s.id} className="text-sm">
                      <span className="font-sans font-semibold text-xs">{citeLabel(s)}</span>{' '}
                      <span style={{ color: 'var(--ink-soft)' }}>{s.finding.trim()}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}

        {report.orphans.length > 0 && (
          <div className="mt-6">
            <div className="seclabel mb-2">Not yet grouped ({report.orphans.length})</div>
            <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>
              Nothing else names the same constructs as these. Either you have more to read, or
              they belong to a different argument.
            </p>
            <ul className="space-y-1">
              {report.orphans.map((s) => (
                <li key={s.id} className="text-xs">
                  {citeLabel(s)} — {s.constructX.trim()} and {s.constructY.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.unpaired.length > 0 && (
          <div className="mt-5">
            <div className="seclabel mb-2">No relationship recorded ({report.unpaired.length})</div>
            <ul className="space-y-1">
              {report.unpaired.map((s) => (
                <li key={s.id} className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                  {citeLabel(s)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="space-y-4">
        <section className="card card-pad">
          <div className="seclabel mb-4">Take it with you</div>
          <div className="space-y-3">
            <button className="btn-secondary w-full" onClick={exportOutline} disabled={!report.ready}>
              <Download size={14} aria-hidden /> Synthesis outline
            </button>
            <button className="btn-primary w-full" onClick={exportProspectus}>
              <FileText size={14} aria-hidden /> Prospectus scaffold
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--ink-soft)' }}>
            The prospectus fills the three sections LitMap actually knows — the gap, the
            framework, and the key sources — and marks the other three as blanks. Your research
            question, your method and your contribution are Chapter 6 and 7 decisions, and a
            scaffold that filled them would be handing you a prospectus you never wrote.
          </p>
          {!chosenGap && (
            <p className="mt-2 text-xs" style={{ color: 'var(--brick)' }}>
              No gap chosen yet, so section 4 will fall back to your four-sentence review.
            </p>
          )}
        </section>

        <section className="card card-pad">
          <div className="seclabel mb-4">Hand off to MethodoSync</div>
          <p className="text-sm mb-4">
            Turns every construct you met in the literature into a candidate codebook variable,
            inside this project's file. Nothing already in the codebook is touched, and running it
            twice adds nothing twice.
          </p>
          <button className="btn-secondary w-full" onClick={handOff}>
            <ArrowRightLeft size={14} aria-hidden /> Seed the codebook
          </button>
          {handoffNote && (
            <p
              className="mt-3 text-xs rounded-lg px-3 py-2"
              role="status"
              style={{ background: 'var(--brick-wash)', color: 'var(--brick-deep)' }}
            >
              {handoffNote}
            </p>
          )}
          <p className="mt-3 text-xs" style={{ color: 'var(--ink-soft)' }}>
            Then <strong>Save</strong> at the top, and open that file in{' '}
            <a className="link-underline" style={{ color: 'var(--brick)' }} href="/methodosync/">
              MethodoSync
            </a>. Variables arrive as binary, which is its own default for a row nobody has
            classified yet. The measurement level is a Chapter 9 decision and it stays yours.
          </p>
        </section>
      </div>
    </div>
  )
}
