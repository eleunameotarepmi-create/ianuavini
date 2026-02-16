import json, re

f = 'public/data/db.json'
d = json.load(open(f, 'r', encoding='utf-8'))
fixed = 0

def clean_price(val):
    if not val:
        return val
    s = str(val).strip()
    s = re.sub(r'€\s*', '', s).strip()
    return s if s else str(val)

for w in d.get('wines', []):
    if w.get('price'):
        old = str(w['price'])
        w['price'] = clean_price(old)
        if w['price'] != old:
            fixed += 1
    vintages = w.get('vintages')
    if vintages and isinstance(vintages, list):
        for v in vintages:
            if isinstance(v, dict) and v.get('price'):
                old = str(v['price'])
                v['price'] = clean_price(old)
                if v['price'] != old:
                    fixed += 1

for m in d.get('menu', []):
    if m.get('price'):
        old = str(m['price'])
        m['price'] = clean_price(old)
        if m['price'] != old:
            fixed += 1

json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'Fixed {fixed} prices')

# Show samples
has_euro = 0
for w in d['wines']:
    p = str(w.get('price', ''))
    if '€' in p:
        has_euro += 1
print(f'Wines with € still in price: {has_euro}')

for w in d['wines'][:8]:
    if w.get('price'):
        print(f'  {w["name"][:40]:40s} => "{w["price"]}"')
