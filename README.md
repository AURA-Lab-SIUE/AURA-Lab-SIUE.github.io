# AURA Lab

**Avatars, Users, Relationships, and Affect Lab — Southern Illinois University Edwardsville**

*Where digital presence becomes research.*

AURA Lab is a computational communication research group at SIUE that studies how people form relationships, perform identity, and experience affect across virtual environments, streaming platforms, and digital media. Directed by [Dr. Alex P. Leith](https://apleith.com), Associate Professor (Tenured) in the [Department of Mass Communications at SIUE](https://www.siue.edu/artsandsciences/mass-communications/). The lab produces peer-reviewed scholarship, open educational resources, and open-source tools.

> **Rebrand note:** AURA Lab is the May 2026 rebrand of the former *SIM Lab* (Social & Interactive Media Lab). The GitHub organization was renamed `SIM-Lab-SIUE` → `AURA-Lab-SIUE`; project repos retain their existing names and GitHub auto-redirects old URLs.

> **Note on scope:** This organization covers academic and instructional work at SIUE. Industry consulting, applied data tools, and contract software live under [SIM DAD LLC](https://github.com/SIM-DAD) separately.

**Live site:** [aura-lab.siue.edu](https://aura-lab.siue.edu) *(also mirrored at [aura-lab-siue.github.io](https://aura-lab-siue.github.io) via GitHub Pages).*

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
│   ├── components/         # Nav, Footer, Hero, etc.
│   ├── pages/              # Astro routes (/, /research, /people, ...)
│   ├── content/            # YAML + Markdown content collections
│   └── styles/             # tokens.css + global.css
│
├── public/                 # Static assets (images, favicon, robots.txt)
├── scripts/                # Build helpers (legacy postbuild copy)
├── _archive/               # Legacy v1 site preserved for reference
│
│   # Legacy teaching pages — preserved at original URLs via postbuild copy
├── methodosync/            # MethodoSync — React/Vite/TypeScript app
├── captionizer.html        # Caption helper
├── countdown.html          # In-class countdown timer
│
├── astro.config.mjs
├── tailwind.config.mjs
└── .github/workflows/      # Deploy to GitHub Pages
```

---

## Projects

### [Vibes to Variables](https://github.com/AURA-Lab-SIUE/vibes-to-variables)
An open educational resource guiding undergraduate Communication and Media Studies students through a complete research project — from hypothesis to reproducible study — using a real dataset of 1,792 songs. Built with Quarto.

### v2v — *Vibes to Variables* (three prongs)
- **[v2v](https://github.com/AURA-Lab-SIUE/v2v)** — *From Vibes to Variables: A Field Guide to Open Media Science*, the open textbook (OER) for SIUE MC-451 / MC-501. Built with Quarto. CC BY 4.0.
- **[v2v-r](https://github.com/AURA-Lab-SIUE/v2v-r)** — Companion R package; ships a 22M-row Twitch corpus and chapter-by-chapter pedagogical helpers behind a learner-friendly API.
- **[v2v-hub](https://github.com/AURA-Lab-SIUE/v2v-hub)** — Course hub for MC-451 Research Methods (the Liaison Program).

### [MethodoSync](methodosync/)
Browser-based qualitative research tool for video annotation and codebook generation. Built with Vite + React 18 + TypeScript + Tailwind CSS. No server or account required.

### [MC Careers Dashboard](https://github.com/AURA-Lab-SIUE/mc-careers-dashboard)
Interactive SvelteKit dashboard mapping Mass Communications career paths, salary data, and skill requirements for student career planning.

### [Equipment Checkout](https://github.com/AURA-Lab-SIUE/equipment-checkout)
Web application for managing and reserving production equipment for SIUE Mass Communications students. Built with TypeScript.

### [Comm Theories Explorer](theories/)
Interactive GSAP-animated guide to common mass communication theories, designed to help students identify an appropriate theory for their research project.

### [Open Methods Hub](https://github.com/AURA-Lab-SIUE/open-methods-hub)
MC Research Methods course website for MC-451 at SIUE — the umbrella for the research-methods teaching ecosystem. Companion Obsidian vault at [mc451-liaison-program](https://github.com/AURA-Lab-SIUE/mc451-liaison-program).

### [Concordance](https://github.com/AURA-Lab-SIUE/concordance)
A topic-agnostic term checker — test documents against any configurable term list. AURA Lab in collaboration with SIM DAD LLC.

---

## Identity System

The AURA Lab visual identity is maintained by the lab director. Headline summary:
- **Palette:** Deep Graphite (`#0E0E12`) primary background, Warm Chalk (`#F4F0EB`) light alternate, Aura Violet (`#7C3AED`) primary accent, Amber Signal (`#F59E0B`) secondary accent.
- **Typography:** [Fraunces](https://fonts.google.com/specimen/Fraunces) for display, [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) for UI and body, [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for code and metadata.
- **Mark:** AURA wordmark in heavy Fraunces, paired with a subtle radial element (the "aura ring") that reads as halo, aperture, and avatar selection indicator at once.

---

## Tech Stack

**Main site (v2)**
- [Astro 5](https://astro.build/) (static output)
- [Tailwind CSS](https://tailwindcss.com/) 3
- Astro content collections (Zod-validated YAML/Markdown)
- [Motion One](https://motion.dev/) for staggered word reveals
- Astro View Transitions for cross-page navigation
- Fraunces + Instrument Sans + JetBrains Mono via `@fontsource`
- Deployed to GitHub Pages via GitHub Actions

**MethodoSync** (`methodosync/`)
- Vite 7 + React 18 + TypeScript, Tailwind CSS v3, Zustand, Radix UI
- Built output committed alongside source

**research-methods/**: R Bookdown — static HTML textbook
**theories/**: Parcel 2 + GSAP animations

---

## Development

### Main site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to ./dist (also copies legacy pages via postbuild)
npm run check    # type-check + Astro diagnostics
npm run preview  # serve ./dist locally
```

### Content workflow

- **Publications:** edit `src/content/publications/pubs.yaml`. Only public-facing entries (DOI, preprint, or in-press) pass schema validation.
- **News:** add a Markdown file under `src/content/news/` with `date`, `title`, optional `tags`.
- **Projects:** add a YAML file under `src/content/projects/` with `area`, `status`, `blurb`.
- **Tools:** edit `src/content/tools/tools.yaml` (research tools) or `src/content/tools/teaching.yaml` (teaching resources).
- **Director bio + links:** `src/content/people/director.yaml`.
- **Research-area copy:** Markdown under `src/content/research-areas/`.

### Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the Astro site and deploys to GitHub Pages. **One-time setup:** GitHub → Settings → Pages → Source: "GitHub Actions".

A future migration to `aura-lab.siue.edu` will add a `public/CNAME` once SIUE IT provisions the subdomain.

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
