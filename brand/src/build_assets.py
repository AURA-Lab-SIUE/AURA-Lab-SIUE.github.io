"""Build the final AURA Lab brand asset SVGs (outlined text, portable).
Mark = a plotted 'reading' peaking at the SIUE-red diamond over the settings
axis; the axis carries 4 graduation ticks = the AURA dimensions
(Avatars, Users, Relationships, Affect)."""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from text2path import text_path

REPO="C:/Users/alexl/dev/AURA-Lab-SIUE.github.io"
ARCHIVO=REPO+"/banned-words/fonts/archivo-latin-wght-normal.woff2"

PAPER="#f6f3ec"; CARD="#fcfbf7"; INK="#1e1b18"; INKSOFT="#6b6357"
BRICK="#a8322a"; BRICKDEEP="#872619"; SIUE="#e5182d"
PAPER_HI="#f2eee6"; BRICK_LIFT="#c85a48"; SOFT_DK="#b8b0a4"
INK_GROUND="#171412"; GRID_D="rgba(240,236,228,0.055)"; GRID_L="rgba(30,27,24,0.05)"

OUT=HERE+"/out/final"; os.makedirs(OUT,exist_ok=True)

def diamond(cx,cy,half,fill,rx=1.8):
    return (f'<rect x="{cx-half:.2f}" y="{cy-half:.2f}" width="{half*2:.2f}" height="{half*2:.2f}" '
            f'rx="{rx}" transform="rotate(45 {cx:.2f} {cy:.2f})" fill="{fill}"/>')

def mark_inner(caret=INK, axis=BRICK, tick=BRICK, dia=SIUE, sw=13):
    """Mark in a local 120x120 box. 4 graduation ticks = AURA dimensions."""
    s =f'<path d="M24 84 L60 47 L96 84" fill="none" stroke="{caret}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
    s+=f'<line x1="14" y1="100" x2="106" y2="100" stroke="{axis}" stroke-width="4.5" stroke-linecap="round"/>'
    for x in (30,50,70,90):
        s+=f'<line x1="{x}" y1="100" x2="{x}" y2="92.5" stroke="{tick}" stroke-width="3.2" stroke-linecap="round"/>'
    s+=diamond(60,38,12,dia)
    return s

def svg(w,h,body,vb=None):
    vb=vb or f"0 0 {w} {h}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}" '
            f'role="img" aria-label="AURA Lab">{body}</svg>')

# ---------- helpers: colored, laid-out outlined text ----------
def run(segments, font, size, wght, tracking=0.0, y=0.0, x0=0.0):
    """segments: list of (text,color). Returns (svg_group, total_width)."""
    x=x0; parts=[]
    for text,color in segments:
        r=text_path(text, font, size=size, wght=wght, tracking=tracking)
        if r['d']:
            parts.append(f'<g transform="translate({x:.2f} {y:.2f})"><path d="{r["d"]}" fill="{color}"/></g>')
        x+=r['width']
    return ''.join(parts), x-x0

def word_initcap(word, cap_color, rest_color, font, size, wght, tracking):
    return [(word[0],cap_color),(word[1:],rest_color)]

def expansion_segments(cap_color, rest_color, sep_color):
    words=["Avatars","Users","Relationships","Affect"]
    segs=[]
    for i,w in enumerate(words):
        segs+= [(w[0],cap_color),(w[1:],rest_color)]
        if i<len(words)-1: segs.append(("  ·  ",sep_color))
    return segs

# ---------- 1. logo-mark ----------
open(f"{OUT}/logo-mark.svg","w").write(svg(120,120,mark_inner()))
open(f"{OUT}/logo-mark-reversed.svg","w").write(
    svg(120,120,mark_inner(caret=PAPER_HI, axis=BRICK_LIFT, tick=BRICK_LIFT, dia=SIUE)))

# ---------- 2. favicon (simplified, bolder, no graduations) ----------
fav=(f'<path d="M25 82 L60 45 L95 82" fill="none" stroke="{INK}" stroke-width="15" stroke-linejoin="round" stroke-linecap="round"/>'
     f'<line x1="17" y1="101" x2="103" y2="101" stroke="{BRICK}" stroke-width="7" stroke-linecap="round"/>'
     + diamond(60,37,14,SIUE))
open(f"{OUT}/favicon.svg","w").write(svg(120,120,fav))

# ---------- 3. app-icon tiles ----------
def grid(x0,y0,x1,y1,step,color,w=1):
    s=f'<g stroke="{color}" stroke-width="{w}">'; x=x0
    while x<=x1: s+=f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y1}"/>'; x+=step
    y=y0
    while y<=y1: s+=f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}"/>'; y+=step
    return s+'</g>'

def tile(bg, gridc, mk, radius=112, safe=0.66):
    inner=(512-512*safe)/2; scale=(512*safe)/120
    body =f'<rect width="512" height="512" rx="{radius}" fill="{bg}"/>'
    body+=grid(0,0,512,512,32,gridc,1)
    body+=f'<g transform="translate({inner:.1f} {inner*0.92:.1f}) scale({scale:.4f})">{mk}</g>'
    return svg(512,512,body)

open(f"{OUT}/logo-square.svg","w").write(tile(PAPER, GRID_L, mark_inner()))
open(f"{OUT}/logo-square-dark.svg","w").write(
    tile(INK_GROUND, GRID_D, mark_inner(caret=PAPER_HI, axis=BRICK_LIFT, tick=BRICK_LIFT, dia=SIUE)))
open(f"{OUT}/logo-maskable.svg","w").write(tile(PAPER, GRID_L, mark_inner(), radius=0, safe=0.52))

# ---------- 4. horizontal lockups ----------
def lockup(descriptor, fname, reversed=False):
    ink   = PAPER_HI if reversed else INK
    soft  = SOFT_DK  if reversed else INKSOFT
    caretc= PAPER_HI if reversed else INK
    axisc = BRICK_LIFT if reversed else BRICK
    brickc= BRICK_LIFT if reversed else BRICK
    H=132
    # mark height ~1.5x cap; align mark center to wordmark cap center
    word=text_path("AURA Lab", ARCHIVO, size=76, wght=800, tracking=-0.006)
    cap=word['cap']
    cap_top=34; baseline=cap_top+cap
    # mark: native content y 26..100 (h=74), w 14..106 (92). scale to height Hm
    Hm=cap*1.46; mscale=Hm/74.0
    mx=8
    mark_cx_center=(cap_top+baseline)/2
    my=mark_cx_center - (26+74/2)*mscale
    mark_g=f'<g transform="translate({mx:.1f} {my:.1f}) scale({mscale:.4f})">{mark_inner(caret=caretc,axis=axisc,tick=axisc,dia=SIUE)}</g>'
    mark_w=106*mscale
    tx=mx+mark_w+20
    wm=f'<g transform="translate({tx:.1f} {baseline:.1f})"><path d="{word["d"]}" fill="{ink}"/></g>'
    # descriptor line
    if descriptor=="acronym":
        segs=expansion_segments(brickc, soft, soft)
        dsize=15.0; dtrack=0.012
    else:
        segs=[("SIUE",soft),("   ·   ",soft),("MASS COMMUNICATIONS",soft)]
        dsize=14.5; dtrack=0.16
    dy=baseline+26
    dg,dw=run(segs, ARCHIVO, dsize, 700, tracking=dtrack, y=dy, x0=tx+1)
    total_w=max(tx+word['width'], tx+dw)+10
    open(f"{OUT}/{fname}","w").write(svg(round(total_w),H,mark_g+wm+dg))
    return total_w

w1=lockup("acronym","logo-full.svg",False)
lockup("acronym","logo-full-reversed.svg",True)
lockup("affil","logo-full-affil.svg",False)
lockup("affil","logo-full-affil-reversed.svg",True)
print("done. acronym lockup width", round(w1))
