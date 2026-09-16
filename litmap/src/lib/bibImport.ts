// Bibliography import — CSL-JSON, BibTeX and RIS, parsed in the browser.
//
// Zotero exports all three (right-click a collection, Export Collection).
// Google Scholar hands out BibTeX one item at a time. Nothing is uploaded:
// the file is read with FileReader and parsed here.
//
// The importer only ever fills the BIBLIOGRAPHIC fields. The analytic fields
// are the student's job, which is the whole point of the exercise.

export interface ImportedRef {
  authors: string[]
  year: string
  title: string
  container: string
  doi: string
  url: string
}

export type BibFormat = 'csl-json' | 'bibtex' | 'ris'

/** Guess the format from the text itself rather than the file extension,
 *  because Zotero writes .json for CSL-JSON and .bib for BibTeX but students
 *  rename files. */
export function detectFormat(text: string): BibFormat | null {
  const t = text.trim()
  if (t.startsWith('[') || t.startsWith('{')) return 'csl-json'
  if (/^\s*@[a-zA-Z]+\s*\{/m.test(t)) return 'bibtex'
  if (/^TY\s+-\s+/m.test(t)) return 'ris'
  return null
}

export function parseBibliography(text: string): ImportedRef[] {
  const fmt = detectFormat(text)
  if (!fmt) {
    throw new Error(
      'That file is not a bibliography LitMap recognises. Export from Zotero as CSL JSON, BibTeX, or RIS.'
    )
  }
  const refs =
    fmt === 'csl-json' ? parseCslJson(text) : fmt === 'bibtex' ? parseBibtex(text) : parseRis(text)
  if (refs.length === 0) {
    throw new Error('That file parsed, but it contained no references.')
  }
  return refs
}

// ── CSL-JSON ──────────────────────────────────────────────────────────

interface CslName { family?: string; literal?: string; name?: string }
interface CslItem {
  title?: string
  author?: CslName[]
  editor?: CslName[]
  issued?: { 'date-parts'?: (string | number)[][]; raw?: string }
  'container-title'?: string
  publisher?: string
  DOI?: string
  URL?: string
}

function parseCslJson(text: string): ImportedRef[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That looked like JSON but would not parse.')
  }
  const items: CslItem[] = Array.isArray(data) ? (data as CslItem[]) : [data as CslItem]
  return items.map((it) => {
    const names = it.author ?? it.editor ?? []
    const dp = it.issued?.['date-parts']?.[0]?.[0]
    return {
      authors: names.map(cslFamily).filter(Boolean),
      year: dp != null ? String(dp) : yearFrom(it.issued?.raw ?? ''),
      title: clean(it.title ?? ''),
      container: clean(it['container-title'] ?? it.publisher ?? ''),
      doi: clean(it.DOI ?? ''),
      url: clean(it.URL ?? ''),
    }
  })
}

function cslFamily(n: CslName): string {
  if (n.family) return clean(n.family)
  const lit = n.literal ?? n.name ?? ''
  // "Sjöblom, Max" or "Max Sjöblom" — take the family name either way.
  if (lit.includes(',')) return clean(lit.split(',')[0])
  const parts = lit.trim().split(/\s+/)
  return clean(parts[parts.length - 1] ?? '')
}

// ── BibTeX ────────────────────────────────────────────────────────────

function parseBibtex(text: string): ImportedRef[] {
  const out: ImportedRef[] = []
  // Walk entries by hand: a brace-counting scan is the only reliable way to
  // find an entry's end, since values legitimately contain braces.
  const re = /@([a-zA-Z]+)\s*\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const kind = m[1].toLowerCase()
    if (kind === 'comment' || kind === 'preamble' || kind === 'string') continue
    const start = re.lastIndex
    let depth = 1
    let i = start
    while (i < text.length && depth > 0) {
      const c = text[i]
      if (c === '\\') { i += 2; continue }
      if (c === '{') depth++
      else if (c === '}') depth--
      i++
    }
    const body = text.slice(start, i - 1)
    const fields = bibtexFields(body)
    re.lastIndex = i
    if (Object.keys(fields).length === 0) continue
    const authorRaw = fields.author || fields.editor || ''
    out.push({
      authors: authorRaw
        ? authorRaw.split(/\s+and\s+/i).map(bibtexFamily).filter(Boolean)
        : [],
      year: yearFrom(fields.year || fields.date || ''),
      title: clean(fields.title ?? ''),
      container: clean(fields.journal || fields.booktitle || fields.publisher || ''),
      doi: clean(fields.doi ?? ''),
      url: clean(fields.url ?? ''),
    })
  }
  return out
}

/** Split an entry body into field: value, honouring braces and quotes. */
function bibtexFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {}
  let i = body.indexOf(',')            // skip the citation key
  if (i < 0) return fields
  i++
  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i++
    const nameStart = i
    while (i < body.length && /[A-Za-z0-9_-]/.test(body[i])) i++
    const name = body.slice(nameStart, i).toLowerCase()
    while (i < body.length && /\s/.test(body[i])) i++
    if (body[i] !== '=') { i++; continue }
    i++
    while (i < body.length && /\s/.test(body[i])) i++
    let value = ''
    if (body[i] === '{') {
      let depth = 1
      i++
      const s = i
      while (i < body.length && depth > 0) {
        if (body[i] === '\\') { i += 2; continue }
        if (body[i] === '{') depth++
        else if (body[i] === '}') depth--
        i++
      }
      value = body.slice(s, i - 1)
    } else if (body[i] === '"') {
      i++
      const s = i
      while (i < body.length && body[i] !== '"') {
        if (body[i] === '\\') i++
        i++
      }
      value = body.slice(s, i)
      i++
    } else {
      const s = i
      while (i < body.length && body[i] !== ',') i++
      value = body.slice(s, i)
    }
    if (name) fields[name] = value.trim()
  }
  return fields
}

function bibtexFamily(name: string): string {
  const n = clean(name)
  if (!n) return ''
  if (n.includes(',')) return clean(n.split(',')[0])
  const parts = n.split(/\s+/)
  return parts[parts.length - 1] ?? ''
}

// ── RIS ───────────────────────────────────────────────────────────────

function parseRis(text: string): ImportedRef[] {
  const out: ImportedRef[] = []
  let cur: Record<string, string[]> | null = null
  for (const rawLine of text.split(/\r?\n/)) {
    const m = /^([A-Z][A-Z0-9])\s+-\s?(.*)$/.exec(rawLine)
    if (!m) continue
    const tag = m[1]
    const value = m[2]
    if (tag === 'TY') { cur = {}; continue }
    if (tag === 'ER') {
      if (cur) out.push(risToRef(cur))
      cur = null
      continue
    }
    if (!cur) continue
    ;(cur[tag] ??= []).push(value.trim())
  }
  if (cur) out.push(risToRef(cur))
  return out
}

function risToRef(f: Record<string, string[]>): ImportedRef {
  const names = f.AU ?? f.A1 ?? f.ED ?? []
  return {
    authors: names
      .map((n) => (n.includes(',') ? clean(n.split(',')[0]) : clean(n.split(/\s+/).pop() ?? '')))
      .filter(Boolean),
    year: yearFrom((f.PY ?? f.Y1 ?? f.DA ?? [''])[0]),
    title: clean((f.TI ?? f.T1 ?? [''])[0]),
    container: clean((f.T2 ?? f.JO ?? f.JF ?? f.PB ?? [''])[0]),
    doi: clean((f.DO ?? [''])[0]),
    url: clean((f.UR ?? [''])[0]),
  }
}

// ── shared cleanup ────────────────────────────────────────────────────

const LATEX: [string, string][] = [
  ['\\"a', 'ä'], ["\\'a", 'á'], ['\\`a', 'à'], ['\\^a', 'â'], ['\\~a', 'ã'], ['\\aa', 'å'],
  ['\\"o', 'ö'], ["\\'o", 'ó'], ['\\`o', 'ò'], ['\\^o', 'ô'], ['\\~o', 'õ'], ['\\o', 'ø'],
  ['\\"u', 'ü'], ["\\'u", 'ú'], ['\\`u', 'ù'], ['\\^u', 'û'],
  ['\\"e', 'ë'], ["\\'e", 'é'], ['\\`e', 'è'], ['\\^e', 'ê'],
  ['\\"i', 'ï'], ["\\'i", 'í'], ['\\`i', 'ì'], ['\\^i', 'î'],
  ['\\c c', 'ç'], ["\\'c", 'ć'], ['\\~n', 'ñ'], ['\\ss', 'ß'],
]

/** Strip BibTeX braces, resolve the common LaTeX accents, squeeze whitespace. */
function clean(s: string): string {
  if (!s) return ''
  let out = s
  for (const pair of LATEX) {
    const tex = pair[0]
    const ch = pair[1]
    out = out.split('{' + tex + '}').join(ch).split(tex).join(ch)
  }
  out = out.replace(/[{}]/g, '')
  out = out.replace(/\\[a-zA-Z]+\s?/g, '')
  return out.replace(/\s+/g, ' ').trim()
}

function yearFrom(s: string): string {
  const m = /(\d{4})/.exec(s ?? '')
  return m ? m[1] : ''
}
