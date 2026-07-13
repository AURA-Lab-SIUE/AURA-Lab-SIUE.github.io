# AURA Lab — Logo & Marks

A vector identity for the **"Instrument, in warm paper"** system (see `DESIGN-NOTES.md`).
Everything here is drawn from what the lab does, not decoration.

## The mark — "The Reading"

A plotted **reading** (a peak) rising to a **measured point** — the SIUE-red diamond —
over the lab's **settings axis**. It says, in one glyph, *we bring measurement to the
places people live online.*

- **The diamond** is the same institutional atom as the nav wordmark tick: the single
  place the **exact SIUE University Red `#e5182d`** is allowed. One high-intent moment.
- **The axis carries four graduation ticks — one per AURA dimension:**
  **A**vatars · **U**sers · **R**elationships · **A**ffect. The acronym is built into the mark.
- Everything else is warm neutrals + one calm **brick** red (`#a8322a`), so the system stays
  essentially monochromatic-red on paper — institutionally SIUE, never loud.

It reads as a caret/ascent (an "A" for AURA) without being a literal letter, and holds down
to a 16 px favicon.

## Files

```
logo/svg/   logo-mark            the mark, transparent  (inline / nav / hero)
            logo-mark-reversed   the mark for dark grounds
            logo-full            horizontal lockup: mark + "AURA Lab" + Avatars·Users·Relationships·Affect
            logo-full-affil      same, with "SIUE · Mass Communications" instead of the expansion
            logo-full-reversed / logo-full-affil-reversed   for dark grounds
            logo-square          app tile, warm paper + faint graph grid, rounded
            logo-square-dark     app tile, ink ground
            logo-maskable        full-bleed square, tight safe area (PWA maskable)
            favicon              paper tile + simplified mark (works on light & dark tabs)
logo/png/   1024 px marks/tiles + 2048 px lockups (transparent where applicable)
icons/      favicon.ico (16/32/48), favicon.svg, apple-touch-icon (180),
            icon-192, icon-512, aura-mark (512 square), aura-mark-sq.jpg, og-image (1200×630)
wallpapers/ desktop 3840/2560/1920 (16:9) · tablet 2560×1600 & 1600×2560 (16:10) & 2048×2732 (4:3)
            · phone 1080×2340 & 1440×3120 (19.5:9) — each in light + ink, PNG + SVG master
```

## Palette (from `src/styles/tokens.css`)

| Token | Value | Use in the marks |
|---|---|---|
| paper | `#f6f3ec` | tile ground, light wallpapers |
| ink | `#1e1b18` | the caret (peak) |
| brick | `#a8322a` | the axis + graduation ticks, the A·U·R·A initials |
| **SIUE red** | **`#e5182d`** | **the diamond only** — the one institutional mark |
| ink ground | `#171412` | dark tiles / ink wallpapers |
| paper-hi / brick-lift | `#f2eee6` / `#c85a48` | reversed (dark-ground) caret / axis |

Type in the lockups is **Archivo** (800 wordmark, 700 descriptor), converted to outlines so
the SVGs render identically without the font installed.

## Clear space & minimum size

- Keep clear space of at least the diamond's width around the mark and lockup.
- Mark: min 16 px (use `favicon.svg` below ~32 px — it drops the graduations for legibility).
- Never recolour the diamond, add a second true-red, stretch, add gradients/glow, or place the
  light mark on a busy photo. On dark grounds use the `-reversed` / `-dark` files.

## Regenerating

Sources are parametric Python + a Node/sharp rasteriser (`build_*.py`, `text2path.py`,
`brandkit.py`, `raster.mjs`). Re-run `package.sh` to rebuild every SVG/PNG from scratch.
