import json, os, sys, importlib, html
sys.path.insert(0, os.path.dirname(__file__))
import lib
from reg import EX, CHAINS

for m in ['d_push', 'd_pull', 'd_legs', 'd_core', 'd_misc']:
    if os.path.exists(os.path.join(os.path.dirname(__file__), m + '.py')):
        importlib.import_module(m)

OUT = '/Users/didierfautsch/Projects/Apps/kata/docs/exercises'
os.makedirs(OUT + '/drawings', exist_ok=True)

nxt, prv = {}, {}
for name, ids in CHAINS.items():
    for i, x in enumerate(ids):
        prv[x] = ids[i - 1] if i > 0 else None
        nxt[x] = ids[i + 1] if i < len(ids) - 1 else None

ids = [e['id'] for e in EX]
assert len(ids) == len(set(ids)), 'dup ids'
catalog = []
for e in EX:
    lib.CUR[0] = e['id']
    svg = lib.render(e['draw'])
    open(f"{OUT}/drawings/{e['id']}.svg", 'w').write(svg)
    d = {k: v for k, v in e.items() if k != 'draw'}
    ch = d.pop('chain')
    d['progression'] = dict(easier=prv.get(e['id']), harder=nxt.get(e['id']), chain=ch)
    d['drawing'] = f"drawings/{e['id']}.svg"
    # key order per spec
    order = ['id', 'name_en', 'name_fr', 'category', 'movement_pattern', 'primary_muscles', 'secondary_muscles',
             'equipment', 'difficulty', 'type', 'progression', 'setup', 'steps', 'common_mistakes', 'tips', 'drawing']
    catalog.append({k: d[k] for k in order})

for c in catalog:
    for k in ('easier', 'harder'):
        v = c['progression'][k]
        assert v is None or v in ids, (c['id'], k, v)
for name, l in CHAINS.items():
    for x in l:
        assert x in ids, (name, x)

json.dump(catalog, open(OUT + '/catalog.json', 'w'), indent=2, ensure_ascii=False)

# CATALOG.md
cats = ['push', 'pull', 'legs', 'core', 'mobility', 'full-body']
md = ['# Kata exercise catalog', '', f'{len(catalog)} exercises. Source of truth: `catalog.json`. Drawings in `drawings/`.', '']
for cat in cats:
    items = [c for c in catalog if c['category'] == cat]
    md += [f'## {cat.title()} ({len(items)})', '',
           '| Exercise | FR | Diff | Type | Equipment | Primary muscles | Easier → Harder | Chain |',
           '|---|---|---|---|---|---|---|---|']
    for c in items:
        p = c['progression']
        md.append(f"| [{c['name_en']}]({c['drawing']}) (`{c['id']}`) | {c['name_fr']} | {c['difficulty']} | {c['type']} | "
                  f"{', '.join(c['equipment'])} | {', '.join(c['primary_muscles'])} | "
                  f"{p['easier'] or '–'} → {p['harder'] or '–'} | {p['chain']} |")
    md.append('')
open(OUT + '/CATALOG.md', 'w').write('\n'.join(md))

# contact sheet
cards = []
for c in catalog:
    cards.append(f'<figure data-cat="{c["category"]}"><img src="{c["drawing"]}" alt="{html.escape(c["name_en"])}" loading="lazy">'
                 f'<figcaption><b>{html.escape(c["name_en"])}</b><span>{html.escape(c["name_fr"])} · {c["category"]} · d{c["difficulty"]}</span></figcaption></figure>')
open(OUT + '/drawings/index.html', 'w').write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Kata exercise drawings</title>
<style>body{{font-family:Helvetica,Arial,sans-serif;background:#eef0f4;margin:0;padding:24px;color:#1F2A44}}
h1{{font-size:20px}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}}
figure{{margin:0;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px #0002}}
img{{width:100%;display:block}}figcaption{{padding:8px 12px;font-size:13px;display:flex;flex-direction:column}}
figcaption span{{color:#6B7488;font-size:11px;margin-top:2px}}</style></head><body>
<h1>Kata exercise drawings ({len(catalog)})</h1><div class="grid">{''.join(cards)}</div></body></html>''')

print(len(catalog), 'exercises')
from collections import Counter
print(Counter(c['category'] for c in catalog))
print('\n'.join(sorted(set(lib.WARN))) or 'no IK warnings')
