# Category review, 2026-07-04

Domain-expert review of all 55 theory entries in `src/data/theories.json`: the nine-category assignments, the cross-listings, and the order of the `categories` array (the first entry is the theory's home cluster in the constellation). The bar for a change was a clear, canonically defensible misplacement; genuine judgment calls were left alone and are listed below with a recommendation each.

Reviewed: 55 theories. Changed: 2. Left as judgment calls: 8.

## Changes made

| Theory | Old categories | New categories | Canonical justification |
| --- | --- | --- | --- |
| Elaboration Likelihood Model | Health Communication (primary); Interpersonal Communication and Relations; Public Relations / Advertising, Marketing and Consumer Behavior | Communication Processes (primary); Health Communication; Public Relations / Advertising, Marketing and Consumer Behavior | The ELM is the discipline's flagship general theory of persuasion and message processing (Petty and Cacioppo 1986), so Communication Processes is its canonical home, matching this dataset's own placement of its siblings Cognitive Dissonance and Expectancy Value (both Communication Processes primary with a PR cross-listing). Health Communication and PR are genuine, heavily used application lenses and are kept. The Interpersonal listing was dropped: no standard taxonomy files the ELM under interpersonal relations, and its lens note (elaboration as relational investment) was an invented reading rather than an established literature. |
| Theory of Planned Behavior | Health Communication (primary); Interpersonal Communication and Relations | Health Communication (primary); Communication Processes | Health Communication stays primary; the TPB is the workhorse of health behavior-change communication and that is where the source corpus files it. The Interpersonal cross-listing was replaced with Communication Processes: the subjective norm component does not make the TPB an interpersonal-relations theory in any standard taxonomy, whereas the theory is the mature branch of the Fishbein and Ajzen expectancy-value persuasion line (this dataset already files Expectancy Value under Communication Processes), and its comm use is message and campaign design, that is, persuasion process. |

Both changes also updated `category_notes`: the dropped Interpersonal lens notes were removed and new Communication Processes lens notes written in the same voice.

## Judgment calls left alone (with recommendation)

| Theory | Current categories | Call | Recommendation |
| --- | --- | --- | --- |
| Classical Rhetoric | Language Theories and Linguistics (primary); Communication Processes | Rhetoric is the founding persuasion tradition, which argues for Communication Processes as home; but the canon of style, figures, and the enthymeme defends the Language placement, and CP is already cross-listed. | Defensible as is. If you ever revisit, swapping the order (CP primary, Language cross) is the more conventional reading of rhetoric as persuasion. |
| System Theory | Communication Processes (primary); Organizational Communication | Bertalanffy's general theory as a communication meta-framework supports CP primary; Katz and Kahn make Organizational the strongest applied home, and the source corpus leans organizational. | Keep. If the CP cluster ever feels crowded in the constellation, this is the first star to move (ORG primary). |
| Transactional Model of Stress and Coping | Health Communication (primary); Communication Processes | The CP cross-listing is the weakest in the whole set; Lazarus and Folkman is a psychology theory whose comm home is health. The appraisal-as-meaning-making lens note does earn its place, though. | Keep both. If you prefer trimming stretch cross-listings, Health Communication alone is the cleanest reading. |
| Language Expectancy Theory | Language Theories and Linguistics (primary); Public Relations / Advertising, Marketing and Consumer Behavior | LET is a persuasion theory (Burgoon), so CP arguably fits the second slot better than PR; but its applied life is campaign and message-intensity design, which defends PR. | Keep. Consider CP as a third listing only if you want every persuasion theory visible in that cluster. |
| Social Cognitive Theory | Communication Processes (primary); Health Communication | Correct as placed. Bandura's modeling account is also foundational to media-effects research (entertainment-education, media violence). | Optional: add Mass Media as a third listing; not required. |
| Diffusion of Innovations | Mass Media (primary); Public Relations / Advertising, Marketing and Consumer Behavior | Correct as placed (two-step-flow lineage plus marketing). It is also a staple of health campaign design. | Optional: add Health Communication as a third listing; not required. |
| Social Identity Theory | Interpersonal Communication and Relations (primary); Media, Culture and Society | SIT is an intergroup theory and the nine-category scheme has no group/intergroup cluster; Interpersonal is the nearest defensible home and the MCS cross covers the media-and-polarization reading. | Keep as is. |
| Modernization Theory | Media, Culture and Society (only) | Development communication ran through mass media (Lerner, Schramm), which could justify a Mass Media cross-listing. | Keep single-listed; MCS captures the theory's actual claim about society. Add MM only if you want it tethered to the development-era mass media theories. |

## Verification

`node scripts/validate-theories.mjs` passes (55 theories valid, em-dash and duplicate-slug guards clean) and `npm run build` completes with no errors (64 pages).

One unrelated, pre-existing observation: `npx vitest run` has 1 failing test out of 10 (`test/TheoryCard.test.tsx`, "links to the correct detail page"). It fails identically on `main` before this review: the test expects a bare `/theories/<slug>` href but the TheoryCard component now appends a `?cat=` query parameter. The test fixture is inline, so this review's data changes cannot affect it. It does not block anything (the deploy workflow runs `npm run build` only), but the test's expected href should be updated to include the `?cat=` parameter whenever someone is next in that file.
