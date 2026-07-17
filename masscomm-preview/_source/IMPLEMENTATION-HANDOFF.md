# Implementation & Handoff — who changes what

The Mass Communications team can edit **only the page body** (the Cascade CMS **Content**
field — the WYSIWYG and its `<>` source view, e.g. the ACEJMC page). Everything outside that
box — the department navigation bar, the hero/banner, the sidebar column, the global header and
footer — is **template/chrome maintained by University Marketing & Communications (UMC)** and
requires their approval and implementation.

This document splits every redesign element into **Tier 1 (we can do it in the body)** and
**Tier 2 (UMC must implement)**, with a justification and the code to hand over for each Tier 2 item.

> **Strongest overall justification for the Tier 2 asks:** UMC has *already built and maintains*
> this exact treatment for **Theatre & Dance** on the SIUE "redesign" template
> (`_files/redesign/css/redesign.css` + `redesign.js`): a sticky sub-navigation, a full-width
> hero **video**, and a full-width content grid. We are asking to **adopt the framework UMC
> already runs**, with two small deltas (solid red nav instead of the gradient; the nav kept
> persistent). This is low-effort for UMC and consistent across the College.
> Secondary justification: **WCAG 2.1/2.2 Level AA** conformance (Title II ADA obligation).

---

## Tier 1 — We can implement in the page body (no UMC needed)

Paste-ready HTML goes in the **Content** field's source view. **It must use inline styles**
(the body cannot load an external stylesheet), exactly like the existing ACEJMC table. Images
use the Cascade path form `src="/render/file.act?path=/arts-and-sciences/mass-communications/img/NAME"`.

| Element | Notes |
|---|---|
| Welcome / mission copy, reformatted | Inline-styled headings + paragraphs |
| "Three professional tracks" cards | Inline-styled card grid |
| Section directory cards (Home) | Inline-styled linked cards |
| **"In this section" in-content nav** | Our sidebar-replacement can live at the top of the body as inline-styled pill links — no template change required |
| Stat rows, feature cards, callouts | Inline-styled |
| Data tables (program structure, scholarships, faculty mentors) | Same pattern as the ACEJMC table already in the CMS |
| Breadcrumb on/off | **Page configuration toggle** (already available to us) |

**Body-config items to confirm (may already be ours):** the **Display Columns**
(Both / Left / Right) and **Column Size** (2:7:3 / 3:6:3 / 5:2:5) page-configuration options
appear to control the sidebar column. Removing the sidebar for a single-column body **may be a
config choice we can make ourselves** — worth testing before asking UMC.

### Tier-1 styling — three ways to get CSS into the body
1. **Inline styles** (safest): every element carries its own `style="…"`, like the ACEJMC table.
   Works everywhere; verbose to maintain.
2. **Self-hosted stylesheet** (best if it works): we control **aura-lab.siue.edu** and
   **masscomm-checkout.siue.edu** (campus-served). Host `mc.css` there and pull it into the body via
   a `<style>@import url("https://aura-lab.siue.edu/mc.css")</style>` block (or paste the CSS
   inline). Then body content can use clean **classes** instead of inline styles — **no UMC needed.**
   - **Test first:** paste a tiny `<style>.mc-test{color:#e5182d}</style><p class="mc-test">test</p>`
     into the Content source, save, and preview. TinyMCE-based editors sometimes strip `<style>`/`<link>`.
   - **Scope it:** wrap pasted content in `<div class="mc-body">…</div>` and prefix every rule
     `.mc-body …` so it never touches the SIUE chrome.
   - **Limit:** this styles only what is *inside the body*. It does **not** move the nav, add the
     hero, or remove the sidebar — those are outside the body (still Tier 2).
3. **UMC hosts the stylesheet** site-wide (cleanest long-term, but gated on UMC).

---

## Tier 2 — UMC must implement (outside the body)

For each: the ask, the justification, and where the hand-over code lives.

### 2.1 Department navigation → solid, sticky, persistent 7-item bar
- **Ask:** Replace the current sub-navigation with a solid **SIUE-red** bar (not a gradient) that
  **sticks** to the top on scroll and keeps all 7 links (Home, About, Degrees & Programs, For
  Students, News, Alumni & Friends, Facilities & Services) visible.
- **Justify:** This is the Theatre & Dance `.subnavigation` pattern UMC already maintains — we are
  only requesting a solid fill and a persistent (non-collapsing) variant. Sticky, always-visible
  section nav also directly supports WCAG **3.2.3 Consistent Navigation** and wayfinding once the
  sidebar is removed.
- **Code to hand over:** `assets/mc.css` (`.deptbar` / `.deptnav` rules) + `assets/mc.js`
  (mobile toggle). Contrast verified: white on `#e5182d` = 4.67:1 (AA).

### 2.2 Hero **video** banner (all 7 nav pages)
- **Ask:** Swap the static image header for a full-width muted, looping hero **video** with a
  visible pause control — one clip per nav page.
- **Justify:** Identical to the Theatre & Dance hero UMC already runs (they use a YuJa `<video>`;
  we can supply Vimeo or self-hosted). The **pause control + `prefers-reduced-motion`** we include
  make it WCAG **2.2.2** compliant, and captions/audio description will be added for **1.2.2 / 1.2.5**.
- **Code to hand over:** the `.hero` markup + `.hero-pause` control in any page here, plus the
  `.hero` rules in `mc.css` and the Vimeo-player control in `mc.js`.
- **Video production spec:** see `VIDEO-DESIGN-BRIEF.md` (16:9, safe-area framing, accessibility,
  deliverables) — hand this to the Mass Comm Club and UMC.

### 2.3 Remove the left sidebar / allow full width
- **Ask:** Single-column (no sidebar) body, with occasional full-width sections.
- **Justify:** Our content is text-heavy and reads better center-column with sparing full-width —
  the same grid UMC built for Theatre & Dance (`1fr / 1325px / 1fr`). Removing the sidebar also
  removes a redundant nav now that the section nav is persistent. **First confirm** whether the
  Display Columns config already lets us do this (Tier 1); if not, this is the UMC ask.

### 2.4 (Optional) Adopt the shared stylesheet so the body can use classes
- **Ask:** Host `mc.css` / `mc.js` (or fold our rules into `redesign.css`) so body content can use
  clean classes instead of inline styles.
- **Justify:** Cleaner, consistent, easier to maintain than inline styles in every page. Optional —
  we can ship inline-styled bodies without it.

---

## News page — UMC-fed
The News page content is submitted to UMC and rendered by their news feed; **we do not control
its layout.** The `news.html` mockup here is **illustrative only** — it shows how the current
stories look in the redesign, and can serve as a *request* to UMC to render the Mass Comm feed in
the same card style. It is **not** something we paste into a body field.

---

## What each file in this folder is for
- `index.html` … `facilities-services.html` — the **visual target** and **reference
  implementation** UMC can lift directly (they use `mc.css`/`mc.js`).
- `assets/mc.css`, `assets/mc.js` — the **hand-over code** for the Tier 2 asks.
- `CONTENT-RETENTION-PLAN.md` — what current content goes where.
- `ACCESSIBILITY.md` — the WCAG 2.1/2.2 AA conformance mapping (the compliance justification).
- `IMPLEMENTATION-HANDOFF.md` — this file.
