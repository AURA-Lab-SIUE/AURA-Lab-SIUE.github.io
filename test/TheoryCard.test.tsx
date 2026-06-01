import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TheoryCard from '../src/components/theories/TheoryCard';
import type { Theory } from '../src/types/theory';

afterEach(cleanup);

const elm: Theory = {
  slug: 'elaboration-likelihood-model',
  name: 'Elaboration Likelihood Model',
  aka: ['ELM'],
  categories: ['Health Communication', 'Interpersonal Communication and Relations'],
  summary: 'Persuasion splits into two routes: deep thinking, or quick cues.',
  what_it_is: 'A dual-process account of persuasion with enough words.',
  core_idea: 'Persuasion is two processes, central and peripheral routes.',
  how_used: 'Used to design and test persuasive health and ad messages.',
  example: 'A vaccine campaign uses evidence for engaged parents.',
  source_note: 'Adapted by AURA Lab from University of Twente.',
};

describe('TheoryCard', () => {
  it('renders name, summary, and category chip', () => {
    render(<TheoryCard theory={elm} category="Health Communication" />);
    expect(screen.getByText('Elaboration Likelihood Model')).toBeInTheDocument();
    expect(screen.getByText(/Persuasion splits into two routes/)).toBeInTheDocument();
    // Short category label appears in the chip.
    expect(screen.getByText('Health Communication')).toBeInTheDocument();
  });

  it('links to the correct detail page', () => {
    render(<TheoryCard theory={elm} category="Health Communication" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/theories/elaboration-likelihood-model');
  });

  it('shows the abbreviation from aka', () => {
    render(<TheoryCard theory={elm} category="Health Communication" />);
    expect(screen.getByText('ELM')).toBeInTheDocument();
  });

  it('uses the rendered category for the chip when multi-tagged', () => {
    render(<TheoryCard theory={elm} category="Interpersonal Communication and Relations" />);
    // Short label for Interpersonal category.
    expect(screen.getByText('Interpersonal & Relations')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-cat', 'Interpersonal Communication and Relations');
  });
});
