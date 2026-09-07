# Pending UMC artwork — placeholders in place

**Status: waiting on University Marketing and Communications. Requested 2026-09-07.**
Contact: marketing@siue.edu

The SIUE Visual Identity Requirements took effect 2026-09-01. They state that departments
and offices may not create or use their own logos, icons, seals or visual identities (p.7),
and that secondary logos, icons, emblems and unofficial visual identities are not permitted
(p.8). AURA Lab is not among the approved exceptions on p.23.

The lab's mark was therefore **removed, not redesigned in-house**. Drawing a replacement
ourselves would create a new violation rather than cure the old one, and any lockup carrying
the department name must be built by UMC (p.7).

## What is currently a placeholder

| Where | Current state | Restore when artwork arrives |
|---|---|---|
| `src/layouts/BaseLayout.astro` | No `<link rel="icon">` at all. Browsers show their default. | Add the icon links back. |
| `src/layouts/BaseLayout.astro` | No `og:image`; `twitter:card` downgraded to `summary`. Link previews are title + description only. | Restore `og:image` and set `twitter:card` back to `summary_large_image`. |
| `public/site.webmanifest` | `"icons": []` | Repopulate with official 192px and 512px icons. |
| `src/components/Nav.astro` | Site name is plain text. The red diamond emblem is gone. | Place the official signature line lockup per UMC guidance. |
| `brand/_retired-2026-09/` | The old AURA logo and icon sources, retired for provenance. | Nothing. **Do not reuse or regenerate these.** |

## Deliberately deferred — the GitHub org avatar

`github.com/AURA-Lab-SIUE` still shows the old purple "A" monogram. **This is a known open
item, left in place on purpose (owner, 2026-09-07). Do not swap it for a placeholder.**

Verified against the live settings page on 2026-09-07: **GitHub provides no way to remove an
organization avatar.** There is no form posting to an avatar route and no remove control; the
profile-picture block offers only "Upload new picture." An org can replace its avatar but
cannot clear it, so the browser-default fallback used for the favicon is not available here.

That leaves only "upload something else," and the monogram is outdated regardless. Rather than
spend one change on an interim tile and a second on the real artwork, it gets a single
deliberate update once UMC answers question 2 below, which is exactly this case.

## Open questions with UMC (asked 2026-09-07)

1. The official **Mass Communications signature line lockup**, in vector, in the approved
   colour variants. The department does not have one built.
2. **What a unit website should use for a browser tab icon and an app icon.** A signature
   line is not legible at 32 pixels and the requirements do not cover the case. This is the
   blocker for the favicon and the manifest.
3. Whether a **named research lab** operates under the department signature line only, or
   may carry an approved identity of its own.
4. Whether **Gold (2.75:1) and Gray (1.55:1)** are intended as non-text colours, since the
   same page requires WCAG AA. If they are meant to carry text, darker variants are needed.
5. Whether a **sanctioned dark-background treatment** for SIUE Red exists. Red measures
   4.05:1 on near-black and 3.73:1 on a raised card, so it is held to large text and
   non-text accents in the dark theme.
6. Whether "effective immediately" or "three years of transition" governs already-published
   material.

## What is already compliant and should not be changed back

- Palette is the approved one (p.25): white ground, black ink, SIUE Red `#e5182d` as the
  accent, PMS 427 gray `#cdd0cf` for rules. The invented "brick" red is gone.
- Typefaces are the approved web families (p.28, p.39): Source Sans 3 and Source Serif 4,
  Arial fallback. Archivo, Newsreader and Spline Sans Mono were dropped.
- Heading order runs h1 down with no skips on every Astro page.
- Contrast is held to **WCAG 2.1 AA**, the floor SIUE is bound by as a public university
  (ADA Title II, Illinois IITAA) and the level the requirements themselves name.

Related: the MassComm Checkout deployment carried the same problem and is handled on the
`brand/siue-compliance-2026-09` branch of the gearout repo.
