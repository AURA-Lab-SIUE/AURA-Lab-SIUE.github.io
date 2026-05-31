# AURA Lab Communication Theories Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AURA Lab teaching website covering the UTwente communication-theory categories, with original AURA-voiced content (citing UTwente + primary sources), driven by a single `theories.json` and a shared React component that future Remotion videos will reuse.

**Architecture:** Extract UTwente per-theory content into internal source notes, author original entries into `theories.json`, and render an Astro + Tailwind `/theories` section (filterable index + detail pages) whose theory card/scene is a React island. The same data file and component feed the later (separate) Remotion video sub-project.

**Tech Stack:** Astro, Tailwind, React (islands), TypeScript; Python (life-os venv + pypdf) for PDF extraction; existing GitHub Pages deploy. Spec: `docs/superpowers/specs/2026-05-31-aura-theories-website-design.md`.

---

## File Structure

- `src/data/theories.json` — single source of truth (all unique theories; schema in spec).
- `src/data/theories.schema.json` — JSON Schema for validation.
- `scripts/extract-utwente-notes.py` — one-off: decrypted PDF → per-theory raw source notes (NOT published; authoring input only).
- `scripts/validate-theories.mjs` — validates `theories.json` against the schema; run in CI/build.
- `src/components/theories/TheoryCard.tsx` — React island; the shared visual unit (site now, Remotion later).
- `src/components/theories/CategoryFilter.tsx` — index filter/search UI.
- `src/pages/theories/index.astro` — category-organized, filterable index.
- `src/pages/theories/[slug].astro` — per-theory detail page.
- `src/styles/theories.css` (or Tailwind layer) — design-system tokens chosen in Phase 1.
- `docs/superpowers/mockups/theories/` — HTML mockup variants + switcher (Phase 1).
- `_archive/theories-draft-2026-05-31/` — archived prior `theories/` bundle.

Design units: data (json + schema), extraction (python), validation (mjs), presentation (Astro pages + React island). Each is independently testable and has one responsibility.

---

## Phase 0: Repo prep

### Task 0: Branch, verify toolchain, archive old draft

**Files:**
- Create: `_archive/theories-draft-2026-05-31/` (move existing `theories/` here)

- [ ] **Step 1: Create a working branch**

```bash
cd "D:/OneDrive - Southern Illinois University Edwardsville/websites/AURA-Lab-SIUE.github.io"
git checkout -b feat/theories-rebuild
```

- [ ] **Step 2: Verify the Astro toolchain runs**

Run: `npm install && npm run build`
Expected: existing site builds with no errors (baseline before changes).

- [ ] **Step 3: Archive the existing theories draft (never delete)**

```bash
git mv theories _archive/theories-draft-2026-05-31
```
Expected: old bundle preserved under `_archive/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(theories): branch + archive prior theories draft before rebuild"
```

---

## Phase 1: Design-system mockups (SELECTION GATE)

This phase produces the visual options. No site code is finalized until the owner picks one. Mockups follow the standing practice: static HTML variants with a fixed tympanus-style switcher.

### Task 1: Build 2-3 mockup variants with switcher

**Files:**
- Create: `docs/superpowers/mockups/theories/index.html` (switcher shell)
- Create: `docs/superpowers/mockups/theories/variant-a.html`, `variant-b.html`, `variant-c.html`

- [ ] **Step 1: Assemble realistic sample content**

Use 1 category (e.g., Health Communication) and ~4 real theories (ELM, Health Belief Model, Protection Motivation Theory, Theory of Planned Behavior) with short placeholder-but-plausible original blurbs. Real category color-coding for all 9 categories.

- [ ] **Step 2: Build variant A (e.g., editorial/serif teaching aesthetic)**

Full-page mock of the index (category-filtered grid) + one detail view. Atkinson Hyperlegible body. Self-contained HTML/CSS.

- [ ] **Step 3: Build variant B (e.g., systematic/card-grid, motion-forward — Remotion-friendly)**

Same content, distinct aesthetic emphasizing clean type + category color and layout that translates to animated scenes.

- [ ] **Step 4: Build variant C (optional third direction)**

Only if a genuinely distinct third direction is warranted; otherwise stop at two.

- [ ] **Step 5: Wire the fixed switcher**

`index.html` loads variants in an iframe/section with a fixed top-right switcher to flip between A/B/C.

- [ ] **Step 6: Commit and present for selection**

```bash
git add docs/superpowers/mockups/theories
git commit -m "design(theories): mockup variants with switcher for selection"
```
Expected: owner reviews, selects one variant (or requests a blend). **STOP: owner selection gates Phase 4.**

> **RE-PLAN CHECKPOINT:** After selection, finalize the exact `TheoryCard.tsx` / index / detail component code and Tailwind tokens in Phase 4 to match the chosen variant. Re-run writing-plans for Phase 4 detail if the chosen design differs materially from the assumptions here.

---

## Phase 2: Data pipeline + schema (design-independent; can run in parallel with Phase 1)

### Task 2: Define the theories JSON Schema

**Files:**
- Create: `src/data/theories.schema.json`
- Test: `scripts/validate-theories.mjs`

- [ ] **Step 1: Write the schema**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["slug", "name", "categories", "summary", "what_it_is", "core_idea", "how_used", "example", "source_note"],
    "additionalProperties": false,
    "properties": {
      "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "name": { "type": "string", "minLength": 2 },
      "aka": { "type": "array", "items": { "type": "string" } },
      "categories": {
        "type": "array", "minItems": 1,
        "items": { "enum": [
          "Communication and Information Technology",
          "Communication Processes",
          "Health Communication",
          "Interpersonal Communication and Relations",
          "Language Theories and Linguistics",
          "Mass Media",
          "Media, Culture and Society",
          "Organizational Communication",
          "Public Relations / Advertising, Marketing and Consumer Behavior"
        ] }
      },
      "summary": { "type": "string", "minLength": 10 },
      "what_it_is": { "type": "string", "minLength": 20 },
      "core_idea": { "type": "string", "minLength": 20 },
      "how_used": { "type": "string", "minLength": 20 },
      "example": { "type": "string", "minLength": 20 },
      "primary_references": { "type": "array", "items": { "type": "string" } },
      "source_note": { "type": "string", "minLength": 10 },
      "related": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

- [ ] **Step 2: Write the validator (fails on missing/empty data, dup slugs, em-dashes in prose)**

```js
// scripts/validate-theories.mjs
import Ajv from "ajv";
import fs from "node:fs";
const schema = JSON.parse(fs.readFileSync("src/data/theories.schema.json", "utf8"));
const data = JSON.parse(fs.readFileSync("src/data/theories.json", "utf8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
let ok = validate(data);
const errors = ok ? [] : validate.errors.map(e => `${e.instancePath} ${e.message}`);
// uniqueness
const slugs = new Set();
for (const t of data) {
  if (slugs.has(t.slug)) errors.push(`duplicate slug: ${t.slug}`);
  slugs.add(t.slug);
}
// AURA-voice rule: no em-dashes in prose fields
const proseFields = ["summary","what_it_is","core_idea","how_used","example"];
for (const t of data) for (const f of proseFields)
  if (typeof t[f] === "string" && t[f].includes("—")) errors.push(`em-dash in ${t.slug}.${f}`);
if (errors.length) { console.error("INVALID:\n" + errors.join("\n")); process.exit(1); }
console.log(`OK: ${data.length} theories valid`);
```

- [ ] **Step 3: Seed `theories.json` with an empty array and run the validator (expect pass on empty)**

```bash
echo "[]" > src/data/theories.json
node scripts/validate-theories.mjs
```
Expected: `OK: 0 theories valid`

- [ ] **Step 4: Commit**

```bash
git add src/data/theories.schema.json src/data/theories.json scripts/validate-theories.mjs
git commit -m "feat(theories): JSON schema + validator (em-dash + dup-slug guards)"
```

### Task 3: Extract UTwente per-theory source notes (authoring input, not published)

**Files:**
- Create: `scripts/extract-utwente-notes.py`
- Output (gitignored): `scripts/_source-notes/<slug>.md`

- [ ] **Step 1: Write the extractor**

Reads the decrypted PDF (`E:\Projects\AURA-Lab-SIUE\theories\utwente-comm-theories-2026-decrypted.pdf`) with pypdf, splits by the per-theory headings (History and Orientation / Core Assumptions and Statements / Conceptual Model / Favorite Methods / Scope and Application / Example / References), and writes one raw note file per theory with its category tags. These notes are *source material for authoring*, never published verbatim.

```python
# scripts/extract-utwente-notes.py  (run with life-os venv python; pypdf installed there)
# Emits scripts/_source-notes/<slug>.md per theory with raw UTwente text + detected categories.
# (Full parsing logic implemented at execution time against the TOC offsets already mapped in the spec.)
```

- [ ] **Step 2: Run extraction and spot-check 3 notes**

Run the extractor; open 3 note files; confirm category tags and the References section captured (the real primary sources to cite).

- [ ] **Step 3: Gitignore the raw notes (avoid publishing UTwente text)**

```bash
echo "scripts/_source-notes/" >> .gitignore
```

- [ ] **Step 4: Commit the extractor + ignore (not the notes)**

```bash
git add scripts/extract-utwente-notes.py .gitignore
git commit -m "feat(theories): UTwente source-note extractor (notes gitignored)"
```

---

## Phase 3: Content authoring (batched, owner-reviewed)

Authoring is a repeated loop, one category-batch at a time. Each unique theory is written ONCE (cross-listed theories get all their category tags). This is original writing, not extraction.

### Task 4 (repeated per category, 9 batches): Author one category's theories

**Files:**
- Modify: `src/data/theories.json` (append/merge entries)

For each category batch:

- [ ] **Step 1: Draft original entries** for that category's unique, not-yet-authored theories, filling every schema field in AURA Lab voice (accessible register, no em-dashes, jargon defined). `source_note` cites UTwente; `primary_references` reproduces the theory's real references from the notes (APA 7), flagging any that cannot be confirmed rather than inventing.
- [ ] **Step 2: Merge** into `theories.json` (add category tag to an existing entry if the theory was already authored under another category).
- [ ] **Step 3: Validate**: `node scripts/validate-theories.mjs` → expect `OK`.
- [ ] **Step 4: Owner review** of the batch (accuracy + voice). Revise on feedback.
- [ ] **Step 5: Commit**: `git commit -m "content(theories): author <category> entries"`

Loop until all 9 categories are covered and `theories.json` holds every unique theory.

---

## Phase 4: Astro site build (finalized to the chosen mockup)

> Component code below is the target shape; exact markup/classes finalize to the Phase 1 selection (see RE-PLAN CHECKPOINT). Tasks and interfaces are stable; styling specifics fill in post-selection.

### Task 5: TheoryCard React island

**Files:**
- Create: `src/components/theories/TheoryCard.tsx`
- Test: `src/components/theories/TheoryCard.test.tsx`

- [ ] **Step 1: Write a failing render test** (renders name, summary, category chips from a theory object prop).
- [ ] **Step 2: Run test, verify it fails** (component not implemented).
- [ ] **Step 3: Implement `TheoryCard`** taking a typed `Theory` prop (type derived from the schema), rendering name, summary, category chips, and a link to `/theories/<slug>`; styled to the chosen variant.
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit.**

### Task 6: Index page with category filter + search

**Files:**
- Create: `src/pages/theories/index.astro`, `src/components/theories/CategoryFilter.tsx`
- Test: `src/components/theories/CategoryFilter.test.tsx`

- [ ] **Step 1: Failing test** for filter logic (given theories + selected category, returns the matching subset; multi-tagged theory appears under each of its categories).
- [ ] **Step 2: Verify fail.**
- [ ] **Step 3: Implement** the filter + search (client island) and the Astro index that imports `theories.json` and renders `TheoryCard`s grouped/filterable by the 9 categories.
- [ ] **Step 4: Verify pass; `npm run build` succeeds.**
- [ ] **Step 5: Commit.**

### Task 7: Per-theory detail page

**Files:**
- Create: `src/pages/theories/[slug].astro`

- [ ] **Step 1: Implement** `getStaticPaths` from `theories.json`; render the fuller fields (what_it_is, core_idea, how_used, example) + `primary_references` + `source_note` (UTwente citation).
- [ ] **Step 2: Build** and verify every slug generates a page; spot-check 3.
- [ ] **Step 3: Commit.**

---

## Phase 5: Accessibility + citation verification

### Task 8: a11y + citation pass

- [ ] **Step 1: Accessibility audit** (contrast, headings, keyboard nav, Atkinson Hyperlegible applied, alt text). Fix issues.
- [ ] **Step 2: Citation spot-verification**: confirm a sample of `primary_references` resolve to real works (OpenAlex/DOI); confirm no UTwente verbatim text leaked into prose fields (the validator catches em-dashes; a manual read confirms voice).
- [ ] **Step 3: Commit fixes.**

---

## Phase 6: Deploy

### Task 9: Merge, build, deploy, archive note

- [ ] **Step 1:** `npm run build` clean; validator passes in build.
- [ ] **Step 2:** Open a PR / merge `feat/theories-rebuild` to the default branch (owner approves merge).
- [ ] **Step 3:** Confirm GitHub Pages publishes `/theories`; smoke-test index + 3 detail pages live.
- [ ] **Step 4:** Confirm old draft remains under `_archive/`.

---

## Out of scope (separate later plan)

The 9 Remotion category videos and Orator voiceover. `theories.json` + `TheoryCard.tsx` are the handoff artifacts that the video sub-project will consume.

---

## Self-review notes

- **Spec coverage:** all unique theories (Task 4 loop + dedup/merge), original prose + citations (Task 4 Step 1, Task 8 Step 2), single `theories.json` (Tasks 2-7), shared React island (Task 5, reused by future video), Astro/Tailwind site (Tasks 5-7), new design via mockups (Task 1), archive old draft (Task 0/6), accessibility (Task 8), website-first with video deferred (Out of scope). Covered.
- **Design dependency:** Phase 4 styling specifics intentionally finalize post-mockup (flagged at the RE-PLAN CHECKPOINT); interfaces and tasks are stable.
- **Integrity guards:** validator blocks em-dashes and duplicate slugs; Task 8 verifies citations and non-plagiarism.
