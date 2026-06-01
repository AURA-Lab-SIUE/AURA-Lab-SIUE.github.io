import { describe, it, expect } from 'vitest';
import { filterTheories } from '../src/components/theories/filter-theories';
import type { Theory } from '../src/types/theory';

const make = (over: Partial<Theory>): Theory => ({
  slug: over.slug ?? 'x',
  name: over.name ?? 'Theory X',
  categories: over.categories ?? ['Health Communication'],
  summary: over.summary ?? 'A summary of the theory.',
  what_it_is: 'What it is, in enough words to be valid.',
  core_idea: 'The core idea, in enough words to be valid.',
  how_used: 'How it is used, in enough words to be valid.',
  example: 'An example, in enough words to be valid.',
  source_note: 'Adapted by AURA Lab.',
  ...over,
});

const elm = make({
  slug: 'elm',
  name: 'Elaboration Likelihood Model',
  aka: ['ELM'],
  categories: [
    'Health Communication',
    'Interpersonal Communication and Relations',
    'Public Relations / Advertising, Marketing and Consumer Behavior',
  ],
  summary: 'Persuasion splits into two routes.',
});
const hbm = make({
  slug: 'hbm',
  name: 'Health Belief Model',
  categories: ['Health Communication'],
  summary: 'Threat versus benefits and barriers.',
});
const tpb = make({
  slug: 'tpb',
  name: 'Theory of Planned Behavior',
  categories: ['Health Communication', 'Interpersonal Communication and Relations'],
  summary: 'Intention drives behavior.',
});

const all = [elm, hbm, tpb];

describe('filterTheories', () => {
  it('returns all when category is "all" and query is empty', () => {
    expect(filterTheories(all, { category: 'all', query: '' })).toHaveLength(3);
  });

  it('returns the subset matching a selected category', () => {
    const health = filterTheories(all, { category: 'Health Communication', query: '' });
    expect(health.map((t) => t.slug).sort()).toEqual(['elm', 'hbm', 'tpb']);

    const interpersonal = filterTheories(all, {
      category: 'Interpersonal Communication and Relations',
      query: '',
    });
    expect(interpersonal.map((t) => t.slug).sort()).toEqual(['elm', 'tpb']);
  });

  it('places a multi-tagged theory under each of its categories', () => {
    // ELM is tagged Health + Interpersonal + PR. It must appear in all three.
    for (const cat of elm.categories) {
      const result = filterTheories(all, { category: cat, query: '' });
      expect(result.map((t) => t.slug)).toContain('elm');
    }
  });

  it('applies free-text search across name and summary (case-insensitive)', () => {
    expect(filterTheories(all, { category: 'all', query: 'belief' }).map((t) => t.slug)).toEqual([
      'hbm',
    ]);
    expect(filterTheories(all, { category: 'all', query: 'INTENTION' }).map((t) => t.slug)).toEqual(
      ['tpb'],
    );
  });

  it('combines category and text constraints', () => {
    const result = filterTheories(all, {
      category: 'Interpersonal Communication and Relations',
      query: 'planned',
    });
    expect(result.map((t) => t.slug)).toEqual(['tpb']);
  });

  it('returns empty when nothing matches', () => {
    expect(filterTheories(all, { category: 'all', query: 'zzzznomatch' })).toHaveLength(0);
  });
});
