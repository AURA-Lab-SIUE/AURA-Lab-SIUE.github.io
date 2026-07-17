# Mass Communications redesign — Phased Roadmap

The redesign proceeds in three phases because the **navigation bar and hero video are outside our
control** — they belong to University Marketing & Communications (UMC). We lead with the ideal ask,
scoped so it never exceeds what UMC has **already built for Theatre & Dance** (their own "redesign"
template), then implement our side once we know what's approved.

---

## Phase 1 — Design information + video (in progress)
**Goal:** produce usable, edited hero videos that fit the redesign.
**Owner:** Tech Committee (spec) + Mass Comm Club (production).
**Deliverable:** `VIDEO-DESIGN-BRIEF.md` — 16:9, center-safe framing, 20–60s seamless loop, muted,
poster still, no flashing; accessibility built in.
**We do the majority of the work; the one external dependency is the finished, edited clips.**
**Status:** brief ready → hand to the Club; collect clips + poster stills.
**Exit criteria:** ≥1 clip (Home) delivered to spec, ideally the full set (Home + 6 sections).

## Phase 2 — University ask (ready to send once Phase 1 clips exist)
**Goal:** get UMC to implement the chrome we can't touch (nav, hero, layout), fast.
**Owner:** Tech Committee → UMC.
**Deliverable:** `UMC-REDESIGN-PACKET.md` — a self-contained packet that expedites their work:
scope (≤ Theatre & Dance parity), the specific asks + justifications, our supplied code
(`assets/mc.css` / `assets/mc.js`), the visual mockups, the delivered videos, and a **feasibility
questionnaire** asking UMC to tell us **what is and isn't possible**.
**Trigger:** send after the videos are in hand (so there's nothing left for them to wait on).
**Status:** packet drafted, ready to send.
**Exit criteria:** UMC responds with feasibility (yes/no/constraints) + a timeline.

## Phase 3 — Department implementation (after UMC feasibility)
**Goal:** build everything we *can* from our side and launch in sync.
**Owner:** Tech Committee (Cascade body content).
**Work:** build the Tier-1 body content (see `IMPLEMENTATION-HANDOFF.md`) for each page — using
either self-hosted `mc.css` (via aura-lab.siue.edu) or inline styles, per what the editor allows.
**Pre-stage** the pages in Cascade as drafts and **switch them live at the same moment** the UMC
chrome changes go live.
**Depends on:** Phase 2 answers (final scope) + Phase 1 videos.
**Exit criteria:** coordinated launch — chrome (UMC) + body (us) go live together.

---

## Dependency chain
Video brief → **edited clips** → UMC packet (with clips) → UMC feasibility → body build → **synced launch**.

## Supporting documents
- `VIDEO-DESIGN-BRIEF.md` — Phase 1 spec.
- `UMC-REDESIGN-PACKET.md` — Phase 2 send-ready ask.
- `IMPLEMENTATION-HANDOFF.md` — Tier-1 (us) vs Tier-2 (UMC) split + how CSS reaches the body.
- `CONTENT-RETENTION-PLAN.md` — every current page mapped into the new IA.
- `ACCESSIBILITY.md` — WCAG 2.1/2.2 AA conformance (the compliance basis for the ask).
- `index.html` … `facilities-services.html` + `assets/` — the visual target and reference code.
