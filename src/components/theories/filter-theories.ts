// Pure filter logic for the theories index. Kept separate from React so it is
// trivially unit-testable and reusable.
import type { Theory, TheoryCategory } from '../../types/theory';
import { searchHaystack } from './theory-utils';

export interface FilterState {
  /** Selected category, or 'all'. */
  category: TheoryCategory | 'all';
  /** Free-text query (case-insensitive). Empty = no text constraint. */
  query: string;
}

/**
 * Returns the subset of theories matching the filter.
 * A theory matches the category constraint if it is tagged with that category
 * (so a multi-tagged theory matches under each of its categories). Text query
 * matches name, summary, aka, and category labels.
 */
export function filterTheories(theories: Theory[], state: FilterState): Theory[] {
  const q = state.query.trim().toLowerCase();
  return theories.filter((t) => {
    const catMatch = state.category === 'all' || t.categories.includes(state.category);
    const textMatch = q === '' || searchHaystack(t).includes(q);
    return catMatch && textMatch;
  });
}

/** True if a single theory passes the filter (used for show/hide of rendered cards). */
export function matchesFilter(theory: Theory, state: FilterState): boolean {
  return filterTheories([theory], state).length === 1;
}
