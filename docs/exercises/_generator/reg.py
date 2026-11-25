EX = []
CHAINS = {}


def chain(name, ids):
    CHAINS[name] = ids


def E(id, en, fr, cat, pattern, prim, sec, eq, diff, typ, ch, setup, steps, mistakes, tips, a, b=None, scene=None, **spec):
    na = spec.pop('noauto', False)
    a = a if 'pose' in a else dict(pose=a)
    if b is not None:
        b = b if 'pose' in b else dict(pose=b)
        if na:
            b['noauto'] = True
    EX.append(dict(id=id, name_en=en, name_fr=fr, category=cat, movement_pattern=pattern,
                   primary_muscles=prim, secondary_muscles=sec, equipment=eq, difficulty=diff, type=typ,
                   chain=ch, setup=setup, steps=steps, common_mistakes=mistakes, tips=tips,
                   draw=dict(a=a, b=b, title=en, eq=scene or [], **spec)))
