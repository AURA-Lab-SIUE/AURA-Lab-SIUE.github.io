// Checks for FIG.6: the feasibility meter, the question workbench, method fit,
// the theory dataset, and the design brief.

import { computeFeasibility, DEFAULT_FEASIBILITY } from './lib/feasibility.js'
import {
  assembleQuestion, finalQuestion, judgeQuestion, checkQuestion, failureModes,
  loggedConstructs, EMPTY_DRAFT,
} from './lib/question.js'
import { assessMethods } from './lib/methodFit.js'
import { THEORIES, THEORY_CATEGORIES, findTheory, searchTheories, relatedTo, theoryUrl } from './lib/theories.js'
import { buildDesignBrief } from './lib/designBrief.js'

let fails = 0
const ok = (cond, msg, extra) => {
  if (cond) console.log(`  PASS  ${msg}`)
  else { fails++; console.log(`  FAIL  ${msg}${extra ? `\n        ${extra}` : ''}`) }
}

let n = 0
const src = (over = {}) => ({
  id: `s${++n}`, authors: [`Author${n}`], year: '2020', title: `Title ${n}`, container: '',
  doi: '', url: '', keystone: false, foundVia: { kind: 'other', ref: null },
  population: 'Twitch viewers', context: 'Twitch', theory: 'Uses and gratifications',
  method: 'survey', finding: `finding ${n}`, constructX: 'social motivation',
  constructY: 'chat engagement', direction: 'positive', effectSize: '', effectN: '',
  citedFoundational: [], setAside: false, notes: '', examinedAt: n, createdAt: n, ...over,
})

// ── feasibility ───────────────────────────────────────────────────────
console.log('\nFeasibility: the arithmetic')
const empty = computeFeasibility(DEFAULT_FEASIBILITY)
ok(empty.verdict === 'empty', 'no units means no verdict, not a green light')
ok(empty.lines.length === 0, 'and no arithmetic is shown')

const base = { ...DEFAULT_FEASIBILITY, units: 1000, minutesPerUnit: 2, coders: 2,
  overlapPercent: 20, setupHours: 8, weeksAvailable: 10, hoursPerWeek: 6 }
const r = computeFeasibility(base)
// 1000 x 2min = 33.33h; 20% double-coded = 200 x 2min = 6.67h; reconcile = 2.22h; setup 8
ok(Math.abs(r.lines[1].hours - 33.333) < 0.01, 'one pass is units x minutes / 60', String(r.lines[1].hours))
ok(Math.abs(r.lines[2].hours - 6.667) < 0.01, 'the overlap is a SUBSET, not the whole corpus twice', String(r.lines[2].hours))
ok(Math.abs(r.lines[3].hours - 2.222) < 0.01, 'reconciliation is a third of the overlap', String(r.lines[3].hours))
ok(Math.abs(r.totalHours - 50.222) < 0.01, 'the total adds up', String(r.totalHours))
ok(r.availableHours === 60, '10 weeks x 6 hours', String(r.availableHours))
ok(r.verdict === 'tight', `50 of 60 hours is tight, not comfortable (got ${r.verdict})`)

const solo = computeFeasibility({ ...base, coders: 1 })
ok(solo.lines.length === 2, 'one coder means no reliability lines at all', String(solo.lines.length))
ok(solo.totalHours < r.totalHours, 'and a smaller total')

const comfy = computeFeasibility({ ...base, units: 300 })
ok(comfy.verdict === 'comfortable', `300 units is comfortable (got ${comfy.verdict})`)
const over = computeFeasibility({ ...base, units: 4000 })
ok(over.verdict === 'impossible', `4000 units in 60 hours is impossible (got ${over.verdict})`)
ok(over.remedies.length > 0, 'and it says what would fix it')

// THE round trip: the suggested sample must actually fit.
console.log('\nFeasibility: the remedy is real')
const suggestion = over.remedies.find((x) => x.startsWith('Code '))
ok(Boolean(suggestion), 'it suggests a smaller sample', over.remedies.join(' | '))
const suggested = Number(suggestion.match(/Code ([\d,]+)/)[1].replace(/,/g, ''))
const retried = computeFeasibility({ ...base, units: suggested })
ok(retried.ratio <= 1,
  `taking the suggested ${suggested} units actually fits (ratio ${retried.ratio.toFixed(2)})`)
ok(computeFeasibility({ ...base, units: suggested + 200 }).ratio > 1,
  'and the suggestion is near the ceiling, not an arbitrary small number')

// ── the question ──────────────────────────────────────────────────────
console.log('\nQuestion: assembly')
const q = {
  ...EMPTY_DRAFT, goal: 'explanatory', form: 'question', relation: 'differs',
  focus: 'the proportion of directed messages', comparator: 'gaming and non-gaming streams',
  population: '228 channels', context: 'Twitch', bounds: 'over two weeks',
}
ok(assembleQuestion(q) ===
  'Does the proportion of directed messages differ between gaming and non-gaming streams among 228 channels on Twitch, over two weeks?',
  'a difference question assembles in Chapter 6 shape', assembleQuestion(q))
ok(assembleQuestion({ ...q, relation: 'associated' }).startsWith('Is the proportion'),
  'association reads as "Is X associated with Y"')
ok(assembleQuestion({ ...q, relation: 'predicts' }).startsWith('Does gaming and non-gaming streams predict'),
  'prediction puts the predictor first')
ok(assembleQuestion({ ...q, goal: 'descriptive', relation: 'prevalence' }).startsWith('How common is'),
  'descriptive asks how common')
ok(assembleQuestion({ ...q, goal: 'exploratory', relation: 'nature' }).startsWith('What does'),
  'exploratory asks what it looks like')

const hyp = { ...q, form: 'hypothesis', direction: 'higher' }
ok(assembleQuestion(hyp).endsWith('.'), 'a hypothesis is declarative, not interrogative')
ok(assembleQuestion(hyp).includes('will be higher in'), 'and states its direction', assembleQuestion(hyp))

ok(finalQuestion({ ...q, ownWording: 'My own phrasing.' }) === 'My own phrasing.',
  'the student’s own wording always wins')
ok(finalQuestion(q) === assembleQuestion(q), 'and the assembled one is the fallback')

console.log('\nQuestion: the five criteria')
const sources = Array.from({ length: 6 }, () => src())
const feasOk = computeFeasibility({ ...base, units: 300 })
const cs = (draft, f = feasOk) => Object.fromEntries(checkQuestion(draft, sources, f).map((c) => [c.id, c]))

ok(cs(EMPTY_DRAFT).specific.state === 'fail', 'an empty draft is not specific')
ok(cs(EMPTY_DRAFT).specific.detail.includes('Missing:'), 'and it says what is missing')
ok(cs(q).specific.state === 'pass', 'a filled draft is specific')

ok(cs({ ...q, focus: 'chat engagement' }).measurable.state === 'pass',
  'a measurable OUTCOME passes, even when the grouping variable is not a logged construct')
ok(cs({ ...q, focus: 'chat engagement' }).measurable.detail.includes('grouping variable'),
  'and it says so rather than staying silent')
ok(cs({ ...q, focus: 'chat engagement', comparator: 'social motivation' }).measurable.detail.includes('Both'),
  'when both are logged constructs it says both')
ok(cs({ ...q, focus: 'vibes' }).measurable.state === 'unknown',
  'a construct nobody measured is unknown, not a failure')
ok(cs({ ...q, focus: 'vibes' }).measurable.detail.includes('operational definition'),
  'and it says what that costs you')

ok(cs(q, feasOk).answerable.state === 'pass', 'a feasible design passes answerable')
ok(cs(q, computeFeasibility({ ...base, units: 4000 })).answerable.state === 'fail',
  'an impossible one fails it')
ok(cs(q, null).answerable.state === 'unknown', 'and no numbers means unknown')

ok(cs(q).novel.state === 'unanswerable' && cs(q).matters.state === 'unanswerable',
  'the two uncheckable criteria are marked uncheckable, never ticked')

console.log('\nQuestion: the three failure modes')
const modes = failureModes(EMPTY_DRAFT)
ok(modes.length === 3, 'three of them')
ok(modes.every((m) => !m.answered), 'unanswered by default')
ok(modes.every((m) => !m.triggered), 'and not triggered by default')
const flagged = failureModes({ ...q, selfSelected: true, sameMeasure: false, forcedChoice: false })
ok(flagged[0].triggered && !flagged[1].triggered, 'only the one answered yes fires')
ok(flagged[0].problem.includes('impossible comparison'), 'and it is named as Chapter 6 names it')
ok(flagged.every((m) => m.answered), 'answering no still counts as answered')

const clean = { ...q, selfSelected: false, sameMeasure: false, forcedChoice: false }
ok(judgeQuestion(clean, sources, feasOk).ready, 'a clean, feasible, specific question is ready')
ok(!judgeQuestion({ ...clean, selfSelected: true }, sources, feasOk).ready, 'a triggered mode blocks ready')
ok(!judgeQuestion(q, sources, feasOk).ready, 'and so do unanswered modes')
ok(!judgeQuestion(clean, sources, computeFeasibility({ ...base, units: 4000 })).ready,
  'and so does an impossible budget')

ok(loggedConstructs(sources).includes('chat engagement'), 'constructs come from the logged sources')
ok(loggedConstructs([src({ setAside: true })]).length === 0, 'set-aside sources contribute none')

// ── method fit ────────────────────────────────────────────────────────
console.log('\nMethod fit')
ok(!assessMethods(null, []).ready, 'no goal and no access means no verdicts')
ok(!assessMethods('explanatory', []).ready, 'access alone is required too')

const fit = (goal, access) =>
  Object.fromEntries(assessMethods(goal, access).verdicts.map((v) => [v.method, v]))

const contentOnly = fit('explanatory', ['content'])
ok(contentOnly['content-analysis'].fit === 'fits', 'content + explanatory fits content analysis')
ok(contentOnly.survey.fit === 'blocked', 'a survey is blocked with no people')
ok(contentOnly.survey.reason.includes('people'), 'and says which access is missing', contentOnly.survey.reason)
ok(contentOnly.ethnography.fit === 'blocked', 'ethnography is blocked with no setting')

const people = fit('explanatory', ['people'])
ok(people.survey.fit === 'fits' && people.experiment.fit === 'fits', 'people + explanatory fits survey and experiment')
ok(people['focus-group'].fit === 'blocked', 'focus groups cannot answer an explanatory question')
ok(people['focus-group'].reason.includes('different kind of question'),
  'and the reason distinguishes question-fit from access', people['focus-group'].reason)

const setting = fit('exploratory', ['setting'])
ok(setting.ethnography.fit === 'fits', 'setting + exploratory fits ethnography')
ok(setting.conceptual.fit === 'fits', 'a conceptual piece needs no access at all')

ok(assessMethods('explanatory', ['content']).verdicts[0].fit === 'fits',
  'the list is sorted with what fits at the top')
ok(assessMethods('explanatory', ['content']).note.includes('flexible case'),
  'the content-analysis note is carried, and is not a recommendation')

// ── theories ──────────────────────────────────────────────────────────
console.log('\nTheory dataset')
ok(THEORIES.length === 55, `all 55 theories vendored (got ${THEORIES.length})`)
ok(THEORY_CATEGORIES.length === 9, `nine categories (got ${THEORY_CATEGORIES.length})`)
ok(THEORIES.every((t) => t.slug && t.name && t.summary), 'every record has slug, name and summary')
ok(findTheory('Uses and Gratifications Approach') !== null || findTheory('uses-and-gratifications-approach') !== null,
  'lookup works by name or slug')
ok(findTheory('ELM')?.name === 'Elaboration Likelihood Model', 'and by an alternative name', findTheory('ELM')?.name)
ok(findTheory('not a real theory') === null, 'and returns null for nonsense')

const hits = searchTheories('agenda', null)
ok(hits.length > 0 && hits[0].name.toLowerCase().includes('agenda'),
  'search ranks a name match first', hits[0]?.name)
ok(searchTheories('', 'Health Communication').every((t) => t.categories.includes('Health Communication')),
  'category filtering is exact')
ok(searchTheories('zzzznothing', null).length === 0, 'no match returns nothing rather than everything')
ok(theoryUrl('agenda-setting-theory') === 'https://aura-lab.siue.edu/theories/agenda-setting-theory/',
  'theory links point at the explorer')
const rel = THEORIES.find((t) => (t.related ?? []).length > 0)
ok(!rel || relatedTo(rel.slug).length > 0, 'related theories resolve to real records')

// ── design brief ──────────────────────────────────────────────────────
console.log('\nDesign brief')
const verdict = judgeQuestion({ ...clean, selfSelected: true }, sources, feasOk)
const brief = buildDesignBrief({
  projectTitle: 'Chat and category',
  question: { ...clean, selfSelected: true },
  verdict,
  feasibility: feasOk,
  feasibilityInput: { ...base, units: 300 },
  theory: 'Elaboration Likelihood Model',
  method: 'content-analysis',
  methods: assessMethods('explanatory', ['content']),
  gap: null,
  gapClause: '',
})
ok(brief.includes('# Design brief: Chat and category'), 'titled')
ok(brief.includes(finalQuestion(clean)), 'carries the question')
ok(brief.includes('## What held up'), 'reports the criteria')
ok(brief.includes('cannot be checked by any tool'), 'and admits which it cannot check')
ok(brief.includes('### Flagged') && brief.includes('impossible comparison'),
  'a triggered failure mode is printed, not hidden')
ok(brief.includes('Elaboration Likelihood Model') && brief.includes('aura-lab.siue.edu/theories/'),
  'the lens links back to the explorer')
ok(brief.includes('Content analysis'), 'names the chosen method')
ok(brief.includes('| **Total** |'), 'shows the feasibility arithmetic')
ok(brief.includes('Ruled out by your question or your access'), 'and what the method choice excluded')

const quiet = buildDesignBrief({
  projectTitle: '', question: EMPTY_DRAFT,
  verdict: judgeQuestion(EMPTY_DRAFT, sources, null),
  feasibility: computeFeasibility(DEFAULT_FEASIBILITY), feasibilityInput: DEFAULT_FEASIBILITY,
  theory: '', method: '', methods: assessMethods(null, []), gap: null, gapClause: '',
})
ok(quiet.includes('_None chosen yet._'), 'an empty design says so rather than inventing content')
ok(!quiet.includes('| **Total** |'), 'and prints no arithmetic it does not have')

console.log(fails === 0 ? '\nAll checks passed.' : `\n${fails} FAILED.`)
process.exit(fails === 0 ? 0 : 1)
