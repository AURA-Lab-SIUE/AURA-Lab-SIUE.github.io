// Turning "I'm interested in Twitch chat" into something you can paste into a
// database.
//
// This is the step Chapter 4 describes and no tool does for students: a broad
// interest has to become concept blocks joined by AND, with synonyms inside
// each block joined by OR. Students who have never done it type their whole
// interest as one phrase, get four results or forty thousand, and conclude the
// literature does not exist.
//
// Everything here is string assembly. There is no vocabulary, no thesaurus and
// no suggestion engine: the synonyms are the student's, because thinking of
// them IS the conceptual work. What the tool contributes is the shape.

export interface ConceptBlock {
  id: string
  /** What this block is about, for the student's own benefit. */
  label: string
  terms: string[]
}

/** Multi-word terms need quoting or the database reads them as two words. */
export function formatTerm(term: string): string {
  const t = term.trim()
  if (!t) return ''
  // Already quoted, or a single word, or a wildcard stem: leave it alone.
  if (/^".*"$/.test(t)) return t
  return /\s/.test(t) ? `"${t}"` : t
}

/** One block becomes (a OR b OR c); a single term needs no parentheses. */
export function formatBlock(block: ConceptBlock): string {
  const terms = block.terms.map(formatTerm).filter(Boolean)
  if (terms.length === 0) return ''
  if (terms.length === 1) return terms[0]
  return `(${terms.join(' OR ')})`
}

/** Blocks joined by AND, one per line, the way the book prints them. */
export function buildSearchString(blocks: ConceptBlock[]): string {
  const parts = blocks.map(formatBlock).filter(Boolean)
  return parts.join(' AND\n')
}

export interface SearchAdvice {
  level: 'ok' | 'warn'
  text: string
}

/**
 * What is structurally wrong with this search, judged only on its shape.
 *
 * No claim is made about whether it will find good work: that depends on the
 * field, and the tool cannot know. These are the four shape mistakes Chapter 4
 * names, and each is checkable.
 */
export function adviseSearch(blocks: ConceptBlock[]): SearchAdvice[] {
  const filled = blocks.filter((b) => b.terms.some((t) => t.trim()))
  const out: SearchAdvice[] = []

  if (filled.length === 0) {
    out.push({ level: 'warn', text: 'Nothing here yet. Start with the thing you are actually curious about.' })
    return out
  }

  if (filled.length === 1) {
    out.push({
      level: 'warn',
      text: 'One concept alone will return far too much. A second concept, joined by AND, is what narrows it.',
    })
  }

  if (filled.length >= 4) {
    out.push({
      level: 'warn',
      text: 'Four or more concepts ANDed together usually returns almost nothing. Drop one and add it back only if you are drowning.',
    })
  }

  const singles = filled.filter((b) => b.terms.filter((t) => t.trim()).length === 1)
  if (singles.length === filled.length && filled.length > 1) {
    out.push({
      level: 'warn',
      text: 'Every block has one term. Scholars name the same idea differently, so a search with no synonyms misses most of the work on your topic.',
    })
  }

  const anyWildcard = filled.some((b) => b.terms.some((t) => t.includes('*')))
  if (!anyWildcard) {
    out.push({
      level: 'ok',
      text: 'Consider a wildcard: stream* catches stream, streams, streaming and streamer in one term.',
    })
  }

  if (filled.length >= 2 && !singles.length) {
    out.push({ level: 'ok', text: 'This is the right shape: concepts ANDed, synonyms ORed inside each.' })
  }

  return out
}
