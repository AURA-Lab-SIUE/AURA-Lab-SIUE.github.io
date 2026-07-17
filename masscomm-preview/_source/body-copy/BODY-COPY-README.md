# Cascade body copy — deployment & adaptation

Files here:
- `about-body-BEST.html` — the **best-case** (class-based) body for the About page's Content field.
- `mc-body.css` — the scoped stylesheet the best case depends on.
- `_preview.html` — local preview harness (loads `mc-body.css` + the body content so you can see it render).

The **body** is only the content that goes *inside* Cascade's Content field. The department nav,
hero, sidebar, and footer are **not** here — they're template/chrome (UMC, Tier 2). See
`../IMPLEMENTATION-HANDOFF.md`.

> **Heading rule:** the template already outputs `<h1>` (department) and `<h2>` (page title), so the
> body starts at **`<h3>`**. Do not add h1/h2 to the body.

---

## Three CSS-delivery scenarios (best → worst)

### BEST — self-host the stylesheet (no UMC needed)
1. Upload `mc-body.css` to a domain we control, e.g. `https://aura-lab.siue.edu/mc-body.css`.
2. **Run the survival test** in Cascade: open a page's Content source (`<>`), paste
   `<style>.mc-test{color:#e5182d}</style><p class="mc-test">test</p>`, Save, **Preview Draft**.
   - "test" shows **red** → `<style>` survives → proceed.
   - "test" is **black** / the tag vanished → the editor strips `<style>`; go to WORST case.
3. Paste `about-body-BEST.html` into the Content source. Keep its `<style>@import…>` line.

### GOOD — UMC hosts the stylesheet site-wide
If UMC adds `mc-body.css` (or folds it into `redesign.css`), **delete the `<style>@import…>` line**
from `about-body-BEST.html` and paste the rest. Classes still resolve.

### WORST — inline styles (no external CSS, `<style>` stripped)
Convert every class to an inline `style="…"` attribute (like the existing ACEJMC table). The markup
and text stay identical; only styling moves inline. This is mechanical — use the map below. Ask and
I can generate the full `about-body-INLINE.html` in one pass.

---

## Worst-case conversion map (class → inline style)

Apply the style string to each element carrying that class. Drop the `class="…"`.

| Class | Inline `style="…"` |
|---|---|
| `mc-lead` (on `<p>`) | `font-size:1.2rem;color:#1a1a1a;line-height:1.6;margin:0 0 1.1rem;` |
| `<h3>` | `font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:1.6rem;color:#1a1a1a;margin:2.2rem 0 .6rem;` |
| `<h4>` | `font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:1.25rem;color:#a5111e;margin:1.6rem 0 .4rem;` |
| body `<a>` | `color:#a5111e;` |
| body `<img>` | `max-width:100%;height:auto;display:block;border-radius:.5rem;margin:1.4rem 0;` |
| `mc-insection` (wrapper) | `display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;border-top:1px solid #d7d7d7;border-bottom:1px solid #d7d7d7;padding:.7rem 0;margin:0 0 1.8rem;` |
| `mc-insection .lbl` | `font-weight:700;text-transform:uppercase;letter-spacing:.07em;font-size:.7rem;color:#5c5c5c;margin-right:.3rem;` |
| `mc-insection a` | `text-decoration:none;font-weight:700;font-size:.9rem;color:#1a1a1a;padding:.5rem 1rem;min-height:44px;display:inline-flex;align-items:center;border:1px solid #d7d7d7;border-radius:999px;` |
| `mc-insection a[aria-current]` | add `background:#e5182d;color:#fff;border-color:#e5182d;` |
| `mc-stats` (wrapper) | `display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin:1rem 0 1.5rem;` |
| `mc-stat` | `text-align:center;padding:.8rem .4rem;` |
| `mc-stat b` | `display:block;font-family:'Source Serif 4',Georgia,serif;font-weight:700;color:#a5111e;font-size:2.2rem;line-height:1;` |
| `mc-stat span` | `color:#5c5c5c;font-size:.95rem;` |
| `mc-cards` (wrapper) | `display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem;margin:1.2rem 0;` |
| `mc-card` | `border:1px solid #d7d7d7;border-top:4px solid #e5182d;display:flex;flex-direction:column;` |
| `mc-card img` | `width:100%;height:9.5rem;object-fit:cover;margin:0;border-radius:0;` |
| `mc-card .pad` | `padding:1.1rem 1.2rem 1.3rem;display:flex;flex-direction:column;flex:1;` |
| `mc-card p` | `color:#5c5c5c;font-size:.98rem;margin:0 0 1rem;flex:1;` |
| `mc-card .more` | `font-weight:700;color:#a5111e;text-decoration:none;margin-top:auto;display:inline-flex;min-height:44px;align-items:center;` |
| `mc-table` | `border-collapse:collapse;width:100%;margin:1rem 0;font-size:1rem;` |
| `mc-table th/td` | `border:1px solid #d7d7d7;padding:.6rem .7rem;text-align:left;vertical-align:top;` (th adds `background:#f5f4f2;`) |
| `mc-btn-red` | `display:inline-flex;align-items:center;min-height:44px;padding:.55rem 1.3rem;border-radius:3px;font-weight:700;text-decoration:none;background:#e5182d;color:#fff;` |
| `mc-btn-outline` | `…same box…;border:2px solid #e5182d;color:#a5111e;background:#fff;` |

> Inline styles can't hold `:hover`, `:focus-visible`, or `@media` (responsive) rules. Trade-offs in
> worst case: no hover states, and the grids won't reflow on small screens unless UMC's column is
> already narrow. Accessibility is unaffected — contrast, alt text, heading order, ≥44px padding,
> and descriptive links are all baked into the markup, not the CSS.

### Worked example — the stat row
**Best (class):**
```html
<div class="mc-stats"><div class="mc-stat"><b>13</b><span>Full-time faculty</span></div> … </div>
```
**Worst (inline):**
```html
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin:1rem 0 1.5rem;">
  <div style="text-align:center;padding:.8rem .4rem;">
    <b style="display:block;font-family:'Source Serif 4',Georgia,serif;font-weight:700;color:#a5111e;font-size:2.2rem;line-height:1;">13</b>
    <span style="color:#5c5c5c;font-size:.95rem;">Full-time faculty</span>
  </div> …
</div>
```

---

## Accessibility holds in all three scenarios
Semantic tags, `<h3>`→`<h4>` order (under the template's h1/h2), `alt` on every image, descriptive
link text, ≥44px targets (padding is in the markup path too), and AA contrast are properties of the
**markup**, not the delivery method. Verify with a keyboard pass + axe/WAVE after pasting.

## Note on content
The stat row uses **13** faculty (the About page's own figure); reconcile against the "11" that
appears elsewhere before publishing (see `../CONTENT-RETENTION-PLAN.md` §4).
