"""Shared AURA Lab brand primitives: palette, mark, outlined-text helpers."""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from text2path import text_path

REPO="C:/Users/alexl/dev/AURA-Lab-SIUE.github.io"
ARCHIVO=REPO+"/banned-words/fonts/archivo-latin-wght-normal.woff2"
MONO=REPO+"/node_modules/@fontsource/spline-sans-mono/files/spline-sans-mono-latin-400-normal.woff2"
MONO5=REPO+"/node_modules/@fontsource/spline-sans-mono/files/spline-sans-mono-latin-500-normal.woff2"

PAPER="#f6f3ec"; CARD="#fcfbf7"; INK="#1e1b18"; INKSOFT="#6b6357"
BRICK="#a8322a"; BRICKDEEP="#872619"; SIUE="#e5182d"
PAPER_HI="#f2eee6"; BRICK_LIFT="#c85a48"; SOFT_DK="#b8b0a4"
INK_GROUND="#171412"

def diamond(cx,cy,half,fill,rx=1.8):
    return (f'<rect x="{cx-half:.2f}" y="{cy-half:.2f}" width="{half*2:.2f}" height="{half*2:.2f}" '
            f'rx="{rx}" transform="rotate(45 {cx:.2f} {cy:.2f})" fill="{fill}"/>')

def mark_inner(caret=INK, axis=BRICK, tick=BRICK, dia=SIUE, sw=13, dia_half=12):
    """Mark in a local 120x120 box. 4 graduation ticks = AURA dimensions."""
    s =f'<path d="M24 84 L60 47 L96 84" fill="none" stroke="{caret}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
    s+=f'<line x1="14" y1="100" x2="106" y2="100" stroke="{axis}" stroke-width="4.5" stroke-linecap="round"/>'
    for x in (30,50,70,90):
        s+=f'<line x1="{x}" y1="100" x2="{x}" y2="92.5" stroke="{tick}" stroke-width="3.2" stroke-linecap="round"/>'
    s+=diamond(60,38,dia_half,dia)
    return s

def mark_group(x,y,scale,**kw):
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({scale:.5f})">{mark_inner(**kw)}</g>'

def path_text(text, font, size, wght, color, x, y, tracking=0.0, opacity=1.0):
    r=text_path(text, font, size=size, wght=wght, tracking=tracking)
    op=f' opacity="{opacity}"' if opacity<1 else ''
    g=f'<g transform="translate({x:.2f} {y:.2f})"{op}><path d="{r["d"]}" fill="{color}"/></g>'
    return g, r['width'], r['cap']

def run_text(segments, font, size, wght, x, y, tracking=0.0, opacity=1.0):
    xx=x; parts=[]
    for text,color in segments:
        r=text_path(text, font, size=size, wght=wght, tracking=tracking)
        if r['d']:
            parts.append(f'<g transform="translate({xx:.2f} {y:.2f})"><path d="{r["d"]}" fill="{color}"/></g>')
        xx+=r['width']
    op=f'<g opacity="{opacity}">' if opacity<1 else ''
    opc='</g>' if opacity<1 else ''
    return op+''.join(parts)+opc, xx-x

def acronym_segs(cap_color, rest_color, sep_color):
    words=["Avatars","Users","Relationships","Affect"]; segs=[]
    for i,w in enumerate(words):
        segs+=[(w[0],cap_color),(w[1:],rest_color)]
        if i<len(words)-1: segs.append(("  ·  ",sep_color))
    return segs

def grid_rect(x0,y0,w,h,step,color,sw=1):
    s=f'<g stroke="{color}" stroke-width="{sw}" fill="none">'
    x=x0
    while x<=x0+w+0.1: s+=f'<line x1="{x:.1f}" y1="{y0}" x2="{x:.1f}" y2="{y0+h}"/>'; x+=step
    y=y0
    while y<=y0+h+0.1: s+=f'<line x1="{x0}" y1="{y:.1f}" x2="{x0+w}" y2="{y:.1f}"/>'; y+=step
    return s+'</g>'

def svg_doc(w,h,body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>')
