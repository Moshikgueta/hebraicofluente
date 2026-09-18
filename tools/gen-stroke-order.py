#!/usr/bin/env python3
"""
gen-stroke-order.py — author's tool. Writes assets/stroke-order/*.svg.

NOT part of `npm run build`. Run it once, commit the SVGs:

    pip install fonttools brotli
    python3 tools/gen-stroke-order.py

WHAT IS DERIVED AND WHAT IS AUTHORED
------------------------------------
The letterform is EXACT: the outline comes straight out of
assets/fonts/gveret-levin-hebrew-400-normal.woff2, the same cursive face the
model and tracing rows use, so the shape a learner traces and the shape shown
here can never drift apart.

The stroke COUNT is derived, not guessed. A glyph's outline is split into
contours; a contour whose bounding box sits inside another's is a counter (the
hole in a closed loop like samekh), not a separate pen stroke. Counting only
outer contours gives: he, alef and qof at two strokes, everything else at one —
which is the real stroke count of Israeli cursive.

The stroke ORDER and START POINT follow two rules that hold for Hebrew cursive:
strokes begin at the top of the form, and where a letter has more than one
stroke the rightmost comes first, because Hebrew is written right to left.
Both rules agree on all three two-stroke letters (he: body then left leg;
alef: right curve then left stroke; qof: head then descender).

The ARROW points from the start dot toward the stroke's centroid — "begin here
and move into the form". It deliberately does not claim a curl direction,
because that is the one thing the outline cannot tell us.

A native reviewer should still confirm the order before print. Nothing here is
load-bearing for the build: a letter with no SVG, or one still carrying
data-placeholder, renders the model letter and an "em breve" note (V11).

Licence: Gveret Levin AlefAlefAlef is OFL-1.1, which permits deriving and
embedding outlines. assets/fonts/LICENSE-gveret-levin.txt travels with them.
"""

import json
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = ROOT / 'assets/fonts/gveret-levin-hebrew-400-normal.woff2'
OUT = ROOT / 'assets/stroke-order'

BOX = 200          # viewBox side
PAD = 26           # keeps the numbered dots inside the frame
INK = '#C9C0AF'    # the letterform: quiet, it is a guide not the subject
MARK = '#9E2B1E'   # crimson, the convention the placeholders documented


def contours_of(glyph_set, gname):
    """Every contour, as both flattened points and a replayable recording.

    The points are what the geometry rules work on (bounding box, centroid,
    where the pen lands). The recording is what produces an EXACT path for one
    contour on its own — which is what the app animates, revealing the strokes
    of he, alef and qof one at a time. Flattened points cannot be turned back
    into curves, so both have to be carried."""
    pen = RecordingPen()
    glyph_set[gname].draw(pen)
    out, pts, rec = [], [], []
    for op, args in pen.value:
        if op == 'moveTo':
            if rec:
                out.append({'pts': pts, 'rec': rec})
            pts, rec = [args[0]], [(op, args)]
            continue
        rec.append((op, args))
        if op == 'lineTo':
            pts.append(args[0])
        elif op == 'qCurveTo':
            pts.extend([q for q in args if q])
        elif op == 'curveTo':
            pts.extend(args)
    if rec:
        out.append({'pts': pts, 'rec': rec})
    return [c for c in out if c['pts']]


def contour_path(rec, transform, gs):
    """One contour as an SVG path, already in the 200-box coordinate system.

    One decimal place: the box is 200 units wide and this is drawn at a few
    hundred pixels, so a tenth of a unit is well under a screen pixel. Full
    float precision tripled the file for nothing a learner could ever see."""
    spen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}')
    tpen = TransformPen(spen, transform)
    for op, args in rec:
        getattr(tpen, op)(*args)
    return spen.getCommands()


def bbox(c):
    xs = [p[0] for p in c['pts']]
    ys = [p[1] for p in c['pts']]
    return min(xs), min(ys), max(xs), max(ys)


def centroid(c):
    pts = c['pts']
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)


def inside(a, b):
    return a[0] >= b[0] and a[1] >= b[1] and a[2] <= b[2] and a[3] <= b[3]


def outer_contours(cs):
    bbs = [bbox(c) for c in cs]
    keep = []
    for i, c in enumerate(cs):
        if not any(j != i and inside(bbs[i], bbs[j]) for j in range(len(cs))):
            keep.append(c)
    return keep


def start_point(c):
    """Where the pen lands: the RIGHTMOST point within the top band of the stroke.

    Strictly-topmost was wrong for het, whose left hump happens to sit a few
    units higher than its right one — the marker landed on the wrong end of a
    letter that, like all of them, is entered from the upper right. Taking the
    rightmost point within 8% of the stroke's height of its apex keeps "start
    at the top" while respecting that Hebrew runs right to left."""
    pts = c['pts']
    top = max(p[1] for p in pts)
    lo = min(p[1] for p in pts)
    band = (top - lo) * 0.08
    near_top = [p for p in pts if p[1] >= top - band]
    return max(near_top, key=lambda p: p[0])


def build(tid, ch, name, font, cmap, gs):
    """Returns (svg, meta) or (None, None). `meta` is what the APP animates."""
    gname = cmap.get(ord(ch))
    if not gname:
        return None, None
    cs = contours_of(gs, gname)
    if not cs:
        return None, None

    # exact path, in font units
    spen = SVGPathPen(gs)
    gs[gname].draw(spen)
    d = spen.getCommands()

    xs = [p[0] for c in cs for p in c['pts']]
    ys = [p[1] for c in cs for p in c['pts']]
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    w, h = max(x1 - x0, 1), max(y1 - y0, 1)
    s = (BOX - 2 * PAD) / max(w, h)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    tx = BOX / 2 - s * cx
    ty = BOX / 2 + s * cy

    def to_svg(p):
        return tx + s * p[0], ty - s * p[1]

    # strokes: rightmost first, then topmost — both rules agree on every
    # two-stroke letter in this alphabet.
    strokes = outer_contours(cs)
    strokes.sort(key=lambda c: (-bbox(c)[2], -bbox(c)[3]))

    # Per-stroke geometry for the APP, which reveals the strokes one at a time.
    # Each entry carries that stroke's own outline (already in the 200-box
    # coordinates the SVG uses, so the app can drop it straight into a
    # viewBox="0 0 200 200"), where the pen lands, and which way it sets off.
    # The curl of the stroke is deliberately absent: the outline cannot tell us
    # that, and inventing it would teach a movement nobody verified.
    transform = (s, 0, 0, -s, tx, ty)
    inners = [c for c in cs if c not in strokes]
    meta_strokes = []
    for c in strokes:
        # A counter — the hole in samekh, the eye of qof — belongs to the stroke
        # that encloses it, or the stroke would animate in as a solid blob.
        own = [c] + [h for h in inners if inside(bbox(h), bbox(c))]
        d_stroke = ' '.join(contour_path(h['rec'], transform, gs) for h in own)
        sx, sy = to_svg(start_point(c))
        gx, gy = to_svg(centroid(c))
        dx, dy = gx - sx, gy - sy
        mag = (dx * dx + dy * dy) ** .5 or 1
        meta_strokes.append({
            'd': d_stroke,
            'start': [round(sx, 1), round(sy, 1)],
            'dir': [round(dx / mag, 3), round(dy / mag, 3)],
        })
    meta = {'box': BOX, 'strokes': meta_strokes}

    marks = []
    for i, c in enumerate(strokes, 1):
        sx, sy = to_svg(start_point(c))
        gx, gy = to_svg(centroid(c))
        dx, dy = gx - sx, gy - sy
        mag = (dx * dx + dy * dy) ** .5 or 1
        ux, uy = dx / mag, dy / mag
        # arrow starts clear of the dot and runs a short way into the form
        ax, ay = sx + ux * 15, sy + uy * 15
        bx, by = sx + ux * 34, sy + uy * 34
        marks.append(f'''
  <line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}"
        stroke="{MARK}" stroke-width="2.6" stroke-linecap="round" marker-end="url(#a{tid})"/>
  <circle cx="{sx:.1f}" cy="{sy:.1f}" r="9" fill="#FFFFFF" stroke="{MARK}" stroke-width="2.4"/>
  <text x="{sx:.1f}" y="{sy + 4.2:.1f}" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700"
        fill="{MARK}">{i}</text>''')

    n = len(strokes)
    label = f'Ordem de tracado da letra {name}: {n} movimento' + ('s' if n > 1 else '')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}"
     class="stroke-svg" role="img" aria-label="{label}" data-strokes="{n}">
  <title>{label}</title>
  <defs>
    <marker id="a{tid}" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
      <path d="M0,1 L9,5 L0,9 z" fill="{MARK}"/>
    </marker>
  </defs>
  <g transform="translate({tx:.2f},{ty:.2f}) scale({s:.5f},{-s:.5f})">
    <path d="{d}" fill="{INK}"/>
  </g>{''.join(marks)}
</svg>
'''
    return svg, meta


def main():
    font = TTFont(FONT)
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    letters = json.loads((ROOT / 'data/letters.json').read_text())

    targets = []
    for L in letters:
        targets.append((L['id'], L['letter'], L['namePt']))
        if L['finalForm']:
            targets.append((L['id'] + '-final', L['finalForm'], L['namePt'] + ' final'))

    wrote = 0
    meta_all = {}
    for tid, ch, name in targets:
        svg, meta = build(tid, ch, name, font, cmap, gs)
        if not svg:
            print(f'  ! {tid}: sem glifo')
            continue
        (OUT / f'{tid}.svg').write_text(svg)
        meta_all[tid] = meta
        wrote += 1

    # The SVG is the printed diagram; this is what the app animates. Same
    # source, same run, so the two can never disagree about how many strokes a
    # letter has or where they begin.
    strokes_json = ROOT / 'data/stroke-paths.json'
    strokes_json.write_text(json.dumps({
        'note': 'GERADO por tools/gen-stroke-order.py. Nao editar a mao.',
        'box': BOX,
        'letters': meta_all,
    }, ensure_ascii=False, indent=1) + '\n')

    total = sum(len(m['strokes']) for m in meta_all.values())
    print(f'{wrote} SVG escritos em assets/stroke-order/')
    print(f'{total} tracos em data/stroke-paths.json')


if __name__ == '__main__':
    main()
