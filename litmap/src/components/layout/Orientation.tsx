// What a student sees before they know what any of this is for.
//
// Without it, LitMap opens on a search-log form, which is meaningless to
// someone whose actual problem is "I don't have a topic". The arc has to be
// visible from the first screen: you will not choose a topic and then read,
// you will read and the topic will narrow itself.

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const KEY = 'litmap-orientation-open'

const STEPS: { fig: string; title: string; body: string }[] = [
  {
    fig: 'FIG.1',
    title: 'Write down where you looked',
    body: 'Every search, with the exact words you typed. This is what later tells you whether your reading has really run dry, or whether you just stopped early.',
  },
  {
    fig: 'FIG.2',
    title: 'Answer eight questions about every source',
    body: 'Import your citations, then answer the same eight questions each time. About five minutes a paper. The repetition is the point: answers only become comparable when they are asked the same way.',
  },
  {
    fig: 'FIG.3',
    title: 'Watch the curve, and get your first review',
    body: 'At three sources you get a four-sentence literature review, built from sentences you already wrote. The curve tells you when to stop searching.',
  },
  {
    fig: 'FIG.4',
    title: 'See the gaps your reading has exposed',
    body: 'At five sources the tool starts looking for concentration: one method everywhere, one population everywhere, two studies that disagree. Those are the openings a research question is built on.',
  },
  {
    fig: 'FIG.5',
    title: 'Leave with a prospectus scaffold',
    body: 'Sources grouped by claim rather than listed one by one, and the Chapter 6 prospectus with the parts you can honestly fill already filled.',
  },
]

export function Orientation() {
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(KEY) !== 'closed' } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, open ? 'open' : 'closed') } catch { /* private mode */ }
  }, [open])

  return (
    <section className="card card-pad">
      <button
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
        <span className="seclabel" style={{ marginLeft: 0 }}>How LitMap works</span>
      </button>

      {open && (
        <div className="mt-5">
          <p className="text-base max-w-measure mb-2">
            You are not going to pick a topic and then go read about it. You are going to read, and
            the topic is going to narrow itself.
          </p>
          <p className="text-sm max-w-measure mb-6" style={{ color: 'var(--ink-soft)' }}>
            That is the part nobody tells you. A research question is the <em>output</em> of about
            ten well-logged sources, not something you are supposed to produce before you start.
            LitMap holds the structure while you read, and hands you the question at the end.
            Everything stays in this browser; nothing is uploaded.
          </p>

          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.fig} className="flex gap-3">
                <span className="figtag shrink-0 mt-0.5">{s.fig}</span>
                <span className="min-w-0">
                  <span className="block font-sans font-semibold text-sm">{s.title}</span>
                  <span className="block text-sm max-w-measure" style={{ color: 'var(--ink-soft)' }}>
                    {s.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div
            className="mt-6 rounded-lg p-4 text-sm max-w-measure"
            style={{ background: 'var(--brick-wash)', border: '1px solid var(--line)' }}
          >
            <strong>What it will not do.</strong> It will not tell you whether you searched well,
            and it will not tell you whether your question matters. Those two need your instructor.
            Everything else here is arithmetic over what you logged, which is why you can check it.
          </div>

          <p className="mt-4 text-xs" style={{ color: 'var(--ink-soft)' }}>
            The method is Chapter 4 of <em>Vibes to Variables</em>, "Intelligence Gathering".
            If a step here is confusing, that chapter is the long version.
          </p>
        </div>
      )}
    </section>
  )
}
