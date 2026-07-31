"""Regenerate the static font faces in resume-cv/fonts/ for the CV build.

The CV renders through pandoc + xelatex, which needs static TTF/OTF faces.
The site self-hosts Archivo and Plus Jakarta Sans as variable WOFF2, which
xelatex cannot read, and those web copies are subset to Latin and carry no
italic. So we instance the full variable originals from Google Fonts instead.

    python make_fonts.py

Both families are SIL Open Font License 1.1; see fonts/OFL-NOTICE.md.
Requires: fonttools, brotli.
"""
import io
import urllib.request

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RAW = "https://raw.githubusercontent.com/google/fonts/main/"
SOURCES = {
    "Archivo-VF": "ofl/archivo/Archivo%5Bwdth,wght%5D.ttf",
    "Archivo-Italic-VF": "ofl/archivo/Archivo-Italic%5Bwdth,wght%5D.ttf",
    "Jakarta-VF": "ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf",
    "Jakarta-Italic-VF": "ofl/plusjakartasans/PlusJakartaSans-Italic%5Bwght%5D.ttf",
}
# Archivo carries a width axis as well; pin it to normal so the instance is
# unambiguous. Jakarta has weight only.
JOBS = [
    ("Archivo-VF", {"wght": 400, "wdth": 100}, "Archivo-Regular.ttf"),
    ("Archivo-VF", {"wght": 700, "wdth": 100}, "Archivo-Bold.ttf"),
    ("Archivo-Italic-VF", {"wght": 400, "wdth": 100}, "Archivo-Italic.ttf"),
    ("Archivo-Italic-VF", {"wght": 700, "wdth": 100}, "Archivo-BoldItalic.ttf"),
    ("Jakarta-VF", {"wght": 400}, "Jakarta-Regular.ttf"),
    ("Jakarta-VF", {"wght": 700}, "Jakarta-Bold.ttf"),
    ("Jakarta-Italic-VF", {"wght": 400}, "Jakarta-Italic.ttf"),
    ("Jakarta-Italic-VF", {"wght": 700}, "Jakarta-BoldItalic.ttf"),
]

blobs = {}
for name, path in SOURCES.items():
    with urllib.request.urlopen(RAW + path) as r:
        blobs[name] = r.read()
    print(f"fetched {name} ({len(blobs[name]):,} bytes)")

for src, axes, dst in JOBS:
    font = TTFont(io.BytesIO(blobs[src]))
    inst = instancer.instantiateVariableFont(
        font, axes, inplace=False, updateFontNames=True
    )
    inst.save(f"fonts/{dst}")
    print(f"wrote fonts/{dst}")
