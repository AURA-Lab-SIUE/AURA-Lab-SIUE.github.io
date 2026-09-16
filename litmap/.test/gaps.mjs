// Checks for the gap detector, the synthesis skeleton, the prospectus
// scaffold and the MethodoSync handoff.

import { detectGaps, gapParagraph, MIN_SOURCES_FOR_GAPS } from './lib/gaps.js'
import { buildSynthesis, synthesisMarkdown } from './lib/synthesis.js'
import { buildProspectus, seedCodebookFromConstructs } from './lib/handoff.js'

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
  constructY: 'engagement', direction: 'positive', effectSize: '', effectN: '',
  citedFoundational: [], setAside: false, notes: '', examinedAt: n, createdAt: n, ...over,
})
const pile = (over = {}) => src({ method: '', finding: '', population: '', ...over })
let idc = 0
const nextId = () => `id${++idc}`

// ── the minimum gate ──────────────────────────────────────────────────
console.log('\nGap detector: the gate')
n = 0
const few = [src(), src(), src(), src()]
const rFew = detectGaps(few)
ok(!rFew.ready, `4 sources is below the ${MIN_SOURCES_FOR_GAPS}-source gate`)
ok(rFew.gaps.length === 0, 'and nothing is reported')
ok(rFew.caveat.includes('not facts about the field'), 'the caveat is always present')

// unread imports must not push it over the gate either
n = 0
const padded = [src(), src(), src(), src(), pile(), pile(), pile(), pile()]
ok(!detectGaps(padded).ready, 'unread imports do not open the gate')

// ── methodological ────────────────────────────────────────────────────
console.log('\nMethodological gap')
n = 0
const allSurveys = Array.from({ length: 6 }, () => src())
const rMethod = detectGaps(allSurveys)
const method = rMethod.gaps.find((g) => g.kind === 'methodological')
ok(Boolean(method), 'six surveys fire a methodological gap')
ok(method.evidence.includes('6 of the 6'), 'the evidence states the counts', method?.evidence)
ok(method.draftLimitation.includes('what people say'),
  'the draft names what surveys are structurally blind to', method?.draftLimitation)
ok(method.draftPrompt === '', 'the third clause is always left empty')
ok(gapParagraph(method, '').split('.').length >= 3, 'known + limitation make a paragraph')
ok(gapParagraph(method, 'This study does X.').endsWith('This study does X.'),
  'the student clause is appended verbatim')

n = 0
const mixedMethods = [src(), src(), src(), src({ method: 'ethnography' }),
  src({ method: 'interview' }), src({ method: 'experiment' })]
ok(!detectGaps(mixedMethods).gaps.some((g) => g.kind === 'methodological'),
  'a spread of methods does NOT fire one')

// ── topical void ──────────────────────────────────────────────────────
console.log('\nTopical void')
n = 0
const rTopic = detectGaps(allSurveys)
const pop = rTopic.gaps.find((g) => g.id.startsWith('population:'))
ok(Boolean(pop), 'one repeated population fires a topical void')
ok(pop.title.includes('Twitch viewers'), 'and names it in the student’s own words', pop?.title)

n = 0
const spread = [src({ population: 'a' }), src({ population: 'b' }), src({ population: 'c' }),
  src({ population: 'd' }), src({ population: 'e' }), src({ population: 'f' })]
ok(!detectGaps(spread).gaps.some((g) => g.id.startsWith('population:')),
  'six different populations do not')

// ── contradiction ─────────────────────────────────────────────────────
console.log('\nContradiction')
n = 0
const clash = [
  src({ constructX: 'audience size', constructY: 'chat rate', direction: 'positive' }),
  src({ constructX: 'chat rate', constructY: 'audience size', direction: 'negative' }),
  src(), src(), src(),
]
const rClash = detectGaps(clash)
const contra = rClash.gaps.find((g) => g.kind === 'contradiction')
ok(Boolean(contra), 'opposing directions on the same pair fire a contradiction')
ok(contra.title.includes('audience size') && contra.title.includes('chat rate'),
  'named by both constructs', contra?.title)
ok(contra.evidence.includes('positive') && contra.evidence.includes('negative'),
  'the evidence says who reported what', contra?.evidence)
ok(contra.sources.length === 2, 'and points at exactly the two sources')

n = 0
const agree = [src(), src(), src(), src(), src()]
ok(!detectGaps(agree).gaps.some((g) => g.kind === 'contradiction'),
  'agreement on the same pair is not a contradiction')

// a null result against a positive one also conflicts
n = 0
const nulled = [src({ direction: 'null' }), src({ direction: 'positive' }), src(), src(), src()]
ok(detectGaps(nulled).gaps.some((g) => g.kind === 'contradiction'),
  'a null finding against a positive one counts as a conflict')

// ── theoretical ───────────────────────────────────────────────────────
console.log('\nTheoretical')
n = 0
const oneLens = Array.from({ length: 6 }, () => src())
const theory = detectGaps(oneLens).gaps.find((g) => g.kind === 'theoretical')
ok(Boolean(theory), 'one dominant lens fires a theoretical gap')
ok(theory.title.includes('Uses and gratifications'), 'and names it', theory?.title)

n = 0
const noTheory = Array.from({ length: 6 }, () => src({ theory: '' }))
const rNone = detectGaps(noTheory)
ok(rNone.gaps.some((g) => g.kind === 'atheoretical'),
  'a literature naming no theory is surfaced as its own finding')
ok(!rNone.gaps.some((g) => g.kind === 'theoretical'),
  'and is not also reported as a dominant lens')

// ── ordering ──────────────────────────────────────────────────────────
console.log('\nOrdering')
n = 0
const rAll = detectGaps(allSurveys)
const strengths = rAll.gaps.map((g) => g.strength)
ok(strengths.every((v, i) => i === 0 || strengths[i - 1] >= v),
  'gaps are sorted strongest first', strengths.join(','))

// ── synthesis ─────────────────────────────────────────────────────────
console.log('\nSynthesis')
n = 0
const syn = buildSynthesis([
  src({ constructX: 'social motivation', constructY: 'engagement' }),
  src({ constructX: 'engagement', constructY: 'social motivation' }),
  src({ constructX: 'tenure', constructY: 'retention' }),
  src({ constructX: '', constructY: '' }),
])
ok(syn.ready, 'a shared pair makes a group')
ok(syn.groups.length === 1, `one group (got ${syn.groups.length})`)
ok(syn.groups[0].sources.length === 2, 'with both sources, whichever order the pair was typed in')
ok(syn.groups[0].kind === 'convergent', 'same direction reads as convergent')
ok(syn.orphans.length === 1, 'a unique pair is an orphan, not a one-source paragraph')
ok(syn.unpaired.length === 1, 'a source with no pair is listed separately')

n = 0
const synDiv = buildSynthesis([
  src({ constructX: 'a', constructY: 'b', direction: 'positive' }),
  src({ constructX: 'a', constructY: 'b', direction: 'negative' }),
])
ok(synDiv.groups[0].kind === 'divergent', 'opposing directions read as divergent')

const md = synthesisMarkdown(syn)
ok(md.includes('**Your claim here.**'), 'the outline leaves the claim blank')
ok(!md.includes('Paragraph 2'), 'a single group produces a single paragraph')
ok(md.includes('Not yet grouped'), 'orphans get their own heading')

n = 0
ok(synthesisMarkdown(buildSynthesis([src(), src({ constructX: 'z', constructY: 'q' })]))
   .includes('nothing to group'),
  'no shared pair says so plainly rather than inventing a group')

// ── prospectus ────────────────────────────────────────────────────────
console.log('\nProspectus')
n = 0
const pSources = [src({ keystone: true }), src(), src(), src(), src(), src()]
const pGap = detectGaps(pSources).gaps[0]
const pros = buildProspectus({
  projectTitle: 'Chat and category',
  sources: pSources,
  gap: pGap,
  gapClause: 'This study codes a chat log directly.',
  reviewParagraph: 'ignored when a gap is chosen',
})
ok(pros.includes('# Prospectus: Chat and category'), 'titled')
for (const heading of ['## 1. Title', '## 2. Research question', '## 3. Theoretical framework',
  '## 4. Gap in the literature', '## 5. Method', '## 6. Expected contribution']) {
  ok(pros.includes(heading), `has ${heading}`)
}
ok(pros.includes('This study codes a chat log directly.'), 'the chosen gap carries the student clause')
ok(pros.includes('Uses and gratifications'), 'the framework comes from what the sources actually used')
ok(pros.includes('keystone'), 'keystones still appear among the key sources')
// REGRESSION: a gap built on two specific studies must cite those studies.
n = 0
const cSources = [
  src({ constructX: 'a', constructY: 'b', direction: 'positive' }),
  src({ constructX: 'a', constructY: 'b', direction: 'negative' }),
  src({ keystone: true }), src(), src(),
]
const cGap = detectGaps(cSources).gaps.find((g) => g.kind === 'contradiction')
const cPros = buildProspectus({ projectTitle: 'T', sources: cSources, gap: cGap,
  gapClause: 'mine', reviewParagraph: '' })
const keySection = cPros.split('Key sources:')[1].split('## 5.')[0]
ok(keySection.includes('Author1') && keySection.includes('Author2'),
  'the two sources the contradiction rests on are both cited', keySection.trim())
ok(keySection.includes('the gap rests on this'), 'and are marked as its evidence')
ok(keySection.indexOf('Author1') < keySection.indexOf('Author3'),
  'the gap evidence is listed before unrelated keystones')
const blanks = pros.split('_[write this]_').length - 1
ok(blanks >= 3, `the sections LitMap cannot know stay blank (${blanks} blanks)`)
ok(!pros.includes('## 2. Research question or hypothesis\n\nDoes '),
  'no research question is ever drafted')

// ── MethodoSync handoff ───────────────────────────────────────────────
console.log('\nHandoff')
n = 0; idc = 0
const hSources = [src({ constructX: 'social motivation', constructY: 'chat engagement' }),
  src({ constructX: 'social motivation', constructY: 'hours watched' }), pile()]
const seeded = seedCodebookFromConstructs(hSources, [], nextId)
ok(seeded.length === 3, `three distinct constructs seeded (got ${seeded.length})`,
  seeded.map((r) => r.variableName).join(','))
ok(seeded.every((r) => r.origin === 'manual'), "origin matches MethodoSync's own manual default")
ok(seeded.every((r) => r.variableType === 'binary'), 'type is binary, its default for unclassified')
ok(seeded.some((r) => r.variableName === 'social_motivation'), 'names are snake_case')
ok(seeded.every((r) => r.variableLabel === r.variableLabel.trim() && /[a-z]/.test(r.variableLabel)),
  'labels keep the student’s own words')

const again = seedCodebookFromConstructs(hSources, seeded, nextId)
ok(again.length === seeded.length, 'running the handoff twice adds nothing twice')

const withExisting = seedCodebookFromConstructs(hSources,
  [{ id: 'x', origin: 'category', sourceId: 'c1', variableName: 'social_motivation',
     variableLabel: 'kept', variableType: 'ordinal', definitionText: 'mine', inclusionRules: '',
     exclusionRules: '', valuesScale: '', anchorExample: '', anchorVideoId: null,
     anchorTimestamp: null }], nextId)
ok(withExisting[0].variableLabel === 'kept' && withExisting[0].variableType === 'ordinal',
  'an existing row is never overwritten')
ok(withExisting.length === 3, 'and the remaining constructs still seed')

console.log(fails === 0 ? '\nAll checks passed.' : `\n${fails} FAILED.`)
process.exit(fails === 0 ? 0 : 1)
