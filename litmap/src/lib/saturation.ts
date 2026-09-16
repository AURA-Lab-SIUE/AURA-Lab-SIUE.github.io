// Saturation — the live version of the book's fig04-1.
//
// Chapter 4 gives three practical tests for saturation, and this file
// implements exactly those three, with no others invented:
//
//   1. "three consecutive database searches turning up zero new relevant
//      articles"
//   2. "new articles citing the same eight to ten foundational sources you
//      have already read"
//   3. "an ability to predict what an article will say from its title and
//      abstract"  (the student's own call; a checkbox, not a computation)
//
// Test 3 cannot be computed and is not faked. Tests 1 and 2 are counts.
//
// Everything here is gated behind a MINIMUM: three empty searches on your
// first afternoon is not saturation, it is a bad search, and a tool that
// congratulated a student for it would be teaching the wrong lesson.

import type { SearchEvent, Source } from '../types/source'
import { partition } from './sourceState'

/** Below this many KEPT sources, no amount of flatness counts. */
export const MIN_KEPT_FOR_SATURATION = 8

/** Works cited by at least this many sources count as "foundational". */
const CORE_MIN_CITATIONS = 2

/** How many recent sources test 2 looks at. */
const RECENT_WINDOW = 5

/** Share of recent citations that may be new before test 2 stops passing. */
const NOVELTY_CEILING = 0.25

export interface CurvePoint {
  examined: number      // x — sources examined, in order
  distinct: number      // y — distinct relevant sources kept
  label: string
  kept: boolean
}

export interface SaturationTest {
  id: 'zero-new-runs' | 'core-convergence' | 'predictable'
  label: string
  detail: string
  passed: boolean
  computed: boolean     // false for the one the student judges
}

export interface SaturationReport {
  curve: CurvePoint[]
  examinedCount: number
  keptCount: number
  /** Imported but not yet read. Deliberately counts toward nothing. */
  pileCount: number
  core: { work: string; count: number }[]
  recentNovelty: number | null
  zeroNewRun: number
  tests: SaturationTest[]
  passedCount: number
  status: 'early' | 'building' | 'approaching' | 'saturated'
  headline: string
}

function ordered(sources: Source[]): Source[] {
  return [...sources].sort((a, b) => a.examinedAt - b.examinedAt)
}

function normWork(w: string): string {
  return w.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function computeSaturation(
  sources: Source[],
  searches: SearchEvent[],
  predictableAbstracts: boolean
): SaturationReport {
  const { kept: keptAll, aside, pile } = partition(sources)

  // Only EXAMINED sources reach the curve. A reference sitting unread in the
  // pile is not a data point about the literature; counting it was the bug the
  // first export exposed.
  const examined = ordered([...keptAll, ...aside])

  let running = 0
  const curve: CurvePoint[] = examined.map((s, i) => {
    const wasKept = !s.setAside
    if (wasKept) running++
    return {
      examined: i + 1,
      distinct: running,
      label: s.authors[0] ? `${s.authors[0]} ${s.year}` : s.title.slice(0, 28) || 'untitled',
      kept: wasKept,
    }
  })

  const relevant = ordered(keptAll)

  // ── test 1: consecutive searches that produced no new relevant source ──
  const searchesByDate = [...searches].sort((a, b) => a.createdAt - b.createdAt)
  const yieldBySearch = new Map<string, number>()
  for (const s of relevant) {
    if (s.foundVia.kind === 'search' && s.foundVia.ref) {
      yieldBySearch.set(s.foundVia.ref, (yieldBySearch.get(s.foundVia.ref) ?? 0) + 1)
    }
  }
  let zeroNewRun = 0
  for (let i = searchesByDate.length - 1; i >= 0; i--) {
    if ((yieldBySearch.get(searchesByDate[i].id) ?? 0) === 0) zeroNewRun++
    else break
  }

  // ── test 2: are new sources citing the same foundational works? ──
  const tally = new Map<string, { work: string; count: number }>()
  for (const s of relevant) {
    const seen = new Set<string>()
    for (const w of s.citedFoundational) {
      const key = normWork(w)
      if (!key || seen.has(key)) continue
      seen.add(key)
      const cur = tally.get(key)
      if (cur) cur.count++
      else tally.set(key, { work: w.trim(), count: 1 })
    }
  }
  const core = [...tally.values()]
    .filter((t) => t.count >= CORE_MIN_CITATIONS)
    .sort((a, b) => b.count - a.count || a.work.localeCompare(b.work))
    .slice(0, 10)
  const coreKeys = new Set(core.map((c) => normWork(c.work)))

  const recent = relevant.slice(-RECENT_WINDOW)
  let recentTotal = 0
  let recentNew = 0
  for (const s of recent) {
    for (const w of s.citedFoundational) {
      const key = normWork(w)
      if (!key) continue
      recentTotal++
      if (!coreKeys.has(key)) recentNew++
    }
  }
  const recentNovelty = recentTotal > 0 ? recentNew / recentTotal : null

  // ── assemble ──
  const enoughSources = relevant.length >= MIN_KEPT_FOR_SATURATION

  const t1: SaturationTest = {
    id: 'zero-new-runs',
    label: 'Three searches in a row with nothing new',
    detail:
      searchesByDate.length === 0
        ? 'No searches logged yet.'
        : zeroNewRun === 0
          ? 'Your most recent search still turned up something you kept.'
          : `Your last ${zeroNewRun} ${zeroNewRun === 1 ? 'search has' : 'searches have'} turned up nothing new.`,
    passed: zeroNewRun >= 3,
    computed: true,
  }

  const coreCount = core.length === 1 ? '1 work is' : `${core.length} works are`

  const t2: SaturationTest = {
    id: 'core-convergence',
    label: 'New reading keeps citing the same foundational works',
    detail:
      core.length === 0
        ? 'Not enough shared citations logged yet to tell.'
        : recentNovelty === null
          ? `${coreCount} cited by two or more of your sources, but your recent sources list no citations yet.`
          : `${coreCount} cited by two or more of your sources. In your last ${recent.length} sources, ${Math.round(recentNovelty * 100)}% of the works cited were ones you had not already met.`,
    passed: core.length >= 8 && recentNovelty !== null && recentNovelty <= NOVELTY_CEILING,
    computed: true,
  }

  const t3: SaturationTest = {
    id: 'predictable',
    label: 'You can predict the article from its abstract',
    detail: predictableAbstracts
      ? 'You have said yes. Only you can judge this one.'
      : 'Your call. Tick it when new abstracts stop surprising you.',
    passed: predictableAbstracts,
    computed: false,
  }

  const tests = [t1, t2, t3]
  const passedCount = tests.filter((t) => t.passed).length

  let status: SaturationReport['status']
  if (!enoughSources) status = relevant.length >= 4 ? 'building' : 'early'
  else if (passedCount >= 3) status = 'saturated'
  else if (passedCount === 2) status = 'approaching'
  else status = 'building'

  const headline =
    status === 'early'
      ? `${relevant.length} of the ${MIN_KEPT_FOR_SATURATION} sources that make this reading worth measuring.`
      : status === 'building'
        ? 'Still climbing. Keep reading and keep logging searches.'
        : status === 'approaching'
          ? 'Close. Two of the three saturation signs are showing.'
          : 'Saturated. Stop searching and start synthesising.'

  return {
    curve,
    examinedCount: examined.length,
    keptCount: relevant.length,
    pileCount: pile.length,
    core,
    recentNovelty,
    zeroNewRun,
    tests,
    passedCount,
    status,
    headline,
  }
}
