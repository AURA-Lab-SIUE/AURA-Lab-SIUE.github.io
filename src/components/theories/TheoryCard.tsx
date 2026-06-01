import type { Theory, TheoryCategory } from '../../types/theory';
import { CATEGORY_SHORT } from '../../types/theory';
import { abbreviate, categoryColorVar, glyph } from './theory-utils';

interface Props {
  theory: Theory;
  /**
   * Which category context this card is rendered under (a multi-tagged theory
   * renders once per category section). Drives the chip label + color.
   */
  category: TheoryCategory;
}

/**
 * Scene card for the theory index. Renders as a real <a> with all content in the
 * DOM so it is fully visible with zero JS and under prefers-reduced-motion.
 * Entrance animation is CSS-only progressive enhancement (see theories.css).
 */
export default function TheoryCard({ theory, category }: Props) {
  const color = categoryColorVar(category);
  const abbr = abbreviate(theory);
  return (
    <a
      className="scene"
      href={`/theories/${theory.slug}`}
      style={{ ['--c' as string]: color }}
      data-cat={category}
      data-slug={theory.slug}
      aria-label={`${theory.name}, ${category}`}
    >
      <div className="stage-head">
        <span className="cat">
          <span className="dot" aria-hidden="true" />
          {CATEGORY_SHORT[category]}
        </span>
        <span className="abbr">{abbr}</span>
        <span className="glyph" aria-hidden="true">
          {glyph(theory)}
        </span>
      </div>
      <div className="body">
        <h3>{theory.name}</h3>
        <p>{theory.summary}</p>
        <span className="cta">
          View storyboard <span className="arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
}
