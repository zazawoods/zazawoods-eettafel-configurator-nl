#!/usr/bin/env python3
"""Regenerate configurator/js/zw-products.json (+ zw-products-by-handle.json) for the NL shop.

1. Downloads the whole catalog from https://zazawoods.nl/products.json (2 pages x 250).
2. Scrapes the addon widget (Onderstel / Randafwerking / Behandeling) from the 7 table
   product pages (SHAPES below) and resolves each addon's variant id, price and handle.
3. Writes the two JSON files the configurator loads. Titles stay DUTCH — app.js maps them
   to canonical German titles at runtime via js/locale.js (TITLE_TO_CANONICAL).

Run from the repo root:  python3 tools/scrape_nl_products.py
Then bump BUILD_VERSION (7 places, see README)."""
import json, re, sys, urllib.request

import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def _get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')
prods = []
for page in (1, 2, 3):
    d = json.loads(_get(f'https://zazawoods.nl/products.json?limit=250&page={page}'))
    prods += d['products']
    if len(d['products']) < 250: break
print('catalog products:', len(prods), file=sys.stderr)
by_id = {p['id']: p for p in prods}
var_price = {}
for p in prods:
    for v in p['variants']:
        var_price[int(v['id'])] = (p, v)

SHAPES = {
    'rectangle':   'rechthoekige-eettafel-massief-eikenhout',
    'oval':        'ovale-eettafel-danilo-uit-massief-eikenhout-met-een-verjongde-rand',
    'danish-oval': 'massief-eiken-tafel-ovaal',
    'round':       'runder-esstisch-romano-aus-massiver-eichenholz',
    'organic':     'organische-eettafel-pure-van-massief-eikenhout',
    'bootsform':   'bootsform-esstisch-sergio-aus-massivem-eichenholz-1',
    'halfrond':    'halfronde-eettafel-van-massief-eikenhout',
}

def fetch(handle):
    return _get(f'https://zazawoods.nl/products/{handle}')

out = {}
for shape, handle in SHAPES.items():
    h = fetch(handle)
    p = next(x for x in prods if x['handle'] == handle)
    entry = {
        'title': p['title'], 'handle': handle, 'productId': p['id'],
        'baseVariants': [{'id': int(v['id']), 'title': v['title'], 'price': int(round(float(v['price']) * 100)),
                          'available': v['available'], 'opt1': v.get('option1'), 'opt2': v.get('option2')} for v in p['variants']],
        'addons': {}
    }
    for cm in re.finditer(r'<div class="[^"]*addons-container" id="addons-con-([^"]+)">(.*?)(?=<div class="[^"]*addons-container"|id="addons_container_list"|</main|$)', h, re.S):
        cat, block = cm.group(1), cm.group(2)
        cards = re.findall(r'name="id" value="(\d+)">\s*<input type="hidden" name="title" value="([^"]*)">.*?name="product-id" value="(\d+)"', block, re.S)
        lst = []
        for vid, title, pid in cards:
            vid = int(vid); pid = int(pid)
            ap = by_id.get(pid)
            pv = var_price.get(vid)
            price = int(round(float(pv[1]['price']) * 100)) if pv else None
            lst.append({'title': title, 'variantId': str(vid), 'price': price,
                        'handle': ap['handle'] if ap else None, 'productId': pid,
                        'productType': ap['product_type'] if ap else None,
                        'inCatalog': pv is not None})
        entry['addons'][cat] = lst
    out[shape] = entry
    print(shape, handle, 'base', len(entry['baseVariants']), {k: len(v) for k, v in entry['addons'].items()}, file=sys.stderr)

# Clean output (only the fields the app uses)
clean = {}
for shape, e in out.items():
    clean[shape] = {
        'title': e['title'], 'handle': e['handle'],
        'baseVariants': e['baseVariants'],
        'addons': {cat: [{'title': a['title'], 'variantId': a['variantId'], 'price': a['price'] or 0, 'handle': a['handle']}
                         for a in lst] for cat, lst in e['addons'].items()},
    }
json.dump(clean, open(os.path.join(ROOT, 'configurator/js/zw-products.json'), 'w'), ensure_ascii=False, indent=1)

# Per-handle base variants for product-page arrivals (?product=<handle>)
HANDLES = [
    'rechthoekige-eettafel-massief-eikenhout',
    'ovale-eettafel-danilo-uit-massief-eikenhout-met-een-verjongde-rand',
    'massief-eiken-tafel-ovaal',
    'massief-eiken-tafel-deens-ovaal-andreas-met-verjongde-rand',
    'runder-esstisch-romano-aus-massiver-eichenholz',
    'bootsform-esstisch-sergio-aus-massivem-eichenholz-1',
    'organische-eettafel-pure-van-massief-eikenhout',
    'halfronde-eettafel-van-massief-eikenhout',
    'rechhoekige-tafel-eikenhout-verjongde-rand',
    'rechteckiger-esstisch-luciano-aus-2-teilen',
    'gekohlter-esstisch-yakisugi',
]
bh = {}
for h in HANDLES:
    p = next((x for x in prods if x['handle'] == h), None)
    if not p: print('WARN handle not in catalog:', h, file=sys.stderr); continue
    ent = {'title': p['title'], 'variants': [{'id': int(v['id']), 'title': v['title'], 'price': int(round(float(v['price']) * 100)), 'available': v['available']} for v in p['variants']]}
    if h == 'gekohlter-esstisch-yakisugi': ent['includedBehandlung'] = 'Black'
    bh[h] = ent
json.dump(bh, open(os.path.join(ROOT, 'configurator/js/zw-products-by-handle.json'), 'w'), ensure_ascii=False, indent=1)
print('written zw-products.json + zw-products-by-handle.json', file=sys.stderr)
