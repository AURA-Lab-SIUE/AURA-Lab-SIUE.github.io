# AURA Lab Communication Theories — Website Design Spec

- **Date:** 2026-05-31
- **Author:** Dr. Alex Leith (with Claude)
- **Status:** Draft for review
- **Repo:** AURA-Lab-SIUE.github.io (Astro + Tailwind, GitHub Pages)
- **Source material:** `E:\Projects\AURA-Lab-SIUE\theories\utwente-comm-theories-2026.pdf` (University of Twente, "Communication Theories," 194 pp., 9 categories)

## TL;DR

- Build an AURA Lab teaching resource: a browsable, filterable website covering the communication theories in the UTwente compendium, organized by its 9 categories.
- Content is **AURA Lab's own writing, built from UTwente, never copied from it.** Each entry is original prose that cites UTwente as the source and, where available, the theory's primary references. No verbatim text, no fabricated claims or citations.
- One **`theories.json`** is the single source of truth. The Astro site renders from it; the future Remotion videos will render from the same file.
- The theory "card/scene" is a **React island component** shared between the Astro site (now) and Remotion (later), so the videos match the site by construction.
- **This spec covers the website only.** The 9 category videos are a separate follow-on sub-project, architecturally enabled here, spec'd later. Website first.

## Goal

Give students and the field an accessible, accurate, well-designed reference to communication theory, as an AURA Lab teaching asset (a gift to the field, consistent with the lab's public-resource posture). It supersedes the earlier `theory/` draft on the personal site and the bundled `theories/` draft in this repo.

## Scope and decomposition

This is two sub-projects; the owner sequenced them website-first.

- **Sub-project 1 (this spec): the website.** Data pipeline, original content authoring, design system, Astro site, deploy.
- **Sub-project 2 (deferred, own spec): the videos.** 9 Remotion videos, one per UTwente category, reusing `theories.json` and the shared visual components, with optional Orator voiceover added afterward.

The architecture below is built so sub-project 2 drops in without rework, but no video work happens under this spec.

## The 9 categories (from UTwente)

1. Communication and Information Technology
2. Communication Processes
3. Health Communication
4. Interpersonal Communication and Relations
5. Language Theories and Linguistics
6. Mass Media
7. Media, Culture and Society
8. Organizational Communication
9. Public Relations / Advertising, Marketing and Consumer Behavior

The PDF lists ~96 theory entries, but many recur across categories (e.g., Elaboration Likelihood Model, Network Theory and Analysis, Uncertainty Reduction Theory). These dedupe to roughly 60–70 unique theories, each tagged to every category it belongs to.

## Content model and integrity (core requirement)

- **Original prose only.** Each theory entry is written fresh in AURA Lab's voice. UTwente is source material and inspiration, not text to reproduce. No verbatim copying of UTwente wording.
- **Citation.** Every entry cites **UTwente** as the compendium source, and, where the PDF provides them, the theory's **primary references** (the real originating works, e.g., Petty & Cacioppo for ELM). Citations are reproduced accurately; key ones are verified, none are fabricated. Citation style: APA 7.
- **Hybrid depth.** The website carries the fuller treatment per theory (see schema). The future videos use a distilled cut (hook + core idea + one example). Authoring the web version first means the video script is a later distillation, not new research.
- **Prose style.** Accessible teaching register (clear, concrete, in the spirit of strong explanatory writing). No em-dashes (AURA Lab / owner voice). Proper sentence capitalization. Define jargon on first use.

### `theories.json` schema (one object per unique theory)

```json
{
  "slug": "elaboration-likelihood-model",
  "name": "Elaboration Likelihood Model",
  "aka": ["ELM"],
  "categories": ["Health Communication", "Interpersonal Communication and Relations", "Public Relations / Advertising, Marketing and Consumer Behavior"],
  "summary": "<1-2 sentence hook, original prose>",
  "what_it_is": "<original prose>",
  "core_idea": "<original prose: key assumptions / mechanism>",
  "how_used": "<original prose: scope and application in practice/research>",
  "example": "<original prose example>",
  "primary_references": ["Petty, R. E., & Cacioppo, J. T. (1986). ..."],
  "source_note": "Adapted by AURA Lab from University of Twente, Communication Theories (2026).",
  "related": ["..."]
}
```

The distilled video fields (`hook`, `one_example`, scene timing) are added under sub-project 2 without changing the above.

## Authoring pipeline

1. **Extract** each theory's UTwente content (already done for structure; per-theory text extractable from the decrypted PDF) into internal *source notes*. The decrypted working copy lives at `utwente-comm-theories-2026-decrypted.pdf` (password stripped under standing approval).
2. **Author** each entry as original prose, in **review batches** (roughly by category) given the ~60–70 theory volume. Each batch is owner-reviewable before the next.
3. **Land** authored entries in `theories.json`. Verify primary-reference citations as authored (no fabrication; flag any UTwente reference that cannot be confirmed rather than inventing one).

## Site architecture

- **Stack:** Astro + Tailwind, matching the existing repo (`astro.config.mjs`, `tailwind.config.mjs`, `src/`). No new framework.
- **Routes:**
  - `/theories` — index: the 9 categories as the primary organizing frame; filter by category, free-text search, and (because theories are multi-tagged) a theory can surface under several categories.
  - `/theories/[slug]` — per-theory detail page (fuller treatment + citations).
- **Shared component:** the theory card/scene is a **React island** (Astro supports React islands; Remotion is React). This component is the unit reused by the videos later, guaranteeing visual parity.
- **Data flow:** `theories.json` → Astro static generation of index + detail pages; the React island consumes the same objects.
- **Supersedes** the existing bundled `theories/` directory and the personal-site `theory/` draft. Old versions are archived (moved to `_archive/`, not deleted), consistent with the never-delete rule.

## Design system

- A **new AURA Lab theory aesthetic**, designed from the start to translate into Remotion (clean type, strong category color-coding, motion-friendly layout).
- Pitched as **2–3 HTML mockup variants with the fixed (tympanus-style) switcher** for the owner to choose, per standing design-pitch practice, before any real implementation.
- **Accessibility:** Atkinson Hyperlegible as the body font (standing accessible-font standard); sufficient color contrast; semantic structure; keyboard navigable. This is a teaching resource, so accessibility is a first-class requirement.

## Build sequence

1. Author design-system mockup variants → owner selects one.
2. Data + content authoring (phased by category, owner-reviewed per batch).
3. Build the Astro `/theories` index + detail pages and the shared React island from `theories.json`.
4. Accessibility + link/citation verification pass.
5. Deploy (GitHub Pages, no build step beyond the existing Astro pipeline); archive the old drafts.
6. (Later, separate spec) Remotion category videos + optional Orator voiceover.

## Out of scope (this spec)

- The 9 category videos (Remotion) and any Orator voiceover work.
- Any AI-narration or audio.
- Changes to the rest of the AURA Lab site beyond adding the theories section and archiving the old draft.

## Open items (resolved during build, not blockers)

- Exact palette/type scale: resolved at the mockup-selection stage.
- Whether to independently verify every primary reference or reproduce UTwente's reference list with spot-verification: default is reproduce-and-spot-verify, flag (not invent) anything unconfirmable.
- Final unique-theory count and the canonical category assignment for each cross-listed theory: settled during the extraction/dedup step.

## References

- University of Twente. (2026). *Communication Theories.* [Compendium; source material.]
- Existing drafts: `apleith.github.io/theory/` and this repo's bundled `theories/` (to be archived).
