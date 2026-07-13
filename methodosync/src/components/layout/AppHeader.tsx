/**
 * The shared AURA Lab chrome, ported to React so MethodoSync reads as one
 * continuous surface with the Astro site. Top bar = the site's Nav (wordmark +
 * the single SIUE-red tick + links back to the site). Below it, a titled band
 * that names the tool and states what it does.
 */
export function AppHeader() {
  const siteLinks = [
    { href: '/research/', label: 'Research' },
    { href: '/tools/', label: 'Tools' },
    { href: '/students/', label: 'New Students' },
    { href: '/join/', label: 'Join' },
  ]

  return (
    <header>
      {/* Site top bar */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--paper) 84%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3.5 md:px-8">
          <a href="/" className="inline-flex items-baseline gap-2.5">
            <span
              aria-hidden="true"
              style={{
                width: 9,
                height: 9,
                background: 'var(--siue)',
                transform: 'rotate(45deg)',
                borderRadius: 1,
                alignSelf: 'center',
              }}
            />
            <span className="font-display text-[1.15rem] font-extrabold tracking-tight text-ink">
              AURA&nbsp;Lab
            </span>
            <span className="hidden font-sans text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:inline">
              SIUE&nbsp;·&nbsp;Mass&nbsp;Communications
            </span>
          </a>
          <nav aria-label="AURA Lab site" className="hidden md:block">
            <ul className="flex gap-5 lg:gap-6">
              {siteLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="link-underline font-sans text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Tool title band */}
      <div className="mx-auto max-w-page px-4 pt-12 pb-6 md:px-8">
        <p className="seclabel mb-4">A methods instrument · qualitative → quantitative</p>
        <h1 className="font-display text-5xl leading-none md:text-6xl">MethodoSync</h1>
        <p className="mt-5 max-w-measure font-serif text-lg text-ink-soft md:text-xl">
          Code a YouTube video moment by moment, cluster what you find into
          categories and themes, and turn them into a rigorous quantitative
          codebook — one continuous, saveable workflow. Everything stays in your
          browser.
        </p>
      </div>
    </header>
  )
}
