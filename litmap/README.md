# LitMap

A browser-only teaching tool that walks a student through a literature review
one source at a time, and lets the narrowing fall out of the reading rather
than asking for it up front. It follows Chapter 4 of *Vibes to Variables*
("Intelligence Gathering") and is the upstream sibling of
[MethodoSync](../methodosync): LitMap ends where a prospectus begins,
MethodoSync starts where the coding does.

Everything runs client-side. No data leaves the browser; work is autosaved to
`localStorage` and can be exported to a portable project file.

Status: **all five planned stages built.** The thresholds in the gap detector
are provisional and want real student logs before they are trusted; every
finding prints the counts it came from so a student can disagree with a
threshold rather than take it on faith.

## Getting a student started

Two pieces exist because the stated problem is students who cannot narrow a
topic, and a tool that opens on a search-log form is useless to someone who has
no search yet.

- **"How LitMap works"**, the first thing on FIG.1, collapsible and remembered.
  It leads with the thing nobody tells them: you do not pick a topic and then
  read, you read and the topic narrows itself. Then the five-stage arc, and a
  plain statement of the two things the tool cannot do.
- **The concept-block builder**, also on FIG.1. Turns "I'm interested in Twitch
  chat" into a runnable Boolean string: two or three ideas ANDed, synonyms ORed
  inside each, phrases auto-quoted. It critiques the SHAPE only (one concept is
  too broad, four is too narrow, no synonyms will miss most of the field) and
  supplies no vocabulary, because thinking of the synonyms is the conceptual
  work. One button drops the result into the search log.

## The six stages

1. **Search log (FIG.1).** Name the project, say what you are interested in as
   vaguely as it honestly is, then log every search: date, database, the exact
   string, limiters, results, kept. This is not bookkeeping. It is the unit the
   first saturation test is measured over, and without it a flat curve cannot
   be told apart from a lazy search.
2. **Sources (FIG.2).** Drop in a Zotero export (CSL JSON, BibTeX or RIS) and
   the citations fill themselves in; the student answers the same **eight
   questions** about each source. The hints under each field say what the field
   is *for*, because a student who knows a column feeds a later computation
   fills it differently from one who thinks it is a form.
3. **Saturation and first review (FIG.3).** A live version of the book's
   `fig04-1`, the three saturation signs, and the four-sentence minimum viable
   literature review assembled from sentences the student has already written.
4. **The gap (FIG.4).** All four of Chapter 4's gap types, found by looking for
   concentration across the columns: a methodological gap when one method
   dominates, a topical void when one population or context does, a
   contradiction when two sources report opposing directions on the same pair
   of constructs, and a theoretical gap when one lens dominates (or when most
   sources name none). Each drafts the first two sentences of the chapter's
   known-then-limitation-then-study structure and leaves the third blank.
5. **Synthesis and handoff (FIG.5).** Sources grouped by shared construct pair
   into claim paragraphs with the claim line blank, the Chapter 6 prospectus
   scaffold, and a handoff that seeds MethodoSync's codebook from the
   constructs met in the reading.
6. **From gap to question (FIG.6).** The half that actually narrows. A slot
   builder that assembles a research question or hypothesis in Chapter 6's own
   shape, filled from constructs and populations already logged; the five
   criteria; the three named failure modes; a theory picker over the lab's own
   55; method fit against what the student can actually get hold of; and the
   feasibility meter.

## What it computes, and what it refuses to

Every derived number is a **count**. There is no model and no API.

- **Three states, not two.** A source is `pile` (imported, not yet read),
  `kept` (read and logged), or `aside` (read and rejected). State is derived in
  `lib/sourceState.ts`, never stored, so it cannot go stale against the fields
  it summarises. Only `kept` reaches the curve; `kept + aside` is the examined
  count; the pile counts toward nothing. This replaced a single `relevant`
  boolean that defaulted to true, under which a forty-item .bib import opened
  the tool on a nearly-saturated curve before a word had been read.
- **The saturation curve.** Distinct kept sources against sources examined,
  drawn as a step function because a source either added something or it did
  not. Sources examined and set aside still count as examined, which is what
  keeps the curve honest instead of flattering.
- **The three signs**, exactly as Chapter 4 names them: three consecutive
  searches with nothing new; new reading citing the same eight to ten
  foundational works; and the student's own ability to predict an article from
  its abstract. The third is a checkbox, not a computation, and is labelled
  "your call" in the interface.
- **A minimum of 8 kept sources** gates all of it. Three empty searches on the
  first afternoon is a narrow search, not an exhausted literature, and a tool
  that congratulated a student for it would be teaching the wrong lesson.
- **The four-sentence review.** Three findings, with citations attached, in the
  student's own words. Plus a factual readout of what the three chosen sources
  share — same method, same population, same context, same lens, or a direction
  disagreement — because those are the counts that make the gap sentence
  writable.
- **The gap sentence is never drafted.** It is the argument, and handing it over
  would hand over the only part that is thinking. The tool says so on screen.
- **Gap findings are gated at 5 logged sources** and carry a standing caveat:
  they are counts over what the student logged, not facts about the field. A
  detector that always finds something is a horoscope, so the thresholds are
  set where a spread of methods or populations fires nothing.
- **The feasibility meter is the narrowing instrument.** Units × minutes ×
  coders, plus a reliability subsample and reconciliation, against weeks left
  times honest hours per week. Every line is shown, because the total is not
  the point: the point is seeing which input is the one making it impossible.
  When it does not fit it solves for what would fit, each remedy independently,
  and the suggested sample is tested to actually land inside the budget with
  headroom rather than exactly on the ceiling.
- **Three of Chapter 6's five criteria are checked and two are not.** "Has this
  already been answered" and "does it matter" are reported as uncheckable
  rather than quietly ticked. A checklist showing five ticks when it tested
  three is worse than no checklist.
- **The three failure modes are asked, not detected.** Self-selected
  comparisons, circular questions and false binaries cannot be found by pattern
  matching prose without guessing. The student answers three yes/no questions
  and gets Chapter 6's explanation and a concrete fix for any they trip.
- **Method fit is authored from Chapter 5, not inferred.** Each method carries
  what it reaches and what it is structurally blind to, and is ruled in or out
  by the question type and what the student can get hold of.
- **The prospectus fills three of six sections**, or more once FIG.6 has run. The gap, the framework and the
  key sources come from the reading. The research question, the method and the
  contribution ship as marked blanks, because a scaffold that filled all six
  would hand back a prospectus the student never wrote.

It also cannot tell whether the student searched *well*, and cannot judge
whether the question matters. Both limits are stated in the footer rather than
left for a student to discover after trusting a green light.

## The vendored theory dataset

`src/data/theories.min.json` is a reduced copy of the site's own
`src/data/theories.json`: the fields a picker needs, not the full prose, so 55
theories filter offline in 42 KB rather than 424. The explorer at
[`/theories/`](https://aura-lab.siue.edu/theories/) is the authority and every
theory deep-links back to it.

A copy is a copy and copies drift. Regenerate with:

```bash
node scripts/sync-theories.mjs                       # from the repo on main
node scripts/sync-theories.mjs ../path/theories.json # from a local file
```

## Tech

React 19 + TypeScript, Zustand (with `persist`) for state, Vite for the build,
Tailwind + the shared AURA Lab **"Instrument, in warm paper"** design tokens
(`src/index.css` is ported from `methodosync/src/index.css`, which is itself
ported from the site's `src/styles/`). Fonts are self-hosted via `@fontsource`.
No charting library: the saturation curve is inline SVG.

The project file is deliberately `app: "methodosync"` with a `literature`
section, and MethodoSync's own sections are carried through a LitMap round trip
untouched. One file is meant to hold a study from the first reading to the
finished codebook.

## Develop & build

```bash
cd litmap
npm install
npm run dev      # local dev server
npm run build    # type-check + emit index.html + assets/ into litmap/
npm run preview  # serve the built output at /litmap/
```

### Tests

`.test/` holds a headless check of the parsers and the computations, run
against compiled output rather than a test framework, because the logic is pure
and the app has no test harness yet:

```bash
npx tsc src/lib/*.ts src/types/source.ts --outDir .test \
  --module es2022 --target es2022 --moduleResolution bundler --skipLibCheck
find .test -name '*.js' -exec sed -i -E "s@(from '(\.\.?/[^']*[^.][^j][^s])')@from '\2.js'@g" {} \;
node .test/run.mjs      # 85 checks: parsers, saturation, review, export
node .test/gaps.mjs     # 59 checks: gaps, synthesis, prospectus, handoff
node .test/design.mjs   # 84 checks: feasibility, question, method fit, theories
node .test/export.mjs   # prints a full exported literature map
```

`sample-livestreaming.bib` is the six-source fixture from Chapter 4's worked
example, for both the tests and a live demo.

### How it would deploy

Same pattern as MethodoSync: **pre-built and committed**, not built by the
site's CI. `npm run build` writes `index.html` and `assets/` into the `litmap/`
folder itself; the site's `postbuild` (`scripts/copy-legacy.mjs`) copies the
folder into `dist/litmap/`. After any source change, re-run `npm run build`,
delete the stale `assets/index-*` from the previous build, commit the output,
and push to `main`.

## Known rough edges

- A finding typed with a leading capital renders with that capital mid-sentence
  ("… found that Social and tension-release motivations …"). Deliberate: an
  earlier version lowercased it and turned "Twitch streams" into "twitch
  streams". Mangling a proper noun is an error; a capital is a style nit. The
  form asks for a lower-case opening instead.
- The "which search / which source" link is required for a source to count as
  logged. Without it the search it came from reads as having yielded nothing
  and the saturation signal is silently wrong, so the next-step strip nags for
  it specifically.
- **Synthesis and contradiction grouping match construct pairs exactly**, so
  `social motivation / hours watched` and `social motivation / chat engagement`
  do not merge even though a reader would treat them as one conversation. Fuzzy
  matching would catch some of those and silently merge things that should stay
  apart. It under-groups on purpose and says so on screen.
- No keyboard shortcut layer, and the reading list is not reorderable.
- The search log's "Screened in" count is the student's own number at the
  database and is deliberately NOT reconciled against LitMap's kept count. They
  measure different things and a student can legitimately screen in six and log
  three. It was called "Kept" until the two collided in an export.
