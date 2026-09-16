// Regenerate src/data/theories.min.json from the AURA Lab site's own dataset.
//
// The theory explorer at aura-lab.siue.edu/theories/ is the authority. LitMap
// vendors a REDUCED copy (the fields a picker needs, not the full prose) so it
// can filter 55 theories offline without shipping 424 KB.
//
// A vendored copy is a copy, and copies drift: the site's earlier standalone
// theory prototype and its JSON had already drifted apart by a whole theory
// before anyone noticed. Run this whenever the site's theories.json changes,
// and the drift stays bounded to "how long since someone ran it".
//
//   node scripts/sync-theories.mjs
//   node scripts/sync-theories.mjs ../path/to/theories.json   (local file)

import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const REMOTE =
  'https://raw.githubusercontent.com/AURA-Lab-SIUE/AURA-Lab-SIUE.github.io/main/src/data/theories.json'

const FIELDS = ['slug', 'name', 'aka', 'categories', 'summary', 'key_terms', 'originator', 'year', 'related']

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(here, '..', 'src', 'data', 'theories.min.json')

const source = process.argv[2]
const raw = source
  ? await readFile(source, 'utf8')
  : await fetch(REMOTE).then((r) => {
      if (!r.ok) throw new Error(`${REMOTE} returned ${r.status}`)
      return r.text()
    })

const all = JSON.parse(raw)
if (!Array.isArray(all) || all.length === 0) throw new Error('that did not parse as a theory array')

const reduced = all
  .slice()
  .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  .map((t) => Object.fromEntries(FIELDS.filter((f) => f in t).map((f) => [f, t[f]])))

await writeFile(out, JSON.stringify(reduced, null, 0), 'utf8')
console.log(`wrote ${reduced.length} theories to ${path.relative(process.cwd(), out)}`)
