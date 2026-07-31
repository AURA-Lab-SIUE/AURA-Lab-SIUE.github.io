# Fonts in this directory

Eight static faces used by the CV build (`cv-header.tex` → `Leith_CV.pdf`).
They are instanced from the Google Fonts variable originals by `../make_fonts.py`;
do not hand-edit them.

| Family | Faces | Role |
|---|---|---|
| **Archivo** | Regular, Bold, Italic, BoldItalic | display — name block, section headings |
| **Jakarta** (Plus Jakarta Sans) | Regular, Bold, Italic, BoldItalic | body text |

Both are the same pair apleith.com self-hosts, so the CV reads as part of the
"Instrument" identity rather than a separate document.

## Why not reuse the site's WOFF2 files

`apleith.github.io/fonts/*.woff2` cannot drive this build:

1. xelatex reads TTF/OTF, not WOFF2.
2. They are variable fonts; the build needs pinned weights.
3. They are subset to Latin and common punctuation, and ship **no italic** —
   the CV sets every journal name in italic.

`make_fonts.py` pulls the unsubset variable originals and pins Regular/Bold in
both upright and italic, which resolves all three.

## Licensing

Both families are licensed under the **SIL Open Font License, Version 1.1**
(<https://scripts.sil.org/OFL>), which permits embedding in a PDF.

- **Archivo** — Copyright (c) The Archivo Project Authors
  (<https://github.com/Omnibus-Type/Archivo>)
- **Plus Jakarta Sans** — Copyright (c) The Plus Jakarta Sans Project Authors
  (<https://github.com/tokotype/PlusJakartaSans>)

Instancing a variable font and renaming the instance is a Modified Version under
the OFL. Neither family's Reserved Font Name is used in the generated file names.
