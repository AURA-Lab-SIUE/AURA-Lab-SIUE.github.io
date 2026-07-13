"""Refined candidates: the plotted 'reading' (caret) floats above the settings axis."""
import os
PAPER="#f6f3ec"; INK="#1e1b18"; INKSOFT="#6b6357"; BRICK="#a8322a"; BRICKDEEP="#872619"; SIUE="#e5182d"
OUT=os.path.dirname(os.path.abspath(__file__))+"/out"

def diamond(cx,cy,half,fill,rx=1.6):
    return (f'<rect x="{cx-half}" y="{cy-half}" width="{half*2}" height="{half*2}" '
            f'rx="{rx}" transform="rotate(45 {cx} {cy})" fill="{fill}"/>')

def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">{body}</svg>'

def axis(y,x0,x1,w,color,tick_xs,tlen,tw,up=True):
    s=f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
    for x in tick_xs:
        y2=y-tlen if up else y+tlen
        s+=f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y2}" stroke="{color}" stroke-width="{tw}" stroke-linecap="round"/>'
    return s

def reading(left,apex,right,sw,color,gap_top=0.0):
    (lx,ly),(ax,ay),(rx,ry)=left,apex,right
    # optionally stop short of apex by gap (leave room for diamond) -> draw two strokes
    return f'<path d="M{lx} {ly} L{ax} {ay+gap_top} L{rx} {ry}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'

cands={}

# F: caret floats above axis; 5 upward graduations; ink caret, brick axis, red diamond apex, small gap
body =reading((26,86),(60,40),(94,86),11,INK,gap_top=4)
body+=axis(102,12,108,4,BRICK,(24,42,60,78,96),7,3,up=True)
body+=diamond(60,32,11,SIUE)
cands['F']=svg(body)

# G: caret vertex meets diamond; axis ticks on-line both sides; thinner axis ink
body =reading((26,86),(60,38),(94,86),11,INK)
body+=axis(102,12,108,3.5,INK,(24,42,60,78,96),6,3,up=True)
body+=diamond(60,34,11,SIUE)
cands['G']=svg(body)

# H: caret + faint vertical drop-line from diamond to axis (instrument detail), brick axis
body =f'<line x1="60" y1="34" x2="60" y2="102" stroke="{BRICK}" stroke-width="2" stroke-dasharray="3 4" opacity="0.55"/>'
body+=reading((26,86),(60,40),(94,86),11,INK,gap_top=4)
body+=axis(102,12,108,4,BRICK,(24,42,60,78,96),7,3,up=True)
body+=diamond(60,32,11,SIUE)
cands['H']=svg(body)

# I: asymmetric 'signal' reading - rises gently, peaks at diamond, falls steeper
body =reading((20,88),(58,40),(96,74),11,INK,gap_top=4)
body+=axis(102,12,108,4,BRICK,(24,42,60,78,96),7,3,up=True)
body+=diamond(58,32,11,SIUE)
cands['I']=svg(body)

# J: heavier, feet lower & wider, no gap, brick axis, 5 short down-ticks under axis extending past
body =reading((22,90),(60,38),(98,90),12,INK)
body+=axis(104,10,110,4.5,BRICK,(22,41,60,79,98),6,3,up=False)
body+=diamond(60,34,12,SIUE)
cands['J']=svg(body)

# K: minimal/clean for tiny sizes: caret + single axis line (no ticks) + diamond, all a touch bolder
body =reading((26,86),(60,40),(94,86),12,INK,gap_top=4)
body+=f'<line x1="14" y1="102" x2="106" y2="102" stroke="{BRICK}" stroke-width="5" stroke-linecap="round"/>'
body+=diamond(60,32,12,SIUE)
cands['K']=svg(body)

for k,s in cands.items(): open(f"{OUT}/mark_{k}.svg","w").write(s)
print("wrote", list(cands.keys()))
