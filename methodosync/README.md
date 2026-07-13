# MethodoSync

A browser-only teaching tool that walks students through one continuous
mixed-methods workflow: **open-code a YouTube video moment by moment → cluster
those codes into categories and themes → build a quantitative codebook.** It is
used in the AURA Lab research-methods courses and lives at
[`/methodosync/`](https://aura-lab.siue.edu/methodosync/) on the lab site.

Everything runs client-side. No data leaves the browser; work is autosaved to
`localStorage` and can be exported to a portable project file.

## The three stages

1. **Open coding (FIG.1).** Load any YouTube video, play to a moment, and
   **capture** it — the timestamp locks so it can't drift while you write.
   Record an observation, one or more open codes, and an optional analytic memo.
   Saved annotations list below with clickable timestamps that seek the player.
   Export a clean Markdown file whose every heading deep-links back to the exact
   video moment (`https://youtu.be/<id>?t=<n>s`).
2. **Axial & thematic coding (FIG.2).** Every open code appears in a bank with
   its frequency. Cluster codes into **categories** (axial coding), then group
   categories into **themes** (selective coding). Unassigned codes are flagged so
   nothing is dropped. Exports an analytic-memo Markdown file.
3. **Codebook (FIG.3).** Seed candidate variables from the Stage 2 categories and
   themes (re-seeding preserves edits). Give each variable a measurement type —
   **binary, categorical, ordinal, or count** — which sets an appropriate
   values/scale scaffold; write definitions and inclusion/exclusion rules; and
   attach an anchor example linked to the real coded moment. Export to Markdown or
   a styled `.xlsx` codebook with live hyperlinks to each anchor.

Save / open a `.methodosync.json` project file at any time (top bar) to keep work
or move it between computers.

## Tech

React 19 + TypeScript, Zustand (with `persist`) for state, Vite for the build,
Tailwind + the shared AURA Lab **"Instrument, in warm paper"** design tokens
(see `../DESIGN-NOTES.md`). Fonts are self-hosted via `@fontsource` (Archivo,
Newsreader, Spline Sans Mono) so the tool matches the site with no external
requests. Excel generation uses `exceljs`; the YouTube IFrame API drives the
player.

## Develop & build

```bash
cd methodosync
npm install
npm run dev      # local dev server
npm run build    # type-check + emit index.html + assets/ into methodosync/
npm run preview  # serve the built output at /methodosync/
```

### How it deploys

MethodoSync is **pre-built and committed** — it is not built by the site's CI.
`npm run build` writes `index.html` and `assets/` into the `methodosync/` folder
itself (see `vite.config.ts`: `root: src/`, `outDir: methodosync/`,
`base: '/methodosync/'`). The site's `postbuild` step (`scripts/copy-legacy.mjs`)
copies the whole `methodosync/` folder into `dist/methodosync/`.

**After any source change you must re-run `npm run build` and commit the updated
`index.html` + `assets/`** (delete stale `assets/index-*` from the previous
build, since the build does not empty the output directory). Then push to `main`
to deploy.
