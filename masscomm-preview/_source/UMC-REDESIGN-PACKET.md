# Mass Communications Website Redesign — Request Packet for University Marketing & Communications

**From:** Department of Mass Communications — Technology Committee
**Re:** Bringing the Mass Communications site to parity with the College's redesign template
**Attachments:** hero videos + poster stills · reference mockups (`index.html` …) · `mc.css` / `mc.js`
· `ACCESSIBILITY.md` · `CONTENT-RETENTION-PLAN.md`

---

## 1. The request in one paragraph
We would like the Mass Communications site brought onto the **same "redesign" template UMC already
maintains for Theatre & Dance** — a solid department navigation bar, a full-width hero **video**, and
a single-column (no-sidebar) content grid. We are **not asking for anything novel**: everything here
is at or below the scope UMC has already built and runs elsewhere in the College. We will handle all
body content ourselves; we need UMC for the chrome that sits outside the editable Content field.

## 2. Scope & precedent — nothing beyond Theatre & Dance
Theatre & Dance already runs on `_files/redesign/css/redesign.css` + `redesign.js` with:
- a sticky **sub-navigation** bar,
- a full-width **hero video** (YuJa `<video>`),
- a full-width **content grid** (`1fr / 1325px / 1fr`).

Our asks map 1:1 to those components, with **two small deltas** noted below. If any item is more than
you want to take on, tell us and we will scale it back to exact Theatre & Dance parity.

## 3. The asks (each with justification)

**A. Department navigation → solid, sticky, persistent.**
Use the existing sub-navigation component, but **(delta 1)** a **solid SIUE red** fill instead of the
gradient, and **(delta 2)** kept **persistent** (all 7 links visible on scroll rather than
collapsing).
*Why:* consistent, always-available section navigation once the sidebar is removed — supports WCAG
**3.2.3 Consistent Navigation**. Contrast verified: white on `#e5182d` = 4.67:1 (AA). Reference
implementation + exact CSS in the attached `mc.css` (`.deptbar`).

**B. Hero video banner (all 7 nav pages).**
Replace the static image header with a full-width **muted, looping** hero video + a visible
**pause control**. We supply the clips (see §5).
*Why:* identical to the Theatre & Dance hero. The pause control + `prefers-reduced-motion` handling
make it WCAG **2.2.2** compliant; the clips are decorative/muted so no captions are required, and we
will add captions/audio description to any sound-on content video. Player must expose a pause/play
API (Vimeo and YuJa both do). Reference in `mc.js` (`.hero-pause`).

**C. Single-column body / occasional full width.**
Remove the left sidebar and allow full-width sections used sparingly (our content stays
center-column). *Why:* text-heavy content reads better center-column; the persistent section nav
makes the sidebar redundant. **Question for you:** can we already do this via the page's Display
Columns / Column Size configuration, or does it need template work? (See §6.)

**D. (Optional) Host our stylesheet site-wide.**
If you host `mc.css` / `mc.js` (or fold our rules into `redesign.css`), our body content can use
clean classes. Optional — otherwise we self-host or inline it.

## 4. Accessibility / compliance basis
Public-university sites must meet **WCAG 2.1 Level AA (ADA Title II)**; we are also targeting **2.2**.
The redesign was built to that bar (semantic HTML, visible focus, alt text, ≥44px targets, AA
contrast, descriptive links, reduced-motion). Full mapping in `ACCESSIBILITY.md`. This is part of
why we want parity with the (accessible) redesign template rather than the older layout.

## 5. What we supply (so there's nothing for you to source)
- **Hero video clips** — 16:9, 1080p/4K, 20–60s seamless loop, muted, no baked-in text,
  center-safe framing, **+ poster stills** (per `VIDEO-DESIGN-BRIEF.md`).
- **Reference mockups** — working `.html` pages showing the exact target, built on `mc.css`/`mc.js`
  you can lift directly.
- **All body content** — we build and maintain it; no content work needed from you.

## 6. Please tell us what is / isn't possible (feasibility questionnaire)
1. Can Mass Communications be onboarded to the **redesign template** (as Theatre & Dance is)? If so,
   what is your typical **timeline and process**?
2. Sub-navigation: can it be a **solid red** fill (not gradient)? Yes / No / With changes: ____
3. Sub-navigation: can it stay **persistent** (7 links visible on scroll) rather than collapse?
   Yes / No / With changes: ____
4. Hero video: can we supply clips via **Vimeo or YuJa** (or self-hosted MP4)? Which do you prefer?
5. Hero video: any **required specs** on your side beyond our brief (max length, file size, captions)?
6. Sidebar removal / full width: **config-level (ours)** or **template-level (yours)**?
7. Can you **host `mc.css` / `mc.js`** (or merge into `redesign.css`), or should we **self-host**
   (e.g., on aura-lab.siue.edu) and reference from the body?
8. Is there anything in this request you **cannot** support, or that we should **scale back to exact
   Theatre & Dance parity**?
9. Who is our **point of contact**, and can we **pre-stage** Cascade pages to switch live in sync
   with your changes?

## 7. Coordination
We would like to **launch the chrome (yours) and the body content (ours) together**. We can pre-stage
our Cascade pages as drafts and flip them live the moment your changes deploy. Point of contact on our
side: [Tech Committee chair / name + email].
