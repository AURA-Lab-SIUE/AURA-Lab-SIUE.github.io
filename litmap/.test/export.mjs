import { computeSaturation } from './lib/saturation.js'
import { buildMvlr } from './lib/mvlr.js'
import { buildMarkdown } from './lib/markdownBuilder.js'

const searches = [{ id: 'q1', date: '2026-09-15', database: 'Communication & Mass Media Complete',
  queryString: '(livestream* OR "live streaming" OR Twitch) AND (motivation* OR gratification*) AND (viewer* OR chat)',
  limiters: '', nResults: 184, nKept: 6, createdAt: 1 }]

const base = { doi: '', url: '', keystone: false, effectSize: '', effectN: '',
  relevant: true, notes: '', constructX: '', constructY: '', direction: 'na' }

const sources = [
  { ...base, id: 'a', authors: ['Hamilton', 'Garretson', 'Kerne'], year: '2014',
    title: 'Streaming on Twitch: Fostering participatory communities of play within live mixed media',
    container: 'Proceedings of the SIGCHI Conference on Human Factors in Computing Systems',
    doi: '10.1145/2556288.2557048', keystone: true,
    foundVia: { kind: 'search', ref: 'q1' }, population: 'Twitch viewers and streamers',
    context: 'Twitch', theory: 'Third place', method: 'ethnography',
    finding: 'Twitch streams operate as virtual third places where informal communities form rather than as broadcasts to be passively consumed',
    constructX: 'stream participation', constructY: 'community formation',
    citedFoundational: ['Oldenburg 1989'], examinedAt: 1, createdAt: 1 },
  { ...base, id: 'b', authors: ['Sjöblom', 'Hamari'], year: '2017',
    title: 'Why do people watch others play video games?', container: 'Computers in Human Behavior',
    doi: '10.1016/j.chb.2016.10.019', foundVia: { kind: 'search', ref: 'q1' },
    population: 'Twitch viewers and streamers', context: 'Twitch',
    theory: 'Uses and gratifications', method: 'survey',
    finding: 'social and tension-release motivations were central to why people watched others play video games',
    constructX: 'social motivation', constructY: 'hours watched', direction: 'positive',
    citedFoundational: ['Katz et al. 1973', 'Hamilton et al. 2014'], examinedAt: 2, createdAt: 2 },
  { ...base, id: 'c', authors: ['Hilvert-Bruce', 'Neill', 'Sjöblom', 'Hamari'], year: '2018',
    title: 'Social motivations of live-streaming viewer engagement on Twitch',
    container: 'Computers in Human Behavior', doi: '10.1016/j.chb.2018.02.013',
    foundVia: { kind: 'forward', ref: 'b' }, population: 'Twitch viewers and streamers',
    context: 'Twitch', theory: 'Uses and gratifications', method: 'survey',
    finding: 'social interaction and a sense of community predicted not just watching but chatting, subscribing and returning',
    constructX: 'social motivation', constructY: 'chat engagement', direction: 'positive',
    effectSize: 'β = .31', effectN: '2,227',
    citedFoundational: ['Katz et al. 1973', 'Sjöblom & Hamari 2017'], examinedAt: 3, createdAt: 3 },
  { ...base, id: 'd', authors: ['Wulf', 'Schneider', 'Beckert'], year: '2020',
    title: 'Watching players: An exploration of media enjoyment on Twitch',
    container: 'Games and Culture', foundVia: { kind: 'other', ref: null },
    population: '', context: '', theory: '', method: '', finding: '',
    relevant: false, notes: 'enjoyment, not participation | pipe test',
    citedFoundational: [], examinedAt: 4, createdAt: 4 },
]

const saturation = computeSaturation(sources, searches, false)
const mvlr = buildMvlr(sources, ['a', 'b', 'c'])
console.log(buildMarkdown({
  projectTitle: 'Chat participation across stream categories',
  topic: 'I am interested in Twitch chat.',
  sources, searches, saturation, mvlr,
  gapSentence: 'All three describe what viewers say motivates them rather than what they do, leaving open whether the behavioural traces in a chat log show the same pattern.',
}))
