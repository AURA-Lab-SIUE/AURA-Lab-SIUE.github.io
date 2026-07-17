# Accessibility conformance notes — Mass Communications redesign

Target: **WCAG 2.1 and 2.2, Level AA** (per Title II ADA obligation for public universities).
The shared design system lives in `assets/mc.css` + `assets/mc.js`; every page inherits it.

## How each requirement is met

**Color contrast (1.4.3 / 1.4.11)**
- Body text `#262626` and muted text `#5c5c5c` on white = ~13:1 and ~6.5:1.
- White on SIUE red `#e5182d` = **4.67:1** (passes AA for normal text); used for the nav bar and buttons.
- Brand tokens defined once in `:root`; no low-contrast grey text (old `#8a8a8a`/`#c9c7c4` replaced).

**Keyboard navigation & visible focus (2.1.1, 2.4.7)**
- No `outline:none` anywhere. A visible `:focus-visible` ring (`3px solid #0b57d0`, offset) is defined for every interactive element, switching to white on the red bar / dark hero for contrast.
- A real **"Skip to main content"** link is the first focusable element and becomes visible on focus.
- Mobile department menu is a real `<button>` with `aria-expanded`/`aria-controls`.

**Media (1.4.2, 2.2.2, 2.3.1) — the hero video**
- Every nav page's hero video is **muted** (no audio → 1.4.2 not triggered) and **looping**.
- Each has a persistent, keyboard-operable **Pause / Play** control (`.hero-pause`, ≥44px, `aria-pressed`) driven by the Vimeo Player API → satisfies **2.2.2 Pause, Stop, Hide**.
- **`prefers-reduced-motion`** is honored: the video starts **paused** and the button reads "Play"; all transitions collapse. A poster image sits behind the video as a fallback.
- Nothing flashes → 2.3.1 satisfied.
- *Production to-do:* real hero videos should ship with **captions and audio descriptions** (1.2.2 / 1.2.5) — the department chair specifically wants to showcase this; Vimeo supports text tracks and AD.

**Images / text alternatives (1.1.1)**
- Every content `<img>` has a meaningful `alt`. Decorative SIUE chrome icons use `alt=""`.

**Semantic structure & headings (1.3.1, 2.4.6)**
- Native landmarks: `<main id="main">`, `<nav aria-label>`, `<section aria-label…>`, `<article>`, plus the SIUE `<footer>` chrome.
- Exactly **one `<h1>` per page** (the hero title). Headings then descend `h2 → h3` with **no skipped levels**. No font-weight fakes.
- Tables use `<caption>`, `<thead>`, and `<th scope="col">`.

**Descriptive links (2.4.4)**
- No "click here / read more / link." Examples: "Read the full story: Mass Comm Week 2026", "See undergraduate degree requirements", "Meet the faculty & staff". Section cards carry an `aria-label` naming the destination.

**Touch targets (2.5.5 / 2.5.8)**
- Nav links, buttons, pills, tabs, and the back-to-top control are all **≥44×44px** (min-height set; padding where needed).

**Resizable text / relative units (1.4.4, 1.4.12)**
- Root is `100%` (16px); all sizing uses `rem`/`em`/`clamp()`. No fixed `px` font sizes that block zoom.

**Consistent navigation & current location (3.2.3, 2.4.8)**
- The 7-item department bar is identical and persistent on every page. The current page is marked `aria-current="page"` (bar + "In this section"). Breadcrumbs on interior pages.

## Verify before publishing
Run automated checks (axe DevTools / WAVE / Lighthouse) plus a manual keyboard-only pass and a
screen-reader pass (NVDA or VoiceOver) on the live Cascade output. Add captions + audio
description to production hero videos. Confirm the SIUE global chrome (header/footer/arc-menu),
which is inherited and outside this redesign, also meets AA on the live site.
