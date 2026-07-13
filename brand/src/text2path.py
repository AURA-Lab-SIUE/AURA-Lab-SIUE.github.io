"""Convert a short string in a (variable) font to a single SVG path `d`,
in a y-DOWN coordinate system (SVG), baseline at y=0. Returns dict with
d, width (advance, in the given font-size units), cap height, ascent, descent.

Usage:
  from text2path import text_path
  r = text_path("AURA LAB", FONT, size=100, wght=800, tracking=0.02)
"""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

_CACHE = {}

def _load(path, wght):
    key = (path, wght)
    if key in _CACHE:
        return _CACHE[key]
    f = TTFont(path)
    if 'fvar' in f and wght is not None:
        instantiateVariableFont(f, {'wght': wght}, inplace=True)
    _CACHE[key] = f
    return f

def text_path(text, font_path, size=100.0, wght=None, tracking=0.0, letters=False):
    """tracking = extra letter-spacing as a fraction of em (e.g. 0.02).
    letters=True -> also return per-glyph metrics list."""
    f = _load(font_path, wght)
    upm = f['head'].unitsPerEm
    scale = size / upm
    gset = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f['hmtx']
    track_units = tracking * upm
    x = 0.0
    combined = []
    glyphinfo = []
    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None:
            # space fallback
            adv = hmtx['space'][0] if 'space' in hmtx.metrics else upm * 0.3
            x += adv + track_units
            continue
        pen = SVGPathPen(gset)
        # flip y (font up -> svg down), translate by x, scale
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0))
        gset[gname].draw(tpen)
        d = pen.getCommands()
        if d:
            combined.append(d)
        adv = hmtx[gname][0]
        glyphinfo.append({'ch': ch, 'x': x * scale, 'adv': adv * scale})
        x += adv + track_units
    total_w = x * scale
    # metrics
    try:
        cap = f['OS/2'].sCapHeight * scale
    except Exception:
        cap = 0.7 * size
    asc = f['hhea'].ascent * scale
    desc = f['hhea'].descent * scale
    out = {'d': ' '.join(combined), 'width': total_w, 'cap': cap,
           'ascent': asc, 'descent': desc}
    if letters:
        out['letters'] = glyphinfo
    return out

if __name__ == '__main__':
    import sys
    ARCHIVO = "banned-words/fonts/archivo-latin-wght-normal.woff2"
    r = text_path("AURA LAB", ARCHIVO, size=100, wght=800, tracking=0.0)
    print("width", round(r['width'],1), "cap", round(r['cap'],1))
    print(r['d'][:120], "...")
