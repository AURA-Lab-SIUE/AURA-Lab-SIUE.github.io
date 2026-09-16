// The hand-holding strip. It shows ONE next action, never a list, and the
// button takes the student straight to the place that action happens.
//
// The rule it follows: the next action is the earliest unfinished thing, and
// finishing a source you have half-logged always outranks starting a new one.
// A half-filled matrix is the failure mode this tool exists to prevent.

import { ArrowRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { citeLabel } from '../../types/source'
import { MIN_KEPT_FOR_SATURATION } from '../../lib/saturation'
import { partition, missingRefOnly } from '../../lib/sourceState'
import { detectGaps, MIN_SOURCES_FOR_GAPS } from '../../lib/gaps'
import { buildSynthesis } from '../../lib/synthesis'
import { finalQuestion, judgeQuestion } from '../../lib/question'
import { computeFeasibility } from '../../lib/feasibility'

export interface NextAction {
  title: string
  detail: string
  cta: string
  go: () => void
}

export function useNextAction(): NextAction {
  const store = useAppStore()
  const { sources, searches, projectTitle, topic, gapSentence, reviewSourceIds } = store
  const { kept: complete, pile: incompleteUnsorted } = partition(sources)
  const incomplete = [...incompleteUnsorted].sort((a, b) => a.examinedAt - b.examinedAt)

  if (!projectTitle.trim() || !topic.trim()) {
    return {
      title: 'Say what you are interested in',
      detail:
        'One sentence, as vague as it honestly is right now. "I am interested in Twitch chat" is a fine starting point. The reading is what narrows it, not this box.',
      cta: 'Start here',
      go: () => store.setStage(1),
    }
  }

  if (searches.length === 0 && sources.length === 0) {
    return {
      title: 'Log your first search',
      detail:
        'Before you read anything, write down where you looked and exactly what you typed. This is the search log Chapter 4 asks for, and it is what lets the tool tell later whether your reading has really run dry.',
      cta: 'Log a search',
      go: () => store.setStage(1),
    }
  }

  if (sources.length === 0) {
    return {
      title: 'Add the first thing you read',
      detail:
        'Import a Zotero export and the citations fill themselves in, or add one by hand. Either way you answer the same eight questions about every source.',
      cta: 'Add sources',
      go: () => store.setStage(2),
    }
  }

  if (incomplete.length > 0) {
    const s = incomplete[0]
    const label = citeLabel(s) === 'Unknown (n.d.)' ? s.title.slice(0, 40) || 'an untitled source' : citeLabel(s)
    return {
      title: `Finish logging ${label}`,
      detail: missingRefOnly(s)
        ? 'It says it came from a search or a chain, but not which one. Until that is filled in, the search it came from still counts as having turned up nothing, and the saturation signal is wrong.'
        : incomplete.length > 1
          ? `${incomplete.length} sources are missing the fields everything else counts on. Do this one first.`
          : 'It is missing one or more of the fields everything else counts on: who was studied, what method, and the one-sentence finding.',
      cta: 'Open it',
      go: () => {
        store.setStage(2)
        store.setEditing(s.id)
      },
    }
  }

  if (complete.length < 3) {
    const n = 3 - complete.length
    return {
      title: `Read and log ${n} more source${n === 1 ? '' : 's'}`,
      detail:
        'At three fully logged sources you get your first four-sentence literature review, assembled from what you have already written.',
      cta: 'Add a source',
      go: () => store.setStage(2),
    }
  }

  if (reviewSourceIds.length < 3) {
    return {
      title: 'Pick the three sources for your first review',
      detail:
        'Three sources and four sentences is a defensible first pass. Choose the three that belong together, or take the three suggested.',
      cta: 'Go to the review',
      go: () => store.setStage(3),
    }
  }

  if (!gapSentence.trim()) {
    return {
      title: 'Write the gap sentence',
      detail:
        'Three findings without a gap is a summary. The fourth sentence is the one that turns it into an argument, and it is the only sentence this tool will not write for you.',
      cta: 'Write it',
      go: () => store.setStage(3),
    }
  }

  // ── the gap ──
  if (complete.length < MIN_SOURCES_FOR_GAPS) {
    const n = MIN_SOURCES_FOR_GAPS - complete.length
    return {
      title: `Keep reading: ${n} more and the gap detector turns on`,
      detail: `Gaps are found by looking for concentration across your columns. Below ${MIN_SOURCES_FOR_GAPS} sources, any concentration is an accident of what you happened to read first.`,
      cta: 'Add a source',
      go: () => store.setStage(2),
    }
  }

  const gapReport = detectGaps(sources)
  if (gapReport.gaps.length > 0 && !store.chosenGapId) {
    return {
      title: `${gapReport.gaps.length} candidate ${gapReport.gaps.length === 1 ? 'gap' : 'gaps'} in what you have read`,
      detail:
        'Your columns have started to concentrate. Look at what the tool found, decide whether you agree, and pick the one you will build on.',
      cta: 'See the gaps',
      go: () => store.setStage(4),
    }
  }

  const chosen = gapReport.gaps.find((g) => g.id === store.chosenGapId)
  if (chosen && !(store.gapClauses[chosen.id] ?? '').trim()) {
    return {
      title: 'Say what your study does about that gap',
      detail:
        'The first two sentences are assembled from your own reading. The third is the argument, and it is the only part no tool should write for you.',
      cta: 'Write it',
      go: () => store.setStage(4),
    }
  }

  // ── saturation ──
  if (complete.length < MIN_KEPT_FOR_SATURATION) {
    const n = MIN_KEPT_FOR_SATURATION - complete.length
    return {
      title: `Keep reading: ${n} more before saturation means anything`,
      detail: `You have ${complete.length} sources logged. Below ${MIN_KEPT_FOR_SATURATION}, a flat curve says your search was narrow, not that the literature is exhausted.`,
      cta: 'Add a source',
      go: () => store.setStage(2),
    }
  }

  // ── synthesis ──
  if (!buildSynthesis(sources).ready) {
    return {
      title: 'Nothing groups yet',
      detail:
        'A synthesis needs two sources that name the same pair of constructs. Nothing you have logged does, which usually means more reading rather than a problem with the tool.',
      cta: 'Add a source',
      go: () => store.setStage(2),
    }
  }

  // ── the design ──
  const q = store.question
  const feas = computeFeasibility(store.feasibility)
  const jq = judgeQuestion(q, sources, feas)

  if (!q.focus.trim()) {
    return {
      title: 'Now write the question',
      detail:
        'Your reading has done its work. A research question has a shape, and the slots fill from what you have already logged.',
      cta: 'Build the question',
      go: () => store.setStage(6),
    }
  }

  if (jq.checks.find((c) => c.id === 'specific')?.state === 'fail') {
    return {
      title: 'The question is still unbounded',
      detail: jq.checks.find((c) => c.id === 'specific')?.detail ?? '',
      cta: 'Finish it',
      go: () => store.setStage(6),
    }
  }

  if (jq.unanswered > 0) {
    return {
      title: `Answer the ${jq.unanswered} question${jq.unanswered === 1 ? '' : 's'} about how this goes wrong`,
      detail:
        'Self-selected comparisons, circular questions and false binaries are the three that recur. A minute each, and they are what catches a bad question before you code 4,000 cases.',
      cta: 'Check it',
      go: () => store.setStage(6),
    }
  }

  if (jq.triggered.length > 0) {
    return {
      title: jq.triggered[0].question.replace(/\?$/, ' — and you said yes'),
      detail: jq.triggered[0].fix,
      cta: 'Look at it',
      go: () => store.setStage(6),
    }
  }

  if (feas.verdict === 'empty') {
    return {
      title: 'Find out whether it fits in a semester',
      detail:
        'How many units, how long each takes, how many weeks are left. Chapter 6 says to narrow until it hurts; this is that instruction as arithmetic.',
      cta: 'Do the numbers',
      go: () => store.setStage(6),
    }
  }

  if (feas.verdict === 'over' || feas.verdict === 'impossible') {
    return {
      title: 'It does not fit yet',
      detail: `${feas.headline} ${feas.remedies[0] ?? ''}`,
      cta: 'Narrow it',
      go: () => store.setStage(6),
    }
  }

  if (!store.chosenMethod) {
    return {
      title: 'Choose the method',
      detail:
        'A method either reaches the thing your question asks about or it does not. Say what you can get hold of and the list sorts itself.',
      cta: 'Choose',
      go: () => store.setStage(6),
    }
  }

  return {
    title: 'You have a question, a lens, a method and a budget',
    detail: `"${finalQuestion(q)}" Export the design brief and the prospectus, and take both to your instructor.`,
    cta: 'Export',
    go: () => store.setStage(6),
  }
}

export function NextStep() {
  const action = useNextAction()
  return (
    <div className="mx-auto max-w-page px-4 md:px-6 pt-5">
      <div
        className="card card-pad flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        style={{ borderColor: 'var(--brick)', background: 'var(--brick-wash)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="seclabel mb-2">Next step</p>
          <h2 className="text-lg md:text-xl font-display font-extrabold tracking-display mb-1">
            {action.title}
          </h2>
          <p className="text-sm max-w-measure" style={{ color: 'var(--ink-soft)' }}>
            {action.detail}
          </p>
        </div>
        <button className="btn-primary shrink-0 self-start md:self-auto" onClick={action.go}>
          {action.cta} <ArrowRight size={15} aria-hidden />
        </button>
      </div>
    </div>
  )
}
