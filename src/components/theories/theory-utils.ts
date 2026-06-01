// Shared helpers for the theories scene cards + filter.
import { CATEGORY_KEY, type Theory, type TheoryCategory } from '../../types/theory';

/** CSS var name for a category's light (parchment) color, e.g. var(--c-health). */
export function categoryColorVar(category: TheoryCategory): string {
  return `var(--c-${CATEGORY_KEY[category]})`;
}

/**
 * Abbreviation for the card chip. Uses explicit aka uppercase token if present,
 * otherwise initials of the significant words in the name (max 4 letters).
 */
export function abbreviate(theory: Theory): string {
  const akaShort = theory.aka?.find((a) => /^[A-Z]{2,5}$/.test(a));
  if (akaShort) return akaShort;
  const stop = new Set(['of', 'the', 'and', 'a', 'an', 'in', 'to', 'for']);
  const initials = theory.name
    .split(/\s+/)
    .filter((w) => w && !stop.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (initials || theory.name.slice(0, 3)).slice(0, 4);
}

/** Big decorative glyph: first letter of the name. */
export function glyph(theory: Theory): string {
  return theory.name.trim().charAt(0).toUpperCase();
}

/** Lowercase, trimmed search haystack for a theory. */
export function searchHaystack(theory: Theory): string {
  return [theory.name, theory.summary, ...(theory.aka ?? []), ...theory.categories]
    .join(' ')
    .toLowerCase();
}
