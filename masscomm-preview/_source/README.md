# masscomm-preview — source packet

Working source and design documentation for the **Mass Communications redesign
mockup** served at `/masscomm-preview/`. Kept here so the mockup and everything
behind it is versioned in one place.

**Not deployed.** `scripts/copy-legacy.mjs` filters out any `_source/` directory,
so this folder is never copied into `dist/` and never served on the web. Edit the
deployed mockup at `masscomm-preview/*.html` + `masscomm-preview/assets/`; the
body stylesheet ships at the repo root as `mc-body.css`.

Contents:
- `*.md` — the redesign packet (accessibility notes, hosting, handoff, roadmap,
  content-retention plan, video brief, cover notes).
- `body-copy/` — the per-page body-copy source variants (`*-body-BEST.html`), the
  `mc-body.css` source, and preview/verify harnesses.
