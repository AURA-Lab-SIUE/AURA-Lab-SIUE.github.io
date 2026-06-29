// Interaction layer for the theories constellation (index macroview).
// Progressive enhancement only: the nodes are real <a> links and the full list
// below works with JS off. This adds pan, zoom, click-to-zoom on a cluster,
// hover-linking, and search. Re-runs on every Astro view-transition.
//
// All panning/zooming is done in the SVG's viewBox coordinate space (0..W,
// 0..H), converting pointer positions through the rendered geometry so a drag
// tracks the cursor 1:1 regardless of how the viewBox is letterboxed.

const W = 1200, H = 820; // must match the viewBox in index.astro
const MIN = 0.6, MAX = 4.5, LABEL_K = 1.6;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

function initConstellation(): void {
  const root = document.querySelector<HTMLElement>('[data-constellation]');
  if (!root || root.dataset.wired) return;
  root.dataset.wired = '1';

  const svg = root.querySelector<SVGSVGElement>('.net-canvas');
  const g = root.querySelector<SVGGElement>('[data-net-zoom-group]');
  if (!svg || !g) return;

  const pose = { x: 0, y: 0, k: 1 };
  const apply = () => {
    g.setAttribute('transform', `translate(${pose.x} ${pose.y}) scale(${pose.k})`);
    g.classList.toggle('is-zoomed', pose.k >= LABEL_K);
  };

  // rendered-geometry helpers: map screen px → viewBox units
  const metrics = () => {
    const rect = svg.getBoundingClientRect();
    const k0 = Math.min(rect.width / W, rect.height / H);
    return { rect, k0, offX: (rect.width - W * k0) / 2, offY: (rect.height - H * k0) / 2 };
  };
  const toVB = (clientX: number, clientY: number) => {
    const { rect, k0, offX, offY } = metrics();
    return { x: (clientX - rect.left - offX) / k0, y: (clientY - rect.top - offY) / k0 };
  };

  // ---- pan (drag empty space; nodes & clusters keep their own clicks) ----
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false, kd = 1;
  svg.addEventListener('pointerdown', (e) => {
    const t = e.target as Element;
    if (t.closest('.net-node') || t.closest('.net-cluster')) return;
    dragging = true; moved = false;
    sx = e.clientX; sy = e.clientY; ox = pose.x; oy = pose.y; kd = metrics().k0;
    g.classList.remove('is-animating');
    root.classList.add('is-panning');
    try { svg.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 3) moved = true;
    pose.x = ox + (e.clientX - sx) / kd;
    pose.y = oy + (e.clientY - sy) / kd;
    apply();
  });
  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-panning');
    try { svg.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  // ---- zoom about a viewBox point ----
  const zoomAbout = (vx: number, vy: number, factor: number) => {
    const k = clamp(pose.k * factor);
    const ratio = k / pose.k;
    pose.x = vx - (vx - pose.x) * ratio;
    pose.y = vy - (vy - pose.y) * ratio;
    pose.k = k;
    apply();
  };
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    g.classList.remove('is-animating');
    const p = toVB(e.clientX, e.clientY);
    zoomAbout(p.x, p.y, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });
  const zoomCenter = (factor: number) => {
    const { rect } = metrics();
    const p = toVB(rect.left + rect.width / 2, rect.top + rect.height / 2);
    g.classList.remove('is-animating');
    zoomAbout(p.x, p.y, factor);
  };
  root.querySelector('[data-net-zoom="in"]')?.addEventListener('click', () => zoomCenter(1.3));
  root.querySelector('[data-net-zoom="out"]')?.addEventListener('click', () => zoomCenter(1 / 1.3));

  // ---- animated move (cluster zoom / reset) ----
  let animTimer = 0;
  const animateTo = (x: number, y: number, k: number) => {
    g.classList.add('is-animating');
    pose.x = x; pose.y = y; pose.k = clamp(k);
    apply();
    window.clearTimeout(animTimer);
    animTimer = window.setTimeout(() => g.classList.remove('is-animating'), 620);
  };

  const nodes = Array.from(root.querySelectorAll<SVGAElement>('.net-node'));
  const edges = Array.from(g.querySelectorAll<SVGLineElement>('.net-edge'));
  nodes.forEach((n) => { if (!n.dataset.href0) n.dataset.href0 = n.getAttribute('href') || ''; });
  nodes.forEach((a) => a.addEventListener('click', (e) => { if (moved) e.preventDefault(); }));

  // ---- hover-linking: light a node's edges ----
  nodes.forEach((node) => {
    const slug = node.dataset.slug || '';
    const lite = () => edges.forEach((ed) =>
      ed.classList.toggle('is-lit', ed.dataset.edgeNode === slug || ed.dataset.edgeA === slug || ed.dataset.edgeB === slug));
    const unlite = () => { if (!activeCat) edges.forEach((ed) => ed.classList.remove('is-lit')); };
    node.addEventListener('mouseenter', lite);
    node.addEventListener('focus', lite);
    node.addEventListener('mouseleave', unlite);
    node.addEventListener('blur', unlite);
  });

  // ---- cluster: zoom into a field + dim the rest ----
  let activeCat = '';
  const clusters = Array.from(root.querySelectorAll<SVGGElement>('.net-cluster'));
  const clearFocus = () => {
    activeCat = '';
    g.classList.remove('has-focus');
    nodes.forEach((n) => { n.classList.remove('is-lit'); n.setAttribute('href', n.dataset.href0 || ''); });
    edges.forEach((ed) => ed.classList.remove('is-lit'));
    clusters.forEach((c) => c.classList.remove('is-active'));
  };
  const focusCat = (key: string) => {
    activeCat = key;
    g.classList.add('has-focus');
    nodes.forEach((n) => {
      const inCat = (n.dataset.cats || '').split(' ').includes(key);
      n.classList.toggle('is-lit', inCat);
      const base = (n.dataset.href0 || '').split('?')[0];
      if (inCat && base) n.setAttribute('href', `${base}?cat=${key}`);
    });
    edges.forEach((ed) => ed.classList.toggle('is-lit', ed.dataset.edgeCat === key));
    clusters.forEach((c) => c.classList.toggle('is-active', c.dataset.cluster === key));
  };
  const zoomToCluster = (key: string) => {
    const c = clusters.find((cl) => cl.dataset.cluster === key);
    if (!c) return;
    const px = parseFloat(c.dataset.cx || '600');
    const py = parseFloat(c.dataset.cy || '400');
    const kT = 2.0;
    animateTo(W / 2 - kT * px, H / 2 - kT * py, kT);
  };
  const activateCluster = (key: string) => {
    if (activeCat === key) { clearFocus(); animateTo(0, 0, 1); return; }
    focusCat(key);
    zoomToCluster(key);
  };
  clusters.forEach((c) => {
    const key = c.dataset.cluster || '';
    c.addEventListener('click', () => activateCluster(key));
    c.addEventListener('dblclick', () => activateCluster(key));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCluster(key); }
    });
  });

  // ---- search: light matches on the map, hide non-matches in the list ----
  const searchEl = root.querySelector<HTMLInputElement>('[data-net-search]');
  const listItems = Array.from(document.querySelectorAll<HTMLElement>('.t-list-links li[data-haystack]'));
  const emptyEl = document.querySelector<HTMLElement>('[data-global-empty]');
  const runSearch = (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) {
      listItems.forEach((li) => (li.hidden = false));
      if (emptyEl) emptyEl.hidden = true;
      const restore = activeCat;
      clearFocus();
      if (restore) focusCat(restore);
      return;
    }
    clearFocus();
    g.classList.add('has-focus');
    nodes.forEach((n) => n.classList.toggle('is-lit', (n.dataset.haystack || '').includes(q)));
    let listAny = false;
    listItems.forEach((li) => {
      const hit = (li.dataset.haystack || '').includes(q);
      li.hidden = !hit;
      if (hit) listAny = true;
    });
    if (emptyEl) emptyEl.hidden = listAny;
  };
  searchEl?.addEventListener('input', () => runSearch(searchEl.value));

  root.querySelector('[data-net-reset]')?.addEventListener('click', () => {
    clearFocus();
    if (searchEl) { searchEl.value = ''; runSearch(''); }
    animateTo(0, 0, 1);
  });

  apply();
}

initConstellation();
document.addEventListener('astro:page-load', initConstellation);
