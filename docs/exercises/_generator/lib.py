"""Shared pose/limb helpers for the Kata exercise drawings (side-view stick figures)."""
import math

G = 250                      # ground y in panel coords
LT, LA, LF, LTH, LS = 42, 24, 22, 30, 30
HEAD_R, NECK = 8, 13
LEG = LTH + LS               # 60
BODY = LEG + LT              # 102
ARM = LA + LF                # 46

BG = '#F7F8FA'; NEAR = '#1F2A44'; FAR = '#9AA4BC'; EQ = '#7D879C'; GROUND = '#C9D0DD'
ACCENT = '#F26B3A'; ARROW = '#1F9E8F'; TEXT = '#6B7488'
W = 5

WARN = []
CUR = ['?']


def dirv(a):
    r = math.radians(a)
    return (math.cos(r), math.sin(r))


def add(p, q, k=1.0):
    return (p[0] + q[0] * k, p[1] + q[1] * k)


def ang(p, q):
    return math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))


def ik(P, T, l1, l2, bend, tag=''):
    dx, dy = T[0] - P[0], T[1] - P[1]
    d = math.hypot(dx, dy)
    lo, hi = abs(l1 - l2) + 0.5, l1 + l2 - 0.3
    if d > hi + 2.5 or d < lo - 2.5:
        WARN.append(f'{CUR[0]}: {tag} reach d={d:.1f} (range {lo:.0f}-{hi:.0f})')
    dc = min(max(d, lo), hi)
    base = math.atan2(dy, dx)
    c = max(-1, min(1, (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc)))
    A = math.acos(c)
    cands = [add(P, dirv(math.degrees(base + s * A)), l1) for s in (1, -1)]
    key = {'f': lambda p: -p[0], 'b': lambda p: p[0], 'u': lambda p: p[1], 'd': lambda p: -p[1]}[bend]
    e = min(cands, key=key)
    end = (P[0] + dc * math.cos(base), P[1] + dc * math.sin(base))
    return e, end


def solve(pose):
    """pose dict -> dict of joints."""
    hip = pose['hip']
    t = pose.get('t', -90)
    S = add(hip, dirv(t), LT)
    head = add(S, dirv(t + pose.get('hd', 0)), NECK)
    J = {'hip': hip, 'shoulder': S, 'head': head}
    # arm
    if 'hand' in pose:
        el, ha = ik(S, pose['hand'], LA, LF, pose.get('ab', 'b'), 'arm')
    else:
        a1, a2 = pose.get('arm', (90, 90))
        el = add(S, dirv(a1), LA); ha = add(el, dirv(a2), LF)
    J['elbow'], J['hand'] = el, ha
    if 'hand2' in pose:
        el2, ha2 = ik(S, pose['hand2'], LA, LF, pose.get('ab2', pose.get('ab', 'b')), 'arm2')
        J['elbow2'], J['hand2'], J['far_arm_free'] = el2, ha2, True
    elif 'arm2' in pose:
        a1, a2 = pose['arm2']
        e2 = add(S, dirv(a1), LA); J['elbow2'], J['hand2'] = e2, add(e2, dirv(a2), LF)
        J['far_arm_free'] = True
    else:
        J['elbow2'], J['hand2'] = (el[0] - 6, el[1]), (ha[0] - 6, ha[1])
        J['far_arm_free'] = False
    # leg
    if 'foot' in pose:
        kn, ft = ik(hip, pose['foot'], LTH, LS, pose.get('lb', 'f'), 'leg')
    else:
        a1, a2 = pose.get('leg', (90, 90))
        kn = add(hip, dirv(a1), LTH); ft = add(kn, dirv(a2), LS)
    J['knee'], J['foot'] = kn, ft
    if 'foot2' in pose:
        kn2, ft2 = ik(hip, pose['foot2'], LTH, LS, pose.get('lb2', pose.get('lb', 'f')), 'leg2')
        J['knee2'], J['foot2'] = kn2, ft2
    elif 'leg2' in pose:
        a1, a2 = pose['leg2']
        k2 = add(hip, dirv(a1), LTH); J['knee2'], J['foot2'] = k2, add(k2, dirv(a2), LS)
    else:
        J['knee2'], J['foot2'] = (kn[0] - 6, kn[1]), (ft[0] - 6, ft[1])
    return J


def pl(pts, color, w=W):
    p = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return (f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="{w}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def foot_seg(ft, pose):
    fa = pose.get('fa', 0); fl = pose.get('fl', 9)
    return [ft, add(ft, dirv(fa), fl)]


def figure(pose, J):
    o = []
    fa2 = pose.get('fa2', pose.get('fa', 0))
    # far limbs
    o.append(pl([J['shoulder'], J['elbow2'], J['hand2']], FAR))
    o.append(pl([J['hip'], J['knee2'], J['foot2'], add(J['foot2'], dirv(fa2), pose.get('fl', 9))], FAR))
    o.append(pl([J['hip'], J['shoulder']], NEAR, W + 1))
    o.append(pl([J['hip'], J['knee'], J['foot']] + [foot_seg(J['foot'], pose)[1]], NEAR))
    o.append(pl([J['shoulder'], J['elbow'], J['hand']], NEAR))
    neck = add(J['shoulder'], dirv(pose.get('t', -90) + pose.get('hd', 0)), 3)
    o.append(f'<line x1="{neck[0]:.1f}" y1="{neck[1]:.1f}" x2="{J["head"][0]:.1f}" y2="{J["head"][1]:.1f}" '
             f'stroke="{NEAR}" stroke-width="{W}" stroke-linecap="round"/>')
    hx, hy = J['head']
    o.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{HEAD_R}" fill="{BG}" stroke="{NEAR}" stroke-width="{W-1}"/>')
    return ''.join(o)


# ---------------- equipment ----------------
def pt(spec, J):
    if isinstance(spec, str):
        return J[spec]
    return spec


def eq_svg(item, J):
    k = item[0]
    if k == 'ground':
        x1, x2 = (item[1], item[2]) if len(item) > 2 else (6, 194)
        y = item[3] if len(item) > 3 else G
        return f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{GROUND}" stroke-width="3" stroke-linecap="round"/>'
    if k == 'bar':      # pull-up bar in a doorframe, seen end-on: ('bar', x, y)
        x, y = item[1], item[2]
        return (f'<line x1="{x+10}" y1="{y-10}" x2="{x+10}" y2="{y+14}" stroke="{GROUND}" stroke-width="3"/>'
                f'<line x1="{x-34}" y1="{y-10}" x2="{x+10}" y2="{y-10}" stroke="{GROUND}" stroke-width="3"/>'
                f'<circle cx="{x}" cy="{y}" r="4.5" fill="{EQ}"/>')
    if k == 'pbars':    # parallel bars, side view: ('pbars', x1, x2, y)
        x1, x2, y = item[1], item[2], item[3]
        return (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{EQ}" stroke-width="5" stroke-linecap="round"/>'
                f'<line x1="{x1+4}" y1="{y}" x2="{x1+4}" y2="{G}" stroke="{EQ}" stroke-width="3"/>'
                f'<line x1="{x2-4}" y1="{y}" x2="{x2-4}" y2="{G}" stroke="{EQ}" stroke-width="3"/>'
                f'<line x1="{x1-6}" y1="{G}" x2="{x1+14}" y2="{G}" stroke="{EQ}" stroke-width="3"/>'
                f'<line x1="{x2-14}" y1="{G}" x2="{x2+6}" y2="{G}" stroke="{EQ}" stroke-width="3"/>')
    if k == 'wall':     # ('wall', x, side) vertical wall with hatch
        x = item[1]; s = item[2] if len(item) > 2 else 1
        h = ''.join(f'<line x1="{x}" y1="{y}" x2="{x+8*s}" y2="{y+8}" stroke="{GROUND}" stroke-width="1.5"/>' for y in range(20, G, 14))
        return f'<line x1="{x}" y1="14" x2="{x}" y2="{G}" stroke="{EQ}" stroke-width="3"/>' + h
    if k == 'step':     # ('step', x1, x2, y) raised platform
        x1, x2, y = item[1], item[2], item[3]
        return f'<rect x="{x1}" y="{y}" width="{x2-x1}" height="{G-y}" rx="2" fill="{GROUND}" stroke="{EQ}" stroke-width="2"/>'
    if k == 'kb':       # ('kb', point-or-name, dx, dy) kettlebell hanging off a point
        p = pt(item[1], J); dx = item[2] if len(item) > 2 else 0; dy = item[3] if len(item) > 3 else 12
        cx, cy = p[0] + dx, p[1] + dy
        return (f'<path d="M{cx-6:.1f},{cy-6:.1f} a6,7 0 0 1 12,0" fill="none" stroke="{ACCENT}" stroke-width="3.5"/>'
                f'<circle cx="{cx:.1f}" cy="{cy+3:.1f}" r="9" fill="{ACCENT}"/>')
    if k == 'band':     # ('band', a, b[, bulge]) elastic band between two points
        a, b = pt(item[1], J), pt(item[2], J)
        bl = item[3] if len(item) > 3 else 0
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        return (f'<path d="M{a[0]:.1f},{a[1]:.1f} Q{mx+bl:.1f},{my:.1f} {b[0]:.1f},{b[1]:.1f}" fill="none" '
                f'stroke="{ACCENT}" stroke-width="3" stroke-dasharray="1 0" stroke-linecap="round"/>')
    if k == 'anchor':   # small anchor dot (door handle / fixed point)
        return f'<circle cx="{item[1]}" cy="{item[2]}" r="4" fill="{EQ}"/>'
    raise ValueError(k)


def arrow(x1, y1, x2, y2, curve=0):
    d = math.hypot(x2 - x1, y2 - y1)
    if d < 1:
        return ''
    ux, uy = (x2 - x1) / d, (y2 - y1) / d
    h = 7
    ax, ay = x2 - ux * h, y2 - uy * h
    px, py = -uy * 3.6, ux * 3.6
    mx, my = (x1 + x2) / 2 - uy * curve, (y1 + y2) / 2 + ux * curve
    return (f'<path d="M{x1:.1f},{y1:.1f} Q{mx:.1f},{my:.1f} {ax:.1f},{ay:.1f}" fill="none" stroke="{ARROW}" '
            f'stroke-width="2.2" stroke-linecap="round" opacity=".85"/>'
            f'<polygon points="{x2:.1f},{y2:.1f} {ax+px:.1f},{ay+py:.1f} {ax-px:.1f},{ay-py:.1f}" fill="{ARROW}" opacity=".85"/>')


def panel_svg(panel, eq_common, label, other=None):
    pose = panel['pose']
    J = solve(pose)
    out = []
    for it in eq_common + panel.get('eq', []):
        out.append(eq_svg(it, J))
    out.append(figure(pose, J))
    for it in panel.get('over', []):      # equipment drawn over the figure (kettlebell, bands)
        out.append(eq_svg(it, J))
    if other is not None and not panel.get('noauto'):
        J0 = solve(other['pose'])
        m0 = ((J0['hip'][0] + J0['shoulder'][0]) / 2, (J0['hip'][1] + J0['shoulder'][1]) / 2)
        m1 = ((J['hip'][0] + J['shoulder'][0]) / 2, (J['hip'][1] + J['shoulder'][1]) / 2)
        if math.hypot(m1[0] - m0[0], m1[1] - m0[1]) > 14:
            out.append(arrow(m0[0], m0[1], m1[0], m1[1], curve=panel.get('curve', 0)))
    for a in panel.get('arr', []):
        out.append(arrow(*a))
    return ''.join(out)


def render(spec):
    """spec: dict(eq=[...], a=panel, b=panel|None)  -> svg string"""
    eqc = spec.get('eq', [])
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" '
             f'role="img" aria-label="{spec["title"]}">',
             f'<rect width="400" height="300" fill="{BG}"/>']
    lab = f'font-family="Helvetica,Arial,sans-serif" font-size="11" fill="{TEXT}" letter-spacing="1.5"'
    flip = spec.get('flip', False)

    import re
    xs, ys = [], []
    for p in (spec['a'], spec.get('b')):
        if p is None:
            continue
        J = solve(p['pose'])
        for k, v in J.items():
            if isinstance(v, tuple):
                xs.append(v[0]); ys.append(v[1])
        for it in spec.get('eq', []) + p.get('eq', []):
            if it[0] in ('wall',):
                xs.append(it[1])
            if it[0] == 'pbars':
                xs += [it[1], it[2]]; ys.append(it[3])
            if it[0] == 'step':
                xs += [it[1], it[2]]; ys.append(it[3])
            if it[0] == 'bar':
                xs += [it[1] - 30, it[1] + 12]; ys.append(it[2] - 12)
        for it in p.get('over', []):
            if it[0] == 'band' and not isinstance(it[1], str):
                xs.append(it[1][0]); ys.append(it[1][1])
    w = max(xs) - min(xs) + 24; h = G - min(ys) + 24
    z = spec.get('zoom') or min(1.5, 176 / w, 214 / h)
    cx = (max(xs) + min(xs)) / 2

    def grp(x, p, eqs, other):
        g = panel_svg(p, eqs, '', other)
        g = re.sub(r'stroke-width="([\d.]+)"', lambda m: 'stroke-width="%.2f"' % (float(m.group(1)) / z), g)
        tr = f'translate({x + 100 - z * cx:.1f},{G * (1 - z):.1f}) scale({z:.3f})'
        if flip:
            tr = f'translate({x + 200},0) scale(-1,1) ' + f'translate({100 - z * cx:.1f},{G * (1 - z):.1f}) scale({z:.3f})'
        return f'<g transform="{tr}">{g}</g>'

    if spec.get('b') is None:
        parts.append(grp(100, spec['a'], eqc, None))
        parts.append(f'<text x="200" y="20" text-anchor="middle" {lab}>HOLD</text>')
    else:
        parts.append(grp(0, spec['a'], eqc, None))
        parts.append(grp(200, spec['b'], eqc, spec['a']))
        parts.append(f'<line x1="200" y1="30" x2="200" y2="270" stroke="{GROUND}" stroke-width="1.5" stroke-dasharray="3 5"/>')
        parts.append(f'<text x="100" y="20" text-anchor="middle" {lab}>START</text>')
        parts.append(f'<text x="300" y="20" text-anchor="middle" {lab}>{spec.get("endlabel","END")}</text>')
    if spec.get('note'):
        parts.append(f'<text x="200" y="288" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="11" fill="{TEXT}">{spec["note"]}</text>')
    parts.append('</svg>')
    return '\n'.join(parts)


# ---------------- pose factories ----------------
def stand(x=100, **kw):
    p = dict(hip=(x, G - LEG), t=-90, foot=(x, G), fa=0, arm=(90, 90))
    p.update(kw)
    return p


def sx(Fx, Sy, fy=G - 5):
    return Fx + math.sqrt(max(BODY ** 2 - (fy - Sy) ** 2, 0))


def prone(Fx, Sy, hand, fy=G - 5, **kw):
    """Straight body line: feet (ankle) at (Fx, fy), shoulder height Sy, hands at `hand`. Faces right."""
    dy = fy - Sy
    Sx = Fx + math.sqrt(max(BODY ** 2 - dy * dy, 0))
    S = (Sx, Sy); F = (Fx, fy)
    hip = (F[0] + (S[0] - F[0]) * LEG / BODY, F[1] + (S[1] - F[1]) * LEG / BODY)
    t = ang(hip, S)
    p = dict(hip=hip, t=t, hand=hand, ab='b', foot=F, fa=90, fl=5, hd=-8)
    p.update(kw)
    return p


def hang(bx, by, drop, lean=0, **kw):
    """Hanging from a bar at (bx, by); shoulder `drop` px below the bar. Legs straight down unless overridden."""
    S = (bx - 11 + lean, by + drop)
    hip = (S[0], S[1] + LT)
    p = dict(hip=hip, t=-90, hand=(bx, by), ab='d', foot=(hip[0], hip[1] + LEG), fa=20, fl=7, lb='f')
    p.update(kw)
    if 'leg' in kw:
        p.pop('foot', None)
    return p


def kneel_prone(Kx, Sy, hand, **kw):
    """Knee push-up: knee on floor at (Kx, G-4); straight line knee->hip->shoulder; shin raised behind."""
    K = (Kx, G - 4)
    L = LTH + LT
    Sxx = Kx + math.sqrt(max(L ** 2 - (K[1] - Sy) ** 2, 0))
    S = (Sxx, Sy)
    hip = (K[0] + (S[0] - K[0]) * LTH / L, K[1] + (S[1] - K[1]) * LTH / L)
    p = dict(hip=hip, t=ang(hip, S), hand=hand, ab='b', leg=(ang(hip, K), -150), fa=-150, fl=0, hd=-8)
    p.update(kw)
    return p


def support(bx, by, Sy, lean=8, **kw):
    S = (bx, Sy); t = -90 + lean
    hip = add(S, dirv(t), -LT)
    p = dict(hip=hip, t=t, hand=(bx, by), ab='b', foot=(hip[0] - 6, hip[1] + 56), fa=20, fl=7, lb='f')
    p.update(kw)
    if 'leg' in kw:
        p.pop('foot', None)
    return p
