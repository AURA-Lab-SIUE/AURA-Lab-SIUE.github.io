import { readFileSync } from 'node:fs'
import { parseBibliography, detectFormat } from './lib/bibImport.js'
import { computeSaturation, MIN_KEPT_FOR_SATURATION } from './lib/saturation.js'
import { buildMvlr, suggestTrio, mvlrMarkdown } from './lib/mvlr.js'
import { sourceState, partition } from './lib/sourceState.js'
import { buildSearchString, adviseSearch, formatTerm } from './lib/searchString.js'
import { slugify } from './lib/projectIO.js'
import { buildMarkdown } from './lib/markdownBuilder.js'

let fails = 0
const ok = (cond, msg, extra) => {
  if (cond) console.log(`  PASS  ${msg}`)
  else { fails++; console.log(`  FAIL  ${msg}${extra ? `\n        ${extra}` : ''}`) }
}

// ── 1. BibTeX ─────────────────────────────────────────────────────────
console.log('\nBibTeX')
const bib = readFileSync(new URL('../sample-livestreaming.bib', import.meta.url), 'utf8')
ok(detectFormat(bib) === 'bibtex', 'detected as bibtex')
const refs = parseBibliography(bib)
ok(refs.length === 6, `6 entries parsed (got ${refs.length})`)
const sj = refs.find((r) => r.year === '2017')
ok(sj?.authors[0] === 'Sjöblom', `LaTeX accent resolved: Sjöblom (got ${sj?.authors[0]})`)
ok(sj?.authors.length === 2, `two authors (got ${sj?.authors.length})`)
ok(
  sj?.title === 'Why do people watch others play video games? An empirical study on the motivations of Twitch users',
  'braces stripped from title', sj?.title
)
ok(sj?.container === 'Computers in Human Behavior', 'journal captured', sj?.container)
ok(sj?.doi === '10.1016/j.chb.2016.10.019', 'doi captured', sj?.doi)
const ham = refs.find((r) => r.year === '2014')
ok(ham?.container?.startsWith('Proceedings of the SIGCHI'), 'booktitle used when no journal', ham?.container)
ok(refs.filter((r) => r.authors.length === 4).length === 1, 'four-author entry split correctly')

// ── 2. CSL-JSON ───────────────────────────────────────────────────────
console.log('\nCSL-JSON')
const csl = JSON.stringify([
  {
    title: 'Social motivations of live-streaming viewer engagement on Twitch',
    author: [{ family: 'Hilvert-Bruce', given: 'Zorah' }, { literal: 'Juho Hamari' }],
    issued: { 'date-parts': [[2018, 3]] },
    'container-title': 'Computers in Human Behavior',
    DOI: '10.1016/j.chb.2018.02.013',
  },
])
ok(detectFormat(csl) === 'csl-json', 'detected as csl-json')
const c = parseBibliography(csl)[0]
ok(c.authors.join('|') === 'Hilvert-Bruce|Hamari', 'family + literal names both resolved', c.authors.join('|'))
ok(c.year === '2018', 'year from date-parts', c.year)

// ── 3. RIS ────────────────────────────────────────────────────────────
console.log('\nRIS')
const ris = ['TY  - JOUR', 'AU  - Wulf, Tim', 'AU  - Schneider, Frank M.',
  'TI  - Watching players', 'T2  - Games and Culture', 'PY  - 2020', 'DO  - 10.1177/x', 'ER  - '].join('\n')
ok(detectFormat(ris) === 'ris', 'detected as ris')
const r = parseBibliography(ris)[0]
ok(r.authors.join('|') === 'Wulf|Schneider', 'RIS authors', r.authors.join('|'))
ok(r.container === 'Games and Culture', 'RIS container', r.container)

// ── 4. bad input ──────────────────────────────────────────────────────
console.log('\nBad input')
let threw = false
try { parseBibliography('just some prose, not a bibliography') } catch { threw = true }
ok(threw, 'unrecognised text throws rather than returning junk')

// ── fixtures ──────────────────────────────────────────────────────────
let n = 0
const src = (over = {}) => ({
  id: `s${++n}`, authors: [`Author${n}`], year: '2020', title: `Title ${n}`, container: '',
  doi: '', url: '', keystone: false, foundVia: { kind: 'other', ref: null },
  population: 'Twitch viewers', context: 'Twitch', theory: 'Uses and gratifications',
  method: 'survey', finding: `finding number ${n}`, constructX: 'social motivation',
  constructY: 'engagement', direction: 'positive', effectSize: '', effectN: '',
  citedFoundational: [], setAside: false, notes: '', examinedAt: n, createdAt: n, ...over,
})

// A reference imported from a .bib and never opened.
const pile = (over = {}) => src({ method: '', finding: '', population: '', ...over })

// ── 5. saturation: the minimum gate ───────────────────────────────────
console.log('\nSaturation')
const searches = [1, 2, 3].map((i) => ({
  id: `q${i}`, date: '2026-09-01', database: 'CMMC', queryString: 'x', limiters: '',
  nResults: 10, nKept: 0, createdAt: i,
}))
const few = [src(), src(), src()]
const rFew = computeSaturation(few, searches, true)
ok(rFew.zeroNewRun === 3, 'three empty searches counted', String(rFew.zeroNewRun))
ok(rFew.status !== 'saturated',
  `3 sources cannot be "saturated" even with all signs (got ${rFew.status})`)
ok(rFew.keptCount < MIN_KEPT_FOR_SATURATION, 'gate reason is the source count')

// ── 6. saturation: the real thing ─────────────────────────────────────
const core = ['Horton & Wohl 1956', 'Katz et al. 1973', 'Hamilton 2014', 'Sjöblom 2017',
  'Hilvert-Bruce 2018', 'Gerbner 1976', 'McCombs 1972', 'Tajfel 1979']
const many = Array.from({ length: 10 }, () => src({ citedFoundational: [...core] }))
const rMany = computeSaturation(many, searches, true)
ok(rMany.core.length === 8, `8 foundational works detected (got ${rMany.core.length})`)
ok(rMany.recentNovelty === 0, `no new works in the recent window (got ${rMany.recentNovelty})`)
ok(rMany.status === 'saturated', `saturated with all three signs (got ${rMany.status})`)
ok(rMany.passedCount === 3, 'all three tests pass')

// student has not ticked the self-judged test
const rNoTick = computeSaturation(many, searches, false)
ok(rNoTick.status === 'approaching', `unticked self-test holds at approaching (got ${rNoTick.status})`)

// a search that DID yield resets the run
const yielded = [...many]
yielded[9] = { ...yielded[9], foundVia: { kind: 'search', ref: 'q3' } }
const rYield = computeSaturation(yielded, searches, true)
ok(rYield.zeroNewRun === 0, `a productive last search resets the run (got ${rYield.zeroNewRun})`)
ok(rYield.status === 'approaching', 'and that drops it back below saturated')

// ── 6b. pluralisation of the foundational-works count ─────────────────
const oneWork = Array.from({ length: 9 }, () => src({ citedFoundational: ['Katz et al. 1973'] }))
const rOne = computeSaturation(oneWork, [], false)
ok(rOne.core.length === 1, 'one foundational work detected')
ok(/1 work is cited/.test(rOne.tests[1].detail),
  'singular reads "1 work is cited", not "1 works are"', rOne.tests[1].detail)
const twoWorks = Array.from({ length: 9 }, () => src({ citedFoundational: ['Katz 1973', 'Horton 1956'] }))
ok(/2 works are cited/.test(computeSaturation(twoWorks, [], false).tests[1].detail), 'plural still reads correctly')

// ── 7. the curve counts examined vs kept correctly ────────────────────
console.log('\nCurve')
n = 0
const mixed = [src(), src({ setAside: true }), src(), src({ setAside: true }), src()]
const rMix = computeSaturation(mixed, [], false)
ok(rMix.examinedCount === 5, 'five examined')
ok(rMix.keptCount === 3, 'three kept')
ok(rMix.curve.map((p) => p.distinct).join(',') === '1,1,2,2,3',
  'curve holds flat across set-aside sources', rMix.curve.map((p) => p.distinct).join(','))

// THE REGRESSION: unread imports must count toward nothing
console.log('\nThree states (unread imports)')
n = 0
const imported = [src(), src(), pile(), pile(), pile(), src({ setAside: true })]
ok(sourceState(imported[0]) === 'kept', 'a fully logged source is kept')
ok(sourceState(imported[2]) === 'pile', 'an imported, unopened reference is in the pile')
ok(sourceState(imported[5]) === 'aside', 'an explicitly rejected source is set aside')
const part = partition(imported)
ok(part.kept.length === 2 && part.pile.length === 3 && part.aside.length === 1,
  'partition splits 2 kept / 3 pile / 1 aside',
  `${part.kept.length}/${part.pile.length}/${part.aside.length}`)
const rImp = computeSaturation(imported, [], false)
ok(rImp.keptCount === 2, `unread imports do NOT inflate the kept count (got ${rImp.keptCount})`)
ok(rImp.examinedCount === 3, `examined = kept + set aside only (got ${rImp.examinedCount})`)
ok(rImp.pileCount === 3, 'the pile is reported separately')
ok(rImp.curve.length === 3, `the curve has one point per EXAMINED source (got ${rImp.curve.length})`)
ok(rImp.curve[rImp.curve.length - 1].distinct === 2, 'the curve tops out at the kept count')

const bigPile = [...Array.from({ length: 3 }, () => src()), ...Array.from({ length: 40 }, () => pile())]
const rBig = computeSaturation(bigPile, searches, true)
ok(rBig.status !== 'saturated',
  `40 unread imports + 3 read sources is not saturation (got ${rBig.status})`)
ok(rBig.keptCount === 3, 'only the three read sources count')

const rCite = computeSaturation(
  [src({ citedFoundational: ['Katz 1973'] }), pile({ citedFoundational: ['Katz 1973'] })], [], false)
ok(rCite.core.length === 0,
  'a work cited only by an unread import is not foundational', JSON.stringify(rCite.core))

// filename slug cuts at a word boundary
console.log('\nSlug')
const longSlug = slugify('Directed and broadcast chat across stream categories', 'x')
ok(longSlug === 'directed-and-broadcast-chat-across-stream',
  'slug stops at a whole word, never mid-word ("across-strea")', longSlug)
ok(slugify('', 'litmap') === 'litmap', 'empty title falls back')
ok(slugify('Chat', 'x') === 'chat', 'short title is untouched')
ok(slugify('Supercalifragilisticexpialidociousandthensomemoreletterssss', 'x').length <= 48,
  'a single over-long word is still capped')

// the export never implies an unread paper was read
console.log('\nExport')
n = 0
const docSources = [src({ finding: 'chat is social' }), src({ finding: 'chat is fast' }),
  src({ finding: 'chat is loud' }), pile({ title: 'Never Opened' }),
  src({ setAside: true, notes: 'wrong medium' })]
const docSat = computeSaturation(docSources, [], false)
const docMvlr = buildMvlr(docSources, docSources.slice(0, 3).map((x) => x.id))
const md = buildMarkdown({ projectTitle: 'T', topic: '', sources: docSources, searches: [],
  saturation: docSat, mvlr: docMvlr, gapSentence: 'a gap.' })
const matrix = md.split('## Sources')[1].split('###')[0]
ok(!matrix.includes('Never Opened'), 'unread imports stay OUT of the source matrix')
ok(md.includes('In the pile, not yet read (1)'), 'unread imports get their own heading')
ok(md.includes('Examined and set aside (1)'), 'set-aside sources keep their own heading')
const refsSection = md.split('## References logged')[1]
ok(!refsSection.includes('Never Opened'), 'unread imports stay OUT of the reference list')
ok(/3 sources kept of 4 examined\. 1 reference still unread\./.test(md),
  'the header counts kept, examined and unread separately',
  md.split('\n').find((l) => l.includes('kept of')))

// ── 8. minimum viable review ──────────────────────────────────────────
console.log('\nMinimum viable review')
n = 0
const trio = [
  src({ finding: 'Twitch streams work as virtual third places', method: 'ethnography', keystone: true }),
  src({ finding: 'Social and tension-release motivations were central to why people watched' }),
  src({ finding: 'social interaction predicted chatting and subscribing' }),
]
const chosen = suggestTrio(trio)
ok(chosen.length === 3, 'suggests three')
ok(chosen[0] === trio[0].id, 'keystone suggested first')
const m = buildMvlr(trio, chosen)
ok(m.ready, 'ready with three complete sources')
ok(m.sentences[0] === 'Author1 (2020) found that Twitch streams work as virtual third places.',
  'sentence assembled with citation and terminal period', m.sentences[0])
ok(m.sentences[0].includes('Twitch'),
  'a proper noun at the start is NOT lowercased (regression: "twitch streams")', m.sentences[0])
ok(m.sentences[1].endsWith('why people watched.'), 'terminal period added once', m.sentences[1])
ok(m.sentences[2] === 'Author3 (2020) found that social interaction predicted chatting and subscribing.',
  'a lower-case opening is left alone too', m.sentences[2])
const shared = Object.fromEntries(m.shared.map((s) => [s.field, s.value]))
ok(shared.population === 'Twitch viewers', 'shared population detected')
ok(shared.theory === 'Uses and gratifications', 'shared theory detected')
ok(!('method' in shared), 'method NOT flagged as shared when one differs')

// contradiction
n = 0
const clash = [src({ direction: 'positive' }), src({ direction: 'negative' }), src()]
const mc = buildMvlr(clash, clash.map((s) => s.id))
ok(mc.shared.some((s) => s.field === 'direction'), 'opposing directions surfaced as a contradiction')

// incomplete
n = 0
const partial = [src({ finding: '' }), src(), src()]
const mp = buildMvlr(partial, partial.map((s) => s.id))
ok(!mp.ready && mp.missingFindings.length === 1, 'missing finding blocks readiness')

// gap sentence never invented
const para = mvlrMarkdown(m, '')
ok(!/gap/i.test(para) && para.split('found that').length === 4,
  'paragraph is exactly the three findings when no gap is written')
const para2 = mvlrMarkdown(m, 'All three rely on self-report.')
ok(para2.endsWith('All three rely on self-report.'), 'gap sentence appended verbatim')

console.log('\nSearch-string builder')
const blk = (label, terms) => ({ id: label, label, terms })
ok(formatTerm('Twitch') === 'Twitch', 'a single word is left bare')
ok(formatTerm('live streaming') === '"live streaming"', 'a phrase is quoted', formatTerm('live streaming'))
ok(formatTerm('"already quoted"') === '"already quoted"', 'an already-quoted phrase is not double-quoted')
ok(formatTerm('stream*') === 'stream*', 'a wildcard stem survives')
ok(formatTerm('   ') === '', 'whitespace is not a term')

const built = buildSearchString([
  blk('a', ['livestream*', 'live streaming', 'Twitch']),
  blk('b', ['motivation*', 'gratification*']),
])
ok(built.includes(' OR '), 'synonyms inside a block are ORed')
ok(built.includes(' AND'), 'blocks are ANDed')
ok(built.includes('"live streaming"'), 'phrases are quoted in the output', built)
ok(built.startsWith('('), 'a multi-term block is parenthesised', built)

ok(buildSearchString([blk('a', ['Twitch'])]) === 'Twitch',
  'a single term needs no parentheses', buildSearchString([blk('a', ['Twitch'])]))
ok(buildSearchString([blk('a', []), blk('b', [])]) === '', 'empty blocks produce nothing')
ok(buildSearchString([blk('a', ['x']), blk('b', [])]) === 'x', 'empty blocks are skipped, not ANDed as blanks')

const adv = (bs) => adviseSearch(bs).map((a) => a.text).join(' | ')
ok(adv([]).includes('Nothing here yet'), 'an empty builder says so')
ok(adv([blk('a', ['Twitch'])]).includes('far too much'),
  'one concept is flagged as too broad')
ok(adv([blk('a', ['Twitch']), blk('b', ['chat']), blk('c', ['x']), blk('d', ['y'])])
   .includes('almost nothing'), 'four ANDed concepts are flagged as too narrow')
ok(adv([blk('a', ['Twitch']), blk('b', ['chat'])]).includes('no synonyms'),
  'one term per block is flagged as missing synonyms')
ok(adv([blk('a', ['Twitch', 'livestream*']), blk('b', ['chat', 'comment*'])])
   .includes('the right shape'), 'a well-formed search is confirmed rather than nagged')
ok(!adv([blk('a', ['stream*', 'Twitch']), blk('b', ['chat', 'x'])]).includes('Consider a wildcard'),
  'the wildcard tip disappears once one is used')

console.log(fails === 0 ? '\nAll checks passed.' : `\n${fails} FAILED.`)
process.exit(fails === 0 ? 0 : 1)
