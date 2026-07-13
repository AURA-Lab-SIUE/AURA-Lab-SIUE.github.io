"""Build icon source SVGs (favicon tile, flat app tile) + a 1200x630 OG image."""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from brandkit import *

OUT=HERE+"/out/icons"; os.makedirs(OUT,exist_ok=True)

def grid512(color): return grid_rect(0,0,512,512,32,color,1)

# favicon.svg — paper tile (works on light/dark browser tabs), simplified bold mark
def favicon_svg():
    body=f'<rect width="512" height="512" rx="96" fill="{PAPER}"/>'
    body+=grid512("rgba(30,27,24,0.05)")
    # simplified bold mark, larger safe area for 16px legibility
    s=512*0.60; inner=(512-s)/2
    mk=(f'<path d="M25 82 L60 45 L95 82" fill="none" stroke="{INK}" stroke-width="15" stroke-linejoin="round" stroke-linecap="round"/>'
        f'<line x1="17" y1="101" x2="103" y2="101" stroke="{BRICK}" stroke-width="7" stroke-linecap="round"/>'
        + diamond(60,37,14,SIUE))
    body+=f'<g transform="translate({inner:.1f} {inner*0.96:.1f}) scale({s/120:.4f})">{mk}</g>'
    return svg_doc(512,512,body)

# flat app tile (full-bleed square; platform masks) — paper, grid, full mark
def app_flat(dark=False):
    ground=INK_GROUND if dark else PAPER
    gc="rgba(240,236,228,0.055)" if dark else "rgba(30,27,24,0.05)"
    mk=mark_inner(caret=(PAPER_HI if dark else INK), axis=(BRICK_LIFT if dark else BRICK),
                  tick=(BRICK_LIFT if dark else BRICK), dia=SIUE)
    s=512*0.62; inner=(512-s)/2
    body=f'<rect width="512" height="512" fill="{ground}"/>'+grid_rect(0,0,512,512,32,gc,1)
    body+=f'<g transform="translate({inner:.1f} {inner*0.92:.1f}) scale({s/120:.4f})">{mk}</g>'
    return svg_doc(512,512,body)

# 1200x630 OG / social card
def og_image(dark=False):
    T=dict(ground=(INK_GROUND if dark else PAPER),
           grid=("rgba(240,236,228,0.05)" if dark else "rgba(30,27,24,0.05)"),
           word=(PAPER_HI if dark else INK), soft=(SOFT_DK if dark else INKSOFT),
           caret=(PAPER_HI if dark else INK), axis=(BRICK_LIFT if dark else BRICK),
           fig=(BRICK_LIFT if dark else BRICK), red=SIUE, tickc=(SOFT_DK if dark else INKSOFT))
    W,H=1200,630
    body=f'<rect width="{W}" height="{H}" fill="{T["ground"]}"/>'+grid_rect(0,0,W,H,W/24,T["grid"],1)
    # FIG tag
    g1,w1,_=path_text("FIG. 01",MONO5,17,500,T["fig"],0,0,tracking=0.06)
    g2,w2,_=path_text("  —  THE FIELD",MONO5,17,500,T["soft"],0,0,tracking=0.06)
    body+=f'<g transform="translate({W*0.07:.0f} {H*0.13:.0f})">{g1[g1.find(">")+1:g1.rfind("<")]}</g>'
    body+=f'<g transform="translate({W*0.07+w1:.0f} {H*0.13:.0f})">{g2[g2.find(">")+1:g2.rfind("<")]}</g>'
    # centered lockup: mark + AURA Lab
    word,ww,cap=path_text("AURA Lab",ARCHIVO,92,800,T["word"],0,0,tracking=-0.006)
    ms=(cap*1.5/74.0); mkw=106*ms
    total=mkw+40+ww; startx=(W-total)/2; basey=H*0.50
    mky=(basey-cap/2)-63*ms
    body+=mark_group(startx,mky,ms,caret=T["caret"],axis=T["axis"],tick=T["axis"],dia=T["red"])
    body+=f'<g transform="translate({startx+mkw+40:.1f} {basey:.1f})">{word[word.find(">")+1:word.rfind("<")]}</g>'
    # acronym centered under wordmark
    _,aw=run_text(acronym_segs(T["axis"],T["soft"],T["soft"]),ARCHIVO,25,700,0,0,tracking=0.02)
    acr,_=run_text(acronym_segs(T["axis"],T["soft"],T["soft"]),ARCHIVO,25,700,(W-aw)/2,basey+58,tracking=0.02)
    body+=acr
    # affiliation small bottom center
    aff,awf,_=path_text("SIUE · MASS COMMUNICATIONS",ARCHIVO,16,700,T["soft"],0,0,tracking=0.16)
    body+=f'<g transform="translate({(W-awf)/2:.1f} {H*0.86:.0f})">{aff[aff.find(">")+1:aff.rfind("<")]}</g>'
    return svg_doc(W,H,body)

if __name__=='__main__':
    open(f"{OUT}/favicon.svg","w").write(favicon_svg())
    open(f"{OUT}/app-flat.svg","w").write(app_flat(False))
    open(f"{OUT}/app-flat-dark.svg","w").write(app_flat(True))
    open(f"{OUT}/og-image.svg","w").write(og_image(False))
    open(f"{OUT}/og-image-dark.svg","w").write(og_image(True))
    print("icons built")
