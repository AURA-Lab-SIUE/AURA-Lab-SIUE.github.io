// Shadowbox reading view for the constellation. Clicking a star (or a list
// link) opens the theory in a modal over the receding sky instead of a full
// navigation. The standalone /theories/<slug> route is untouched — it is the
// no-JS / direct-link / SEO path, the "View full page" target, and what we
// fetch to fill the modal, so the reading markup lives in exactly one place.
//
// IMPORTANT: the site uses Astro's <ClientRouter/> (view transitions), which
// intercepts same-origin <a> clicks in the bubble phase. We therefore listen
// in the CAPTURE phase and stopImmediatePropagation so the router never turns
// a star click into a page navigation. We also avoid changing the URL, so the
// router's popstate handling stays out of our way; sharing is via the explicit
// full-page link.

const isTheorySlug = (path: string) => /^\/theories\/[^/]+\/?$/.test(path);

function els() {
  const modal = document.querySelector<HTMLElement>('[data-modal]');
  return {
    modal,
    panel: modal?.querySelector<HTMLElement>('[data-modal-panel]') ?? null,
    body: modal?.querySelector<HTMLElement>('[data-modal-body]') ?? null,
    full: modal?.querySelector<HTMLAnchorElement>('[data-modal-full]') ?? null,
  };
}

let lastTrigger: HTMLElement | null = null;

function show() {
  const { modal } = els();
  if (!modal) return;
  modal.hidden = false;
  document.documentElement.classList.add('t-modal-open');
}

function hide() {
  const { modal, body } = els();
  if (!modal) return;
  modal.hidden = true;
  document.documentElement.classList.remove('t-modal-open');
  if (body) body.innerHTML = '<p class="t-modal-loading">Loading…</p>';
  if (lastTrigger && document.contains(lastTrigger)) {
    try { lastTrigger.focus(); } catch { /* ignore */ }
  }
  lastTrigger = null;
}

async function openFor(href: string) {
  const { modal, panel, body, full } = els();
  if (!modal || !panel || !body) return;

  // one history entry represents "a modal is open" — Back returns to the map.
  if (modal.hidden) history.pushState({ theoryModal: true }, '');
  if (full) full.href = href;
  show();
  body.innerHTML = '<p class="t-modal-loading">Loading…</p>';

  // trailing-slash URL so static hosts (GitHub Pages) resolve it
  const [path, query] = href.split('?');
  const fetchUrl = (path.endsWith('/') ? path : path + '/') + (query ? '?' + query : '');

  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(String(res.status));
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const detail = doc.querySelector('.t-detail');
    if (!detail) throw new Error('no .t-detail in fetched page');
    detail.querySelector('.t-toolbar')?.remove(); // modal has its own bar
    body.innerHTML = '';
    body.appendChild(document.importNode(detail, true));
    // re-run the shared client wiring (theme + per-category lens + mark-as-read)
    // and the headline reveal against the freshly injected reading content.
    document.dispatchEvent(new Event('astro:page-load'));
    panel.scrollTop = 0;
    panel.focus();
  } catch {
    window.location.href = href; // anything unexpected: fall back to navigation
  }
}

function closeModal() {
  if (history.state && history.state.theoryModal) history.back();
  else hide();
}

function onClickCapture(e: MouseEvent) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!document.querySelector('[data-modal]')) return; // not on the map page
  const a = (e.target as Element)?.closest?.('a[href]') as HTMLElement | null;
  if (!a) return;
  if (a.hasAttribute('data-modal-full')) return; // explicit "open full page" link
  if (a.hasAttribute('data-modal-close')) return;
  const href = a.getAttribute('href') || '';
  if (!href.startsWith('/theories/')) return;
  if (!isTheorySlug(href.split('?')[0])) return; // the index itself, not a slug
  // Beat Astro's ClientRouter (bubble-phase) before it navigates.
  e.preventDefault();
  e.stopImmediatePropagation();
  lastTrigger = a;
  openFor(href);
}

function onKey(e: KeyboardEvent) {
  const { modal } = els();
  if (e.key === 'Escape' && modal && !modal.hidden) {
    e.preventDefault();
    closeModal();
  }
}

function onPop() {
  // URL is unchanged while the modal is open, so any popstate means "close".
  const { modal } = els();
  if (modal && !modal.hidden) hide();
}

function wireCloseButtons() {
  document.querySelectorAll<HTMLElement>('[data-modal-close]').forEach((b) => {
    if (b.dataset.wired) return;
    b.dataset.wired = '1';
    b.addEventListener('click', closeModal);
  });
}

let bound = false;
function bind() {
  if (!bound) {
    bound = true;
    document.addEventListener('click', onClickCapture, true); // capture phase
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
  }
  wireCloseButtons();
}

bind();
document.addEventListener('astro:page-load', wireCloseButtons);
