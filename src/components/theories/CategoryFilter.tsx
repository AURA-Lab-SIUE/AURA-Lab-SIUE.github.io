import { useEffect, useRef, useState } from 'react';
import {
  CATEGORY_KEY,
  CATEGORY_SHORT,
  THEORY_CATEGORIES,
  type Theory,
  type TheoryCategory,
} from '../../types/theory';
import { matchesFilter, type FilterState } from './filter-theories';

interface Props {
  /** Full theory list (same data the page server-rendered the cards from). */
  theories: Theory[];
}

/**
 * Filter rail (9 categories + free-text search) for the theory index.
 *
 * The cards themselves are server-rendered by index.astro and exist in the DOM
 * regardless of JS. This island only toggles their visibility (the `hidden`
 * attribute) plus the per-section counts/empty states. With JS off, every card
 * stays visible. The rail UI itself defaults to "All" pressed.
 */
export default function CategoryFilter({ theories }: Props) {
  const [category, setCategory] = useState<TheoryCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const state: FilterState = { category, query };

  // Apply the filter to the already-rendered DOM cards + section visibility.
  useEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const bySlug = new Map(theories.map((t) => [t.slug, t]));

    // Per-card show/hide. Each rendered card carries data-slug + data-cat.
    doc.querySelectorAll<HTMLElement>('.t-grid .scene').forEach((el) => {
      const slug = el.dataset.slug;
      const cardCat = el.dataset.cat as TheoryCategory | undefined;
      const theory = slug ? bySlug.get(slug) : undefined;
      if (!theory || !cardCat) return;
      // A card is shown when the theory passes the text filter AND
      // (the selected category is 'all' OR this card's section is the selected one).
      const passesText = matchesFilter(theory, { category: 'all', query });
      const passesCat = category === 'all' || cardCat === category;
      el.hidden = !(passesText && passesCat);
    });

    // Per-section counts + empty state, and hide a whole section when empty.
    doc.querySelectorAll<HTMLElement>('[data-cat-section]').forEach((section) => {
      const visible = section.querySelectorAll<HTMLElement>('.scene:not([hidden])').length;
      const countEl = section.querySelector<HTMLElement>('[data-count]');
      if (countEl) {
        countEl.textContent = `${visible} ${visible === 1 ? 'scene' : 'scenes'} shown`;
      }
      section.hidden = visible === 0;
    });

    // Global "no results" message.
    const totalVisible = doc.querySelectorAll('.t-grid .scene:not([hidden])').length;
    const emptyEl = doc.querySelector<HTMLElement>('[data-global-empty]');
    if (emptyEl) emptyEl.hidden = totalVisible !== 0;
  }, [category, query, theories]);

  return (
    <div className="t-rail-inner" ref={rootRef}>
      <span className="t-rail-label">Categories</span>
      <button
        type="button"
        className="cat-btn"
        aria-pressed={category === 'all'}
        style={{ ['--c' as string]: 'var(--ink)' }}
        onClick={() => setCategory('all')}
      >
        <span
          className="bar"
          style={{ background: 'linear-gradient(90deg,var(--c-tech),var(--c-pr))' }}
        />
        All
      </button>
      {THEORY_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className="cat-btn"
          aria-pressed={category === cat}
          style={{ ['--c' as string]: `var(--c-${CATEGORY_KEY[cat]})` }}
          onClick={() => setCategory((c) => (c === cat ? 'all' : cat))}
        >
          <span className="bar" />
          {CATEGORY_SHORT[cat]}
        </button>
      ))}
      <span className="t-search">
        <label className="sr-only" htmlFor="theory-search">
          Search theories
        </label>
        <input
          id="theory-search"
          type="search"
          placeholder="Search theories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </span>
    </div>
  );
}
