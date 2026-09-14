# Brand status — UMC has answered. One item left.

**Updated 2026-09-11 after Philip Sherrill, Director of Creative and Design, UMC, replied.**

## The answer

Use the **standard SIUE signature line as the primary brand identifier**, and identify AURA
Lab and Mass Communications **through page content and hierarchy** rather than through a mark
of their own. University leadership has directed UMC to bring departments, units, centers and
labs more closely under the SIUE brand and to reduce auxiliary logos and identities.

**There will be no AURA Lab mark and no Mass Communications lockup.** Do not build one, do not
commission one, and do not restore the retired artwork in `brand/_retired-2026-09/`.

## What is now in place

| Where | State |
|---|---|
| `src/components/SiueBar.astro` | Official signature line, upper left, in its own band above the nav, linking to siue.edu. Black on light, white on dark. |
| `public/img/siue-signature-line-*.png` | Official artwork, unmodified, from the UMC wordmarks download page. Never redraw, recolour or crop. |
| `src/styles/tokens.css` | `--accent-text` is ink on both themes. **Red carries no text anywhere.** |
| 50 CSS declarations across 16 files | Rewritten from red text to `--accent-text`. Red survives as rules, borders and fills only. |
| `scripts/copy-legacy.mjs` | `_archive` is no longer published. Files stay in the repo; they are simply not served. |

**Why "AURA Lab" is not next to the signature line:** units may not place their names above,
below or alongside it except through an approved lockup (Visual Identity Requirements p.7). The
separate band, the rule beneath it and the clearspace keep the institutional mark and the site
name visibly distinct. Do not "tidy" them onto one line.

**Clearspace (p.19):** no page element may enter a margin equal to the height of the signature
line. The bar owns its own 30px padding rather than inheriting the narrower page gutter. Do not
reduce it.

## Icons: RESOLVED 2026-09-14

**Approved twice, in writing.** Philip Sherrill (Director of Creative and Design) named the mark
and scoped it: "typically, for favicons, etc. you can use the single 'E' ... this is about the
only use the 'E' is available for." Keith Harris approved it outright: "I approve using the
single 'E' for this purpose. A PNG should work fine rather than a vector format."

**The artwork is SIUE's own.** The E is not on the Wordmarks for Download page and
`siue.edu/favicon.ico` is only 16x16, so the usable source is the **official SIUE Android app
icon** at 512px, from the `com.dub.app.siue` listing. Every size shipped here is a downscale of
that one file, so the rule above still holds: nothing was invented, traced or redrawn.

Restored: `<link rel="icon">` for `.ico` and 32px, `apple-touch-icon` at 180, and the manifest
`icons` array at 192 and 512. Masters kept at
`m4:/Volumes/One Touch/80-service-hr/service/masscomm-website-redesign/siue-brand-e/`.

## The one item still open

**The social card.** Both approvals are about icons. Whether a card counts as the same purpose
is a separate question that went to Keith and has not come back, so there is still **no
`og:image`** and `twitter:card` remains `summary`. A link preview falls back to title and
description, which is text only and compliant. Do not restore it on the strength of the icon
approval; ask.

The related question about vector files also went unanswered, and is now moot: the app icon is
raster and UMC approved raster explicitly.

## Colour rule, from UMC directly

Where there is any contrast concern, **use black or white for text** depending on the background,
rather than introducing colour variations outside the approved palette. That is why red is not a
text colour here even on the light theme, where it would have passed AA at 4.67:1.

## Do not revert

The approved palette, the Source Sans 3 / Source Serif 4 typefaces, the heading order, and the
WCAG 2.1 AA basis. Related: the MassComm Checkout deployment carries its own
`BRAND-PENDING-UMC.md` in the gearout repo.
