// Client behavior for the Communication Theories section:
//   1. Light/dark theme toggle (scoped to the .theories-skin reading area).
//   2. Reading-progress tracking (per-theory "read" state + index meter).
// State persists in localStorage. Re-runs on every Astro view-transition.

const THEME_KEY = 'aura-theory-theme';
const READ_KEY = 'aura-theory-read';

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(t: Theme): void {
  document.documentElement.classList.toggle('theory-dark', t === 'dark');
}

function syncToggles(t: Theme): void {
  const dark = t === 'dark';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(dark));
    const label = b.querySelector('[data-theme-label]');
    if (label) label.textContent = dark ? 'Light' : 'Dark';
  });
}

function getRead(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    return new Set<string>(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set<string>();
  }
}

function setRead(s: Set<string>): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...s]));
  } catch {
    /* storage blocked; progress simply won't persist */
  }
}

function wireThemeToggle(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => {
      const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      applyTheme(next);
      syncToggles(next);
    });
  });
  syncToggles(getTheme());
}

function renderProgress(): void {
  const read = getRead();

  // Index: flag every element that carries a slug (constellation nodes + list
  // links) and recompute the overall meter from the unique set.
  const slugEls = document.querySelectorAll<HTMLElement>('.theories-skin [data-slug]');
  const unique = new Set<string>();
  slugEls.forEach((el) => {
    const slug = el.dataset.slug || '';
    if (!slug) return;
    unique.add(slug);
    el.classList.toggle('is-read', read.has(slug));
  });

  const meter = document.querySelector<HTMLElement>('[data-progress-meter]');
  if (meter && unique.size > 0) {
    let done = 0;
    unique.forEach((s) => {
      if (read.has(s)) done += 1;
    });
    const pct = Math.round((done / unique.size) * 100);
    const fill = meter.querySelector<HTMLElement>('[data-progress-fill]');
    if (fill) fill.style.width = `${pct}%`;
    const label = meter.querySelector<HTMLElement>('[data-progress-label]');
    if (label) label.textContent = `${done} of ${unique.size} read`;
  }
}

function wireMarkRead(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-mark-read]');
  if (!btn) return;
  const slug = btn.dataset.markRead || '';
  const sync = () => {
    const isRead = getRead().has(slug);
    btn.setAttribute('aria-pressed', String(isRead));
    btn.classList.toggle('is-read', isRead);
    const label = btn.querySelector('[data-mark-label]');
    if (label) label.textContent = isRead ? 'Read' : 'Mark as read';
  };
  if (!btn.dataset.wired) {
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => {
      const r = getRead();
      if (r.has(slug)) r.delete(slug);
      else r.add(slug);
      setRead(r);
      sync();
    });
  }
  sync();
}

// Per-category lens: surface the note for the category the reader arrived from
// (?cat=<key>), mark that category current in the margin, and tint the lens to it.
function initCategoryLens(): void {
  const detail = document.querySelector<HTMLElement>('.t-detail');
  if (!detail) return;
  let lenses: Record<string, { label: string; note: string }> = {};
  try {
    lenses = JSON.parse(detail.dataset.lenses || '{}');
  } catch {
    lenses = {};
  }
  const defaultCat = detail.dataset.defaultCat || '';
  const cat = new URLSearchParams(location.search).get('cat') || defaultCat;

  // Mark the category you arrived from in the margin.
  document.querySelectorAll<HTMLElement>('.m-cats li').forEach((li) => {
    li.classList.toggle('is-current', li.dataset.catKey === cat);
  });

  // Show the lens for that category (fall back to the default if it has none).
  const shownKey = lenses[cat] ? cat : lenses[defaultCat] ? defaultCat : '';
  const lensEl = document.querySelector<HTMLElement>('[data-lens]');
  if (!lensEl) return;
  if (shownKey && lenses[shownKey]) {
    detail.style.setProperty('--lens-c', `var(--c-${shownKey})`);
    const catEl = lensEl.querySelector('[data-lens-cat]');
    const textEl = lensEl.querySelector('[data-lens-text]');
    if (catEl) catEl.textContent = lenses[shownKey].label;
    if (textEl) textEl.textContent = lenses[shownKey].note;
    lensEl.hidden = false;
  } else {
    lensEl.hidden = true;
  }
}

function run(): void {
  applyTheme(getTheme());
  wireThemeToggle();
  renderProgress();
  wireMarkRead();
  initCategoryLens();
}

run();
document.addEventListener('astro:page-load', run);
