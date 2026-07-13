"""Generate candidate AURA Lab logo marks as SVG. Artboard 120x120."""
import os

PAPER="#f6f3ec"; CARD="#fcfbf7"; INK="#1e1b18"; INKSOFT="#6b6357"
BRICK="#a8322a"; BRICKDEEP="#872619"; SIUE="#e5182d"; LINE="rgba(30,27,24,0.14)"

OUT=os.path.dirname(os.path.abspath(__file__))+"/out"
os.makedirs(OUT, exist_ok=True)

def diamond(cx, cy, half, fill):
    # rotated square (45deg), 'half' = half diagonal
    return (f'<rect x="{cx-half}" y="{cy-half}" width="{half*2}" height="{half*2}" '
            f'rx="1.5" transform="rotate(45 {cx} {cy})" fill="{fill}"/>')

def ticks(y, xs, length, w, color):
    s=""
    for x in xs:
        s+=f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+length}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
    return s

def mark(apex=(60,35), feet=((24,96),(96,96)), sw=11, leg=INK,
         axis_y=96, axis_x=(16,104), axis_w=4, axis_color=BRICK,
         tick_xs=(30,45,60,75,90), tick_len=7, tick_w=3, tick_color=BRICK,
         dia_half=11, dia_color=SIUE, crossbar=None, cross_color=BRICK, cross_w=3):
    (ax,ay)=apex; (lx,ly),(rx,ry)=feet
    p=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
    # legs (peak)
    p+=f'<path d="M{lx} {ly} L{ax} {ay} L{rx} {ry}" fill="none" stroke="{leg}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
    if crossbar is not None:
        # horizontal tie between legs at height 'crossbar' (0..1 from apex to feet)
        t=crossbar
        y=ay+(ly-ay)*t
        x1=ax+(lx-ax)*t; x2=ax+(rx-ax)*t
        p+=f'<line x1="{x1+sw*0.3}" y1="{y}" x2="{x2-sw*0.3}" y2="{y}" stroke="{cross_color}" stroke-width="{cross_w}" stroke-linecap="round"/>'
    # axis baseline
    p+=f'<line x1="{axis_x[0]}" y1="{axis_y}" x2="{axis_x[1]}" y2="{axis_y}" stroke="{axis_color}" stroke-width="{axis_w}" stroke-linecap="round"/>'
    # ticks below axis
    p+=ticks(axis_y, tick_xs, tick_len, tick_w, tick_color)
    # apex diamond
    p+=diamond(ax, ay-2, dia_half, dia_color)
    p+='</svg>'
    return p

cands={}
# A: legs ink, axis+ticks brick, apex SIUE red
cands['A']=mark()
# B: pure single-red -> legs+axis+ticks ink, apex SIUE red
cands['B']=mark(leg=INK, axis_color=INK, tick_color=INK)
# C: legs ink, brick crossbar (more "A"), axis+ticks brick, apex red
cands['C']=mark(crossbar=0.52)
# D: taller/narrower, feet wider apart, ticks under whole axis (7 ticks)
cands['D']=mark(apex=(60,32), feet=((20,98),(100,98)), sw=12,
                axis_x=(14,106), tick_xs=(24,36,48,60,72,84,96), tick_len=6)
# E: apex diamond larger, legs slightly tapered look via heavier sw, brick axis only (no ticks)
cands['E']=mark(sw=12, dia_half=12.5, tick_xs=(), axis_w=4.5)

for k,svg in cands.items():
    open(f"{OUT}/mark_{k}.svg","w").write(svg)
print("wrote", list(cands.keys()))
