import { useMemo } from 'react'
import { Check, Minus, X, AlertTriangle, HelpCircle, Download } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { computeFeasibility } from '../../lib/feasibility'
import {
  assembleQuestion, finalQuestion, judgeQuestion, loggedConstructs,
  needsComparator, GOALS, RELATIONS, type Goal, type Relation, type Direction,
} from '../../lib/question'
import { assessMethods, ACCESS_OPTIONS, type Access } from '../../lib/methodFit'
import { partition } from '../../lib/sourceState'
import { slugify } from '../../lib/projectIO'
import { buildDesignBrief } from '../../lib/designBrief'
import { downloadBlob } from '../../utils/downloadBlob'
import { detectGaps } from '../../lib/gaps'
import { TheoryPicker } from './TheoryPicker'

function Suggest({ values, onPick }: { values: string[]; onPick: (v: string) => void }) {
  if (values.length === 0) return null
  return (
    <ul className="mt-1.5 flex flex-wrap gap-1.5">
      {values.slice(0, 8).map((v) => (
        <li key={v}>
          <button className="pill-muted" onClick={() => onPick(v)}>{v}</button>
        </li>
      ))}
    </ul>
  )
}

const STATE_ICON = {
  pass: <Check size={12} aria-hidden />,
  fail: <X size={12} aria-hidden />,
  unknown: <Minus size={12} aria-hidden />,
  unanswerable: <HelpCircle size={12} aria-hidden />,
}

export function DesignPanel() {
  const store = useAppStore()
  const d = store.question
  const kept = partition(store.sources).kept

  const feas = useMemo(() => computeFeasibility(store.feasibility), [store.feasibility])
  const verdict = useMemo(() => judgeQuestion(d, store.sources, feas), [d, store.sources, feas])
  const methods = useMemo(() => assessMethods(d.goal, store.access), [d.goal, store.access])
  const constructs = useMemo(() => loggedConstructs(store.sources), [store.sources])
  const populations = useMemo(
    () => [...new Set(kept.map((s) => s.population.trim()).filter(Boolean))], [kept]
  )
  const contexts = useMemo(
    () => [...new Set(kept.map((s) => s.context.trim()).filter(Boolean))], [kept]
  )

  const relations = RELATIONS.filter((r) => r.goals.includes(d.goal))
  const wantsComparator = needsComparator(d.relation) || d.form === 'hypothesis'
  const question = finalQuestion(d)

  function exportBrief() {
    const gaps = detectGaps(store.sources)
    const gap = gaps.gaps.find((g) => g.id === store.chosenGapId) ?? null
    const md = buildDesignBrief({
      projectTitle: store.projectTitle,
      question: d,
      verdict,
      feasibility: feas,
      feasibilityInput: store.feasibility,
      theory: store.chosenTheory,
      method: store.chosenMethod,
      methods,
      gap,
      gapClause: gap ? store.gapClauses[gap.id] ?? '' : '',
    })
    downloadBlob(new Blob([md], { type: 'text/markdown' }), `${slugify(store.projectTitle, 'design')}-design.md`)
    store.announce('Design brief exported.')
  }

  return (
    <div className="space-y-6">
      {/* ── the question ── */}
      <section className="card card-pad">
        <div className="seclabel mb-4">1. The question</div>
        <p className="text-sm max-w-measure mb-5">
          A research question has a shape: a thing you measure, a relationship or pattern, and a
          bounded population. Fill the slots and it assembles. Nothing here is written for you, and
          the suggestions under each box are your own reading.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="goal">What kind of question is it?</label>
            <select
              id="goal"
              className="field-input"
              value={d.goal}
              onChange={(e) => {
                const goal = e.target.value as Goal
                const first = RELATIONS.find((r) => r.goals.includes(goal))
                store.patchQuestion({
                  goal,
                  relation: first?.value ?? 'nature',
                  form: goal === 'explanatory' ? d.form : 'question',
                })
              }}
            >
              {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label} — {g.asks}</option>)}
            </select>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
              Produces {GOALS.find((g) => g.value === d.goal)?.produces}.
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="form">Question or hypothesis?</label>
            <select
              id="form"
              className="field-input"
              value={d.form}
              disabled={d.goal !== 'explanatory'}
              onChange={(e) => store.patchQuestion({ form: e.target.value as 'question' | 'hypothesis' })}
            >
              <option value="question">Research question</option>
              <option value="hypothesis">Hypothesis</option>
            </select>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
              {d.goal !== 'explanatory'
                ? 'Exploratory and descriptive work asks questions; only explanatory work predicts.'
                : 'A hypothesis needs theory or prior work behind the prediction. If you are unsure which way it goes, ask a question.'}
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="focus">What are you measuring?</label>
            <input
              id="focus" className="field-input" value={d.focus}
              onChange={(e) => store.patchQuestion({ focus: e.target.value })}
              placeholder="the proportion of messages directed at the streamer"
            />
            <Suggest values={constructs} onPick={(v) => store.patchQuestion({ focus: v })} />
          </div>

          {wantsComparator ? (
            <div>
              <label className="field-label" htmlFor="comp">Against what?</label>
              <input
                id="comp" className="field-input" value={d.comparator}
                onChange={(e) => store.patchQuestion({ comparator: e.target.value })}
                placeholder="gaming and non-gaming streams"
              />
              <Suggest values={constructs} onPick={(v) => store.patchQuestion({ comparator: v })} />
            </div>
          ) : <div />}

          {d.form === 'question' ? (
            <div>
              <label className="field-label" htmlFor="rel">Asking</label>
              <select
                id="rel" className="field-input" value={d.relation}
                onChange={(e) => store.patchQuestion({ relation: e.target.value as Relation })}
              >
                {relations.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="field-label" htmlFor="dir">Predicted direction</label>
              <select
                id="dir" className="field-input" value={d.direction}
                onChange={(e) => store.patchQuestion({ direction: e.target.value as Direction })}
              >
                <option value="">Choose one</option>
                <option value="higher">higher in</option>
                <option value="lower">lower in</option>
                <option value="positive">positively associated with</option>
                <option value="negative">negatively associated with</option>
              </select>
              <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
                A hypothesis without a direction is a research question wearing a hat.
              </p>
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="pop">Among whom?</label>
            <input
              id="pop" className="field-input" value={d.population}
              onChange={(e) => store.patchQuestion({ population: e.target.value })}
              placeholder="the 228 channels in the working corpus"
            />
            <Suggest values={populations} onPick={(v) => store.patchQuestion({ population: v })} />
          </div>

          <div>
            <label className="field-label" htmlFor="ctx">Where?</label>
            <input
              id="ctx" className="field-input" value={d.context}
              onChange={(e) => store.patchQuestion({ context: e.target.value })}
              placeholder="Twitch"
            />
            <Suggest values={contexts} onPick={(v) => store.patchQuestion({ context: v })} />
          </div>

          <div className="md:col-span-2">
            <label className="field-label" htmlFor="bounds">Bounded how? (optional but recommended)</label>
            <input
              id="bounds" className="field-input" value={d.bounds}
              onChange={(e) => store.patchQuestion({ bounds: e.target.value })}
              placeholder="over a two-week window in 2018"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="seclabel mb-2">Assembled</div>
          <p
            className="rounded-lg p-4 text-base leading-relaxed"
            style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
          >
            {assembleQuestion(d)}
          </p>
          <label className="field-label mt-4" htmlFor="own">Say it in your own words (this is the one that counts)</label>
          <textarea
            id="own" className="field-input" rows={2} value={d.ownWording}
            onChange={(e) => store.patchQuestion({ ownWording: e.target.value })}
            placeholder="Rewrite the assembled version above so it sounds like a person wrote it."
          />
        </div>
      </section>

      {/* ── the five criteria ── */}
      <section className="card card-pad">
        <div className="seclabel mb-4">2. Does it hold up?</div>
        <p className="text-sm max-w-measure mb-4">
          Chapter 6's five criteria. Three of them can be checked. Two cannot, and are marked as
          such rather than quietly ticked.
        </p>
        <ul className="space-y-3">
          {verdict.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 18, height: 18,
                  background: c.state === 'pass' ? 'var(--brick-fill)' : 'transparent',
                  border: c.state === 'pass' ? 'none' : '1.5px solid var(--line)',
                  color: c.state === 'pass' ? '#fff' : c.state === 'fail' ? 'var(--brick)' : 'var(--ink-soft)',
                }}
              >
                {STATE_ICON[c.state]}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-sans font-semibold">
                  {c.label}
                  {c.state === 'unanswerable' && <span className="ml-2 pill-muted">not checkable</span>}
                </span>
                <span className="block text-xs max-w-measure" style={{ color: 'var(--ink-soft)' }}>{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── the three failure modes ── */}
      <section className="card card-pad">
        <div className="seclabel mb-4">3. The three ways this goes wrong</div>
        <p className="text-sm max-w-measure mb-5">
          These recur often enough that Chapter 6 names them. Only you can answer these, so they
          are questions rather than detections.
        </p>
        <ul className="space-y-5">
          {verdict.modes.map((m) => {
            const current = m.id === 'impossible-comparison' ? d.selfSelected
              : m.id === 'circular' ? d.sameMeasure : d.forcedChoice
            const set = (v: boolean) =>
              store.patchQuestion(
                m.id === 'impossible-comparison' ? { selfSelected: v }
                  : m.id === 'circular' ? { sameMeasure: v } : { forcedChoice: v }
              )
            return (
              <li key={m.id}>
                <p className="text-sm font-sans font-semibold">{m.question}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>{m.hint}</p>
                <div className="flex gap-2">
                  <button className={current === true ? 'btn-primary' : 'btn-secondary'} onClick={() => set(true)}>Yes</button>
                  <button className={current === false ? 'btn-primary' : 'btn-secondary'} onClick={() => set(false)}>No</button>
                </div>
                {m.triggered && (
                  <div
                    className="mt-3 rounded-lg p-3 text-sm max-w-measure"
                    style={{ background: 'var(--brick-wash)', border: '1px solid var(--brick)' }}
                  >
                    <p className="mb-2">{m.problem}</p>
                    <p><strong>What to do:</strong> {m.fix}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── theory ── */}
      <section className="card card-pad">
        <div className="seclabel mb-4">4. The lens</div>
        <p className="text-sm max-w-measure mb-4">
          A theory tells you what to look for and what to make of it. Search the lab's own 55, or
          type one that is not there.
        </p>
        <label className="field-label" htmlFor="design-theory">Theory</label>
        <TheoryPicker
          id="design-theory"
          value={store.chosenTheory}
          onChange={store.setChosenTheory}
          showRelated
        />
      </section>

      {/* ── method ── */}
      <section className="card card-pad">
        <div className="seclabel mb-4">5. The method</div>
        <p className="text-sm max-w-measure mb-4">
          A method is not a preference. It either reaches the thing your question asks about or it
          does not, and what you can get hold of decides the rest.
        </p>
        <fieldset>
          <legend className="field-label">What can you actually get?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ACCESS_OPTIONS.map((a) => (
              <label
                key={a.value}
                className="flex items-start gap-2 text-sm rounded-lg p-3 cursor-pointer"
                style={{
                  border: `1px solid ${store.access.includes(a.value) ? 'var(--brick)' : 'var(--line)'}`,
                  background: store.access.includes(a.value) ? 'var(--brick-wash)' : 'transparent',
                }}
              >
                <input
                  type="checkbox" className="mt-1"
                  checked={store.access.includes(a.value)}
                  onChange={() => store.toggleAccess(a.value as Access)}
                />
                <span>
                  <span className="block font-sans font-semibold text-xs">{a.label}</span>
                  <span className="block text-xs" style={{ color: 'var(--ink-soft)' }}>{a.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {methods.ready ? (
          <ul className="mt-5 space-y-2">
            {methods.verdicts.map((v) => (
              <li
                key={v.method}
                className="rounded-lg p-3"
                style={{
                  border: '1px solid var(--line)',
                  opacity: v.fit === 'blocked' ? 0.5 : 1,
                  background: store.chosenMethod === v.method ? 'var(--brick-wash)' : 'transparent',
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-semibold text-sm">{v.label}</span>
                      <span className={v.fit === 'fits' ? 'pill-tag' : 'pill-muted'}>
                        {v.fit === 'fits' ? 'fits' : v.fit === 'possible' ? 'needs more access' : 'cannot answer this'}
                      </span>
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{v.reason}</p>
                    <p className="text-xs mt-1">
                      <strong>Reaches</strong> {v.reaches}. <strong>Blind to</strong> {v.blind}.
                    </p>
                  </div>
                  {v.fit !== 'blocked' && (
                    <button
                      className={store.chosenMethod === v.method ? 'btn-primary shrink-0' : 'btn-secondary shrink-0'}
                      onClick={() => store.setChosenMethod(store.chosenMethod === v.method ? '' : v.method)}
                    >
                      {store.chosenMethod === v.method ? <><Check size={13} aria-hidden /> Chosen</> : 'Choose'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm" style={{ color: 'var(--ink-soft)' }}>
            Tick what you can get hold of and this fills in.
          </p>
        )}
        <p className="mt-4 text-xs max-w-measure" style={{ color: 'var(--ink-soft)' }}>{methods.note}</p>
      </section>

      {/* ── feasibility ── */}
      <FeasibilityMeter />

      {/* ── export ── */}
      <section className="card card-pad flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <div className="seclabel mb-2">Take the design with you</div>
          <p className="text-sm max-w-measure" style={{ color: 'var(--ink-soft)' }}>
            The question, what held up and what did not, the lens, the method and the arithmetic,
            as one Markdown file.
          </p>
          {question.includes('[') && (
            <p className="text-xs mt-2" style={{ color: 'var(--brick)' }}>
              The question still has empty slots in it.
            </p>
          )}
        </div>
        <button className="btn-primary shrink-0" onClick={exportBrief}>
          <Download size={14} aria-hidden /> Export design brief
        </button>
      </section>
    </div>
  )
}

// ── the feasibility meter ─────────────────────────────────────────────

function FeasibilityMeter() {
  const store = useAppStore()
  const f = store.feasibility
  const r = useMemo(() => computeFeasibility(f), [f])

  const colour =
    r.verdict === 'comfortable' ? 'var(--ink-soft)'
      : r.verdict === 'tight' ? 'var(--brick)'
        : 'var(--brick)'
  const pct = Math.min(100, Math.round((r.ratio || 0) * 100))

  const num = (label: string, key: keyof typeof f, hint: string, min = 0) => (
    <div>
      <label className="field-label" htmlFor={`f-${key}`}>{label}</label>
      <input
        id={`f-${key}`} type="number" min={min} className="field-input"
        value={String(f[key] as number)}
        onChange={(e) => store.patchFeasibility({ [key]: Number(e.target.value) } as never)}
      />
      <p className="mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>{hint}</p>
    </div>
  )

  return (
    <section className="card card-pad">
      <div className="seclabel mb-4">6. Will it fit in a semester?</div>
      <p className="text-sm max-w-measure mb-5">
        Chapter 6 says to narrow until it hurts a little, then narrow a bit more. This is that
        instruction as arithmetic. Every number is your estimate, and every step is shown, so you
        can see which one is the problem.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="f-unit">What is one unit?</label>
          <input
            id="f-unit" className="field-input" value={f.unitLabel}
            onChange={(e) => store.patchFeasibility({ unitLabel: e.target.value })}
            placeholder="message"
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>The thing you code once.</p>
        </div>
        {num('How many will you code?', 'units', 'Your sample, not the whole corpus.')}
        {num('Minutes to code one', 'minutesPerUnit', 'Guess high. Pilot it and come back.')}
        {num('Coders', 'coders', 'Two is the floor for a reliability check.', 1)}
        {num('% double-coded', 'overlapPercent', 'The reliability subsample, not the whole thing.')}
        {num('Codebook and pilot hours', 'setupHours', 'Writing it, testing it, fixing it.')}
        {num('Weeks left', 'weeksAvailable', 'Until the deliverable is due.', 1)}
        {num('Hours per week', 'hoursPerWeek', 'Honestly. Not aspirationally.', 1)}
      </div>

      <div className="mt-6">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--line)' }}
          role="img"
          aria-label={`Estimated ${Math.round(r.totalHours)} hours against ${Math.round(r.availableHours)} available`}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: colour, transition: 'width 200ms' }} />
        </div>
        <p className="mt-3 text-sm max-w-measure" style={{ color: r.verdict === 'over' || r.verdict === 'impossible' ? 'var(--brick)' : 'var(--ink)' }}>
          {r.headline}
        </p>
      </div>

      {r.lines.length > 0 && (
        <table className="mt-5 w-full text-sm">
          <tbody>
            {r.lines.map((l) => (
              <tr key={l.label} style={{ borderTop: '1px solid var(--line)' }}>
                <td className="py-2 pr-3">
                  <span className="block">{l.label}</span>
                  <span className="block text-xs" style={{ color: 'var(--ink-soft)' }}>{l.detail}</span>
                </td>
                <td className="py-2 text-right font-mono text-xs whitespace-nowrap">
                  {Math.round(l.hours * 10) / 10} h
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--line)' }}>
              <td className="py-2 font-sans font-semibold">Total</td>
              <td className="py-2 text-right font-mono text-xs font-semibold">
                {Math.round(r.totalHours * 10) / 10} h
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {r.remedies.length > 0 && (
        <div className="mt-5">
          <div className="seclabel mb-2 inline-flex items-center gap-2">
            <AlertTriangle size={13} aria-hidden style={{ color: 'var(--brick)' }} />
            Any one of these would make it fit
          </div>
          <ul className="space-y-1.5">
            {r.remedies.map((x) => (
              <li key={x} className="text-sm max-w-measure">{x}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
