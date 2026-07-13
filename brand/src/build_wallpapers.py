"""AURA Lab wallpapers — 'Field Plate'. Adaptive landscape/portrait, light/ink."""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from brandkit import *

OUT=HERE+"/out/wall"; os.makedirs(OUT,exist_ok=True)
SETTINGS=["stream","server","headset","feed","room"]

def theme(dark):
    if dark:
        return dict(ground=INK_GROUND, grid="rgba(240,236,228,0.05)", fig=BRICK_LIFT,
                    soft=SOFT_DK, caret=PAPER_HI, axis=BRICK_LIFT, word=PAPER_HI,
                    wm=PAPER_HI, wm_op=0.05, red=SIUE, tickc="#8a8478")
    return dict(ground=PAPER, grid="rgba(30,27,24,0.055)", fig=BRICK,
                soft=INKSOFT, caret=INK, axis=BRICK, word=INK,
                wm=INK, wm_op=0.045, red=SIUE, tickc=INKSOFT)

def settings_axis(cx0, cx1, y, T, unit, lab_sz, red_at=2):
    """Horizontal annotated axis with 5 mono-labelled ticks; one red diamond."""
    body=f'<line x1="{cx0:.1f}" y1="{y:.1f}" x2="{cx1:.1f}" y2="{y:.1f}" stroke="{T["word"]}" stroke-width="{unit*0.9:.2f}" stroke-linecap="round" opacity="0.85"/>'
    n=len(SETTINGS); span=cx1-cx0
    for i,lab in enumerate(SETTINGS):
        x=cx0+span*(0.06+0.88*i/(n-1))
        body+=f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y+unit*4:.1f}" stroke="{T["tickc"]}" stroke-width="{unit*0.8:.2f}" stroke-linecap="round"/>'
        g,w,cap=path_text(lab, MONO, lab_sz, 400, T["soft"], 0, 0, tracking=0.02)
        body+=f'<g transform="translate({x-w/2:.1f} {y+unit*4+lab_sz+unit*2:.1f})">{g[g.find(">")+1:g.rfind("<")]}</g>'
        if i==red_at:
            body+=diamond(x, y, unit*2.4, T["red"])
    return body

def lockup(x, y, mscale, T, size, acr_sz):
    """mark + AURA Lab + acronym, anchored at baseline y (wordmark baseline), left x."""
    word_g,ww,cap=path_text("AURA Lab", ARCHIVO, size, 800, T["word"], 0,0, tracking=-0.006)
    mk_h=cap*1.46; ms=mk_h/74.0*mscale
    # place mark left of word, vertically centred on cap block
    mk_w=106*ms
    tx=x+mk_w+size*0.26
    mkg=mark_group(x, y-cap - (74*ms-mk_h)/2 - 26*ms + (cap+ (0))*0, ms,
                   caret=T["caret"], axis=T["axis"], tick=T["axis"], dia=T["red"])
    # simpler vertical: mark content y26..100 (74). center at (y-cap/2). top = y-cap/2 - 37*ms
    mky = (y-cap/2) - 63*ms
    mkg=mark_group(x, mky, ms, caret=T["caret"], axis=T["axis"], tick=T["axis"], dia=T["red"])
    wg=f'<g transform="translate({tx:.1f} {y:.1f})">{word_g[word_g.find(">")+1:word_g.rfind("<")]}</g>'
    acr,aw=run_text(acronym_segs(T["axis"], T["soft"], T["soft"]), ARCHIVO, acr_sz, 700, tx, y+acr_sz*1.7, tracking=0.012)
    return mkg+wg+acr, tx+max(ww,aw)

def figtag(x,y,T,sz):
    g1,w1,_=path_text("FIG. 01", MONO5, sz, 500, T["fig"], 0,0, tracking=0.06)
    g2,w2,_=path_text("  —  THE FIELD", MONO5, sz, 500, T["soft"], 0,0, tracking=0.06)
    inner1=g1[g1.find(">")+1:g1.rfind("<")]; inner2=g2[g2.find(">")+1:g2.rfind("<")]
    return f'<g transform="translate({x:.1f} {y:.1f})">{inner1}</g><g transform="translate({x+w1:.1f} {y:.1f})">{inner2}</g>'

def wallpaper(W,H,dark=False):
    T=theme(dark); portrait = H>=W
    u = (W if not portrait else H)/240.0   # base unit
    body=f'<rect width="{W}" height="{H}" fill="{T["ground"]}"/>'
    # grid
    cols = 26 if not portrait else 15
    step=W/cols
    body+=grid_rect(0,0,W,H,step,T["grid"],max(1,W/2600))
    # watermark oversized mark
    wm_s=(min(W,H)*0.9)/120
    if portrait:
        wmx=W-120*wm_s*0.62; wmy=H-120*wm_s*0.86
    else:
        wmx=W-120*wm_s*0.66; wmy=H-120*wm_s*0.82
    body+=f'<g opacity="{T["wm_op"]}">'+mark_group(wmx,wmy,wm_s,caret=T["wm"],axis=T["wm"],tick=T["wm"],dia=T["wm"])+'</g>'
    # FIG tag top-left
    body+=figtag(W*0.06, H*(0.085 if not portrait else 0.10), T, u*3.4)
    if portrait:
        axis_y=H*0.585
        body+=settings_axis(W*0.09, W*0.91, axis_y, T, u*1.05, u*3.05, red_at=2)
        lg,_=lockup(W*0.10, H*0.80, 1.0, T, u*10.5, u*3.2)
        body+=lg
    else:
        axis_y=H*0.62
        body+=settings_axis(W*0.10, W*0.66, axis_y, T, u*1.0, u*3.9, red_at=2)
        lg,_=lockup(W*0.10, H*0.83, 1.0, T, u*9.0, u*2.8)
        body+=lg
    return svg_doc(W,H,body)

MATRIX=[
    ("desktop-3840x2160",3840,2160),
    ("desktop-2560x1440",2560,1440),
    ("desktop-1920x1080",1920,1080),
    ("tablet-landscape-2560x1600",2560,1600),
    ("phone-1080x2340",1080,2340),
    ("phone-1440x3120",1440,3120),
    ("tablet-portrait-1600x2560",1600,2560),
    ("tablet-portrait-2048x2732",2048,2732),
]

if __name__=='__main__':
    for name,W,H in MATRIX:
        for theme_name,dark in (("light",False),("ink",True)):
            fn=f"{name}-{theme_name}"
            open(f"{OUT}/{fn}.svg","w").write(wallpaper(W,H,dark))
    print(f"wrote {len(MATRIX)*2} wallpaper SVGs")
