# Design Notes — AURA Lab

The rationale behind the site's visual system, kept so the choices are auditable rather
than arbitrary. The lab studies the lived experience of platforms, games, and virtual
worlds as social phenomena, and brings methods to the questions that arise there. The design
has to read as **serious, human, inviting, and methods-forward** — and to sit believably
alongside SIUE — while avoiding generic "AI-slop" design.

---

## 1. The direction: "The Instrument, in warm paper"

The site is a synthesis of two explored directions:

- **Structure = "The Instrument."** The lab brings measurement to messy social life, so the
  visual language is warm scientific plotting: a faint **graph-paper grid**, **`FIG.` labels**,
  an annotated **axis** of the settings we study (stream → server → headset → feed → room),
  mono readouts, and figure-plate cards. The *structure* is the ornament — it's derived from
  what the lab actually does, not decoration.
- **Palette + voice = "The Reader."** Warm bone paper, near-black ink, an expressive
  grotesque display over a readable serif body — the feel of a serious little magazine about
  digital social life (*Logic(s)*, *Real Life*). This carries the director's ethos: *publish
  to be read and reused.*

This also pulls the lab toward **SIUE.edu's** own posture: a light institutional ground,
near-black text, restrained red, grotesque headings over serif body, generous whitespace.

## 2. Type

Three families, three clear jobs (all self-hosted via `@fontsource`):

| Role | Typeface | Where |
|---|---|---|
| Display / headlines | **Archivo** (grotesque, 800) | `h1`–`h3`, hero, section titles |
| UI / labels | **Archivo** | nav, kickers, `.seclabel`, badges, buttons |
| Body copy | **Newsreader** (serif) | paragraphs, decks — bookish, readable |
| Data / labels | **Spline Sans Mono** | `FIG.` tags, axis ticks, stat readouts, code |

Grotesque-headings-over-serif-body deliberately echoes SIUE's own pairing (URW Grotesk /
ITC Slimbach) with free stand-ins, so we align without licensing their fonts.

## 3. Color — one working accent, one institutional mark

The earlier bright-SIUE-red-on-dark theme was retired: forcing `#e5182d` as the primary
accent fought the lab's character. The system now is **warm neutrals + a single calm red**:

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f6f3ec` | page ground (warm bone) |
| `--card` | `#fcfbf7` | raised surface |
| `--ink` | `#1e1b18` | body text — ~15:1 on paper (AAA) |
| `--ink-soft` | `#6b6357` | secondary text |
| **`--brick`** | **`#a8322a`** | **the working accent** — links, `FIG.` tags, rules, active states, buttons. Collegiate red, ~6:1 on paper (AA). Calm, not a siren. |
| `--brick-deep` | `#872619` | hover / pressed |
| **`--siue`** | **`#e5182d`** | **exact SIUE University Red — used in exactly ONE place:** the diamond tick beside the wordmark. The institutional "whisper." |

Keeping the true brand red for a single high-intent mark (and the working accent as a
brick shade of the *same hue*) means the palette is essentially **monochromatic red on warm
neutrals** — institutionally SIUE, but never loud, and with no second hue to clash.

Legacy `--paper-*` / `--siue-red-*` tokens are kept as aliases pointing at the new palette, so
the New Students pages restyled for free.

**Dark mode (reinstated 2026-07-13, owner request).** The site now ships a real **cool-charcoal
dark theme** (`#101113` ground, off-white ink, lifted brick `#e05a4a`), derived from the
director's headshot — deliberately *not* warm brown. The brick is lifted enough that brick
*text* clears AA on charcoal; solid red *fills* that carry white text use separate
`--brick-fill` / `--brick-fill-deep` tokens (`#c33d2e` / `#b0301f`), since the lifted accent is
too light under white text. See §5. It's the **default**, with a nav toggle to
warm-paper light (persisted in `localStorage`, FOUC-safe via an inline `<head>` script). Only the
base tokens are overridden under `:root[data-theme="dark"]`; every semantic alias is late-bound
`var()`, so the whole component library restyles for free. The true SIUE red is kept in both themes
as the one institutional mark.

**The homepage hero is now a live flow field** (`FieldHero.astro`): the online crowd as a
divergence-free curl-noise field — people flow in streams, the cursor is a *presence* they gather
around, and the field reports its own emergent state (coherence / flow / gathering). It reads as the
lab's subject without reusing the theories constellation's node-edge grammar; reduced-motion users
get a calm settled frame.

## 4. Anti-"AI-slop" stance

Explicitly avoided (all flagged as 2026 slop tells): purple/blue gradient meshes, glowing
orbs/"auras" (notable given the lab's name — the old hero's aura-ring glow is gone),
glassmorphism, neon-on-black dark mode, the one-sided thick accent-border card, generic
bento grids, Inter-for-everything, and stock "metaverse" avatars. The antidote used here:
one warm environment, one intentional accent, real typographic hierarchy, and a motif
(`FIG.`/grid/axis) that *means something* because it's drawn from the lab's methods.

## 4b. Logo & marks — "The Reading"

The identity is a vector mark drawn from the same motif as the site: a plotted **reading**
(a peak) rising to a **measured point** — the SIUE-red diamond — over the lab's **settings
axis**. The diamond is the same institutional atom as the nav wordmark tick, and remains the
single place the exact SIUE red `#e5182d` is allowed. The axis carries **four graduation ticks,
one per AURA dimension — Avatars · Users · Relationships · Affect** — so the acronym is built
into the mark; everything else is ink + brick, keeping the monochromatic-red-on-paper discipline.
It reads as a caret/ascent (an "A") without being a literal letter and holds down to a 16 px
favicon (which drops the graduations). The full lockup pairs the mark with "AURA Lab" (Archivo
800, outlined) over the expansion line with the A·U·R·A initials in brick.

This **retired the earlier off-brand assets**: the teal/orange `logo-*.svg` set and the
concentric "aura-ring glow" favicon (the very motif §4 says was dropped). Superseded files are
kept under `brand/_superseded/`. Full spec, palette, clear-space, and every export
(SVG/PNG icons + light/ink wallpapers for desktop, tablet, phone) live in `brand/` — see
`brand/BRAND-GUIDE.md`. Regenerate with `brand/src/package.sh`.

## 5. Accessibility

Targets **WCAG 2.1 / 2.2 AA**, verified with axe-core across all page templates in **both
themes** (0 violations).

- Ink `#1e1b18` on paper `#f6f3ec`: ~15:1 (AAA). Dark: ink `#ECEDEF` on `#101113` ~16:1.
- Brick text/links on ground: light `#a8322a` ~6:1, dark `#e05a4a` ~4.7–5.2:1 (both AA);
  `--brick-deep` is the hover tone.
- **Solid red fills carrying white text** use `--brick-fill` (light `#a8322a` ~6.7:1 with white;
  dark `#c33d2e` ~5.2:1) and `--brick-fill-deep` for hover — kept distinct from the accent
  because the lifted dark `--brick` under white text falls below AA. White on the `#e5182d`
  tick clears AA.
- Secondary/tertiary inks clear AA on their grounds (e.g. the theories skin's `--ink-3`
  is `#736b5d`, ~4.75:1 on paper).
- Focus rings (`:focus-visible`), a skip link, and reduced-motion handling live in the base
  layer; all motion respects `prefers-reduced-motion`. The auto-rotating framework instrument
  has an explicit pause control (2.2.2), and its selector + the theory-map controls carry
  correct roles and `aria-pressed` state (1.3.1 / 4.1.2).

> When adjusting accent colors or adding a solid-fill component, re-check contrast in **dark**
> mode first — it is the tighter constraint (a color that passes as text there can still fail
> under white, and vice-versa).

## 6. Motion

Restrained and meaningful only: a one-time serif/grotesque headline rise, a word-by-word
reveal on page `h1`s (the hero opts out via `data-no-split` because it contains a styled
span the reveal would flatten), link underlines that draw on hover, and card lift. No
gradients, glow, parallax, or gimmicks.

---

*Tokens: `src/styles/tokens.css`. Base + component classes (`.figtag`, `.seclabel`, `.card`,
`.pill`, `.link-underline`): `src/styles/global.css`. Fonts wired in `tailwind.config.mjs`.
Shared chrome: `Nav.astro`, `Footer.astro`, `Hero.astro`, `SectionDivider.astro`. Student
section: `src/pages/students/**` + `src/content/student-toolkit/toolkit.yaml`.*
