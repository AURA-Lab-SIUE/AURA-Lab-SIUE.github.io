# AURA Lab

**Avatars, Users, Relationships, and Affect Lab — Southern Illinois University Edwardsville**

*Where digital presence becomes research.*

AURA Lab is a computational communication research group at SIUE that studies how people form relationships, perform identity, and experience affect across virtual environments, streaming platforms, and digital media. Directed by [Dr. Alex P. Leith](https://apleith.com), Associate Professor (Tenured) in the [Department of Mass Communications at SIUE](https://www.siue.edu/artsandsciences/mass-communications/). The lab produces peer-reviewed scholarship, open educational resources, and open-source tools.

> **Rebrand note:** AURA Lab is the May 2026 rebrand of the former *SIM Lab* (Social & Interactive Media Lab). The GitHub organization was renamed `SIM-Lab-SIUE` → `AURA-Lab-SIUE`; project repos retain their existing names and GitHub auto-redirects old URLs.

> **Note on scope:** This organization covers academic and instructional work at SIUE. Industry consulting, applied data tools, and contract software live under [SIM DAD LLC](https://github.com/SIM-DAD) separately.

**Live site:** [aura-lab.siue.edu](https://aura-lab.siue.edu) — a SIUE-hosted mirror, kept in sync with the CI build. The build is deployed continuously to GitHub Pages at [aura-lab-siue.github.io](https://aura-lab-siue.github.io); both serve the same output.

---

## Research Areas

| Area | Focus |
|---|---|
| **Virtual Environments** | Social interaction in VR/XR, videoconferencing fatigue, remote work equity — including a completed $1.6M NSF grant with the [Beyond Meet Space](http://beyondmeet.space/) collective |
| **Streaming Platforms** | Parasocial relationships, avatar identity, community dynamics on Twitch and related platforms |
| **Computational Methods** | Sentiment analysis, topic modeling, network analysis, and applied NLP for communication research |
| **Virtual Meetings** | Design and study of synchronous mediated interaction in work and learning contexts |

---

## Repository Structure

```
AURA-Lab-SIUE.github.io/
│
├── src/                    # Astro source (v2 site)
│   ├── layouts/            # BaseLayout
│   ├── components/         # Nav, Footer, FieldHero, PubItem, theories island (React), ...
│   ├── pages/              # Astro routes (/, /framework, /research, /people,
│   │                       #   /publications, /tools, /students, /news, /join,
│   │                       #   /theories — the native constellation map)
│   ├── content/            # YAML + Markdown content collections (Zod-validated)
│   ├── data/               # theories.json + schema (the constellation data)
│   └── styles/             # tokens.css, global.css, theories.css
│
├── public/                 # Static assets served at the docroot
├── brand/                  # Logo/mark system + BRAND-GUIDE.md ("The Reading")
├── scripts/                # Build helpers (copy-legacy postbuild, validators)
├── _archive/               # Legacy v1 site preserved for reference
│
│   # Standalone student/teaching apps — self-contained, copied into the
│   # build docroot by the postbuild step so they keep their original URLs:
├── methodosync/            # MethodoSync — Vite + React + TS qualitative-coding app
├── mc-careers-dashboard/   # MC Careers Dashboard — SvelteKit (compiled bundle)
├── banned-words/           # Concordance — configurable term checker
├── app_form.html           # Lab application form
├── captionizer.html        # Caption helper
├── countdown.html          # In-class countdown timer
├── research-methods/       # R Bookdown methods textbook (static HTML)
├── resume-cv/ · sample-portfolios/   # Student-facing teaching resources
│
├── astro.config.mjs · tailwind.config.mjs · tsconfig.json
├── DESIGN-NOTES.md         # Rationale for the visual system (auditable)
└── .github/workflows/      # deploy.yml — build + deploy to GitHub Pages
```

---

## Projects

### v2v — *Vibes to Variables* (three prongs)
- **[v2v](https://github.com/AURA-Lab-SIUE/v2v)** — *From Vibes to Variables: A Field Guide to Open Media Science*, the open textbook (OER) for SIUE MC-451 / MC-501. Built with Quarto. CC BY 4.0.
- **[v2v-r](https://github.com/AURA-Lab-SIUE/v2v-r)** — Companion R package; ships a 22M-row Twitch corpus and chapter-by-chapter pedagogical helpers behind a learner-friendly API.
- **[v2v-hub](https://github.com/AURA-Lab-SIUE/v2v-hub)** — Course hub for MC-451 Research Methods (the Liaison Program). Companion Obsidian vault: [mc451-liaison-program](https://github.com/AURA-Lab-SIUE/mc451-liaison-program).

### [MethodoSync](methodosync/)
Browser-based qualitative research tool for video annotation and codebook generation. Built with Vite + React 18 + TypeScript + Tailwind CSS. No server or account required.

### [MC Careers Dashboard](https://github.com/AURA-Lab-SIUE/mc-careers-dashboard)
Interactive SvelteKit dashboard mapping Mass Communications career paths, salary data, and skill requirements for student career planning.

### [GearOut](https://github.com/AURA-Lab-SIUE/equipment-checkout)
Equipment-reservation platform for production gear, deployed at SIUE as **MassComm Checkout**. Built with TypeScript.

### [Communication Theories Map](https://aura-lab.siue.edu/theories/)
A navigable "sky" of communication theory — every framework is a star in a field, cross-listed theories are tethered across areas, and any star opens to a full reading. Built natively into the Astro site (server-rendered SVG constellation + a React filter island); fully usable with JavaScript off via the text index. Designed to help students find an appropriate theory for a project.

### [Concordance](https://github.com/AURA-Lab-SIUE/concordance)
A topic-agnostic term checker — test documents against any configurable term list. AURA Lab in collaboration with SIM DAD LLC.

---

## Identity System

The visual system is **"The Instrument, in warm paper"** — warm scientific plotting (a faint graph-paper grid, `FIG.` labels, an annotated settings axis, mono readouts) over the feel of a serious little magazine about digital social life. Full rationale, tokens, and clear-space specs live in [`DESIGN-NOTES.md`](DESIGN-NOTES.md) and [`brand/BRAND-GUIDE.md`](brand/). Headline summary:

- **Palette:** monochromatic red on warm neutrals. Warm-bone paper (`#f6f3ec`) / cool-charcoal (`#101113`, the default dark theme) grounds, near-black/off-white ink, and a single collegiate **brick** accent (`#a8322a` light, `#e05a4a` dark). The exact SIUE University Red (`#e5182d`) appears in exactly one place — the diamond tick beside the wordmark. No second hue.
- **Typography** (self-hosted via `@fontsource`): **Archivo** (grotesque, 800) for display and UI, **Newsreader** (serif) for body copy, **Spline Sans Mono** for `FIG.` tags, axis ticks, and data readouts — a grotesque-over-serif pairing that echoes SIUE's own.
- **Mark — "The Reading":** a plotted reading (a peak) rising to a measured point (the SIUE-red diamond) over the lab's settings axis, whose four graduation ticks are the AURA dimensions (Avatars · Users · Relationships · Affect). Reads as an ascending "A" without being a literal letter.

Both themes are token-driven (`src/styles/tokens.css`): overriding only the base tokens under `:root[data-theme="dark"]` restyles the whole component library, since every semantic alias is late-bound `var()`.

---

## Accessibility

The site targets **WCAG 2.1 / 2.2 Level AA**, verified with [axe-core](https://github.com/dequelabs/axe-core) across every page template in **both light and dark themes** (0 violations). What that means in practice:

- **Contrast (1.4.3 / 1.4.11):** all text and UI meet AA in both themes. Because the dark accent is lifted for legible *text*, solid red fills that carry white text use dedicated `--brick-fill` / `--brick-fill-deep` tokens so white-on-red still clears AA.
- **Keyboard & focus (2.1.1 / 2.4.7):** a skip link, a visible `:focus-visible` ring in the base layer, and full keyboard operation — including the theory constellation (star links + `Enter`/`Space` on cluster controls).
- **Names, roles, structure (1.3.1 / 4.1.2):** semantic landmarks and headings; the interactive SVG map and the framework "instrument" expose their controls to assistive tech with correct roles and `aria-pressed` state.
- **Motion (2.2.2 / 2.3.3):** every animation respects `prefers-reduced-motion`, and the auto-rotating framework instrument has an explicit pause control (plus hover/focus auto-pause).
- **Images & language:** meaningful images have text alternatives, decorative canvases/marks are hidden from AT, and the document declares `lang="en"`.

When changing accent colors or adding solid-fill components, re-check contrast in **dark** mode specifically — it is the tighter constraint. See [`DESIGN-NOTES.md`](DESIGN-NOTES.md) §5.

---

## Tech Stack

**Main site (v2)**
- [Astro 5](https://astro.build/) (static output) with [React](https://react.dev/) islands (the theory-map filter) via `@astrojs/react`
- [Tailwind CSS](https://tailwindcss.com/) 3
- Astro content collections (Zod-validated YAML/Markdown)
- [Motion One](https://motion.dev/) for staggered word reveals; `marked` for inline Markdown
- Astro View Transitions for cross-page navigation; `@astrojs/sitemap`
- **Archivo + Newsreader + Spline Sans Mono** via `@fontsource`
- Deployed to GitHub Pages via GitHub Actions (Node 20, `npm ci && npm run build`)

**MethodoSync** (`methodosync/`)
- Vite + React 18 + TypeScript, Tailwind CSS v3
- Built output committed alongside source

**research-methods/**: R Bookdown — static HTML textbook
**Theory map**: native to the Astro site (`src/pages/theories/`) — a build-time SVG constellation + a React filter island, not a separate app

---

## Development

### Main site

```bash
npm install
npm run dev               # http://localhost:4321
npm run build             # output to ./dist (postbuild copies the standalone apps)
npm run check             # type-check + Astro diagnostics
npm run preview           # serve ./dist locally
npm run validate:theories # validate src/data/theories.json against its schema
npm test                  # vitest (theory filter + utils)
```

### Content workflow

- **Publications:** edit `src/content/publications/pubs.yaml`. Only public-facing entries (DOI, preprint, or in-press) pass schema validation.
- **News:** add a Markdown file under `src/content/news/` with `date`, `title`, optional `tags`.
- **Projects:** add a YAML file under `src/content/projects/` with `area`, `status`, `blurb`.
- **Tools:** edit `src/content/tools/tools.yaml` (research tools) or `src/content/tools/teaching.yaml` (teaching resources).
- **Director bio + links:** `src/content/people/director.yaml`.
- **Research-area copy:** Markdown under `src/content/research-areas/`.

### Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the Astro site and publishes it to GitHub Pages at [aura-lab-siue.github.io](https://aura-lab-siue.github.io). **One-time setup:** GitHub → Settings → Pages → Source: "GitHub Actions".

The public URL, [aura-lab.siue.edu](https://aura-lab.siue.edu), is a **separately hosted SIUE mirror** (not a GitHub Pages custom domain). It serves the same build output and is refreshed from the same source; it is not updated by the Pages deploy, so a release is complete only once both targets are in sync.

### MethodoSync (separate sub-app)

```bash
cd methodosync
npm install
npm run dev      # local dev server
npm run build    # build to methodosync/ root (commit index.html + assets/)
```

> **Note:** Vite root is `src/` to prevent the source `index.html` from being overwritten on build. The built `index.html` and `assets/` directory are committed alongside source.

---

## Contact

- **Email:** [aleith@siue.edu](mailto:aleith@siue.edu)
- **GitHub org:** [@AURA-Lab-SIUE](https://github.com/AURA-Lab-SIUE)
- **ORCID:** [0000-0003-1310-6763](https://orcid.org/0000-0003-1310-6763)
- **Director's site:** [apleith.com](https://apleith.com)

> For industry consulting inquiries, see [SIM DAD LLC](https://github.com/SIM-DAD).

---

&copy; 2026 AURA Lab — Southern Illinois University Edwardsville
