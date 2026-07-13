/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Instrument, in warm paper" — shared with the AURA Lab site.
        // See ../../DESIGN-NOTES.md. One warm theme, one calm brick accent;
        // the true SIUE red is reserved for a single institutional mark.
        paper:        'var(--paper)',
        card:         'var(--card)',
        ink:          'var(--ink)',
        'ink-soft':   'var(--ink-soft)',
        brick:        'var(--brick)',
        'brick-deep': 'var(--brick-deep)',
        'brick-wash': 'var(--brick-wash)',
        siue:         'var(--siue)',
        line:         'var(--line)',
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        sans:    ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        serif:   ['"Newsreader Variable"', 'Newsreader', 'Georgia', 'serif'],
        mono:    ['"Spline Sans Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        measure: '68ch',
        page:    '1180px',
      },
      letterSpacing: {
        display: '-0.02em',
        ui:      '0.14em',
      },
    },
  },
  plugins: [],
}
