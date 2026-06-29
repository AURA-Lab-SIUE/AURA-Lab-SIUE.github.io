// TypeScript type for a Communication Theory entry.
// Derived from src/data/theories.schema.json. Keep the two in sync.

/** The nine fixed category labels used across the theories section. */
export const THEORY_CATEGORIES = [
  'Communication and Information Technology',
  'Communication Processes',
  'Health Communication',
  'Interpersonal Communication and Relations',
  'Language Theories and Linguistics',
  'Mass Media',
  'Media, Culture and Society',
  'Organizational Communication',
  'Public Relations / Advertising, Marketing and Consumer Behavior',
] as const;

export type TheoryCategory = (typeof THEORY_CATEGORIES)[number];

export interface Theory {
  /** URL-safe id, used for /theories/<slug>. Matches ^[a-z0-9-]+$. */
  slug: string;
  /** Full theory name. */
  name: string;
  /** Optional alternate names / abbreviations spelled out. */
  aka?: string[];
  /** One or more categories. A theory may appear under each of its categories. */
  categories: TheoryCategory[];
  /** Short index-card blurb. */
  summary: string;
  /** Storyboard prose: what the theory is. */
  what_it_is: string;
  /** Storyboard prose: the core idea. */
  core_idea: string;
  /** Storyboard prose: how it is used. */
  how_used: string;
  /** Storyboard prose: a concrete example. */
  example: string;
  /** Optional verified references. */
  primary_references?: string[];
  /** Attribution / source note. */
  source_note: string;
  /** Optional related theory slugs. */
  related?: string[];

  // ---- Marginalia metadata (optional; shown in the detail-page margin) ----
  /** Who originated the theory, e.g. "Richard Petty & John Cacioppo". */
  originator?: string;
  /** Year or era of origin, e.g. "1986" or "1970s". */
  year?: string;
  /** Key terms a reader should recognize (margin glossary chips). */
  key_terms?: string[];
  /**
   * Per-category "lens" notes: how this theory is framed when read under a
   * given category. Keyed by full category label. Surfaced based on which
   * category the reader arrived from. The shared body stays the same.
   */
  category_notes?: Partial<Record<TheoryCategory, string>>;

  // ---- Deep "learning resource" fields (optional; authored per theory) ----
  /** Scannable gist shown in a callout at the very top of the detail page. */
  tldr?: string;
  /** Key studies and the evidence base (prose). */
  key_studies?: string;
  /** Critiques, limitations, and boundary conditions (prose). */
  critiques?: string;
  /** Applications, including to AURA Lab / SIUE teaching (prose). */
  applications?: string;
  /** Further reading — citations or resource lines. */
  further_reading?: string[];
}

/** Stable short key per category, used for color tokens and filter ids. */
export const CATEGORY_KEY: Record<TheoryCategory, string> = {
  'Communication and Information Technology': 'tech',
  'Communication Processes': 'proc',
  'Health Communication': 'health',
  'Interpersonal Communication and Relations': 'inter',
  'Language Theories and Linguistics': 'lang',
  'Mass Media': 'mass',
  'Media, Culture and Society': 'cult',
  'Organizational Communication': 'org',
  'Public Relations / Advertising, Marketing and Consumer Behavior': 'pr',
};

/** Short display label for compact UI (rail chips, kickers). */
export const CATEGORY_SHORT: Record<TheoryCategory, string> = {
  'Communication and Information Technology': 'Comm & Info Technology',
  'Communication Processes': 'Communication Processes',
  'Health Communication': 'Health Communication',
  'Interpersonal Communication and Relations': 'Interpersonal & Relations',
  'Language Theories and Linguistics': 'Language & Linguistics',
  'Mass Media': 'Mass Media',
  'Media, Culture and Society': 'Media, Culture & Society',
  'Organizational Communication': 'Organizational Comm',
  'Public Relations / Advertising, Marketing and Consumer Behavior':
    'PR / Advertising & Marketing',
};
