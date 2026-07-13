/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:            'var(--bg)',
        surface:       'var(--surface)',
        paper:         'var(--paper)',
        card:          'var(--card)',
        chalk:         'var(--chalk)',
        text:          'var(--text)',
        'text-dark':   'var(--text-dark)',
        ink:           'var(--ink)',
        muted:         'var(--muted)',
        accent:        'var(--accent)',       // fills, borders, large elements
        'accent-text': 'var(--accent-text)',  // small red text
        brick:         'var(--brick)',
        'brick-deep':  'var(--brick-deep)',
        siue:          'var(--siue)',          // institutional mark only
        line:          'var(--line)',
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
};
