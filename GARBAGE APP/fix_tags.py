import json, re

f = 'public/data/db.json'
d = json.load(open(f, 'r', encoding='utf-8'))
fixed = 0

for w in d.get('wines', []):
    for p in w.get('ianuaPairings', []):
        notes = p.get('notes', '')
        if 'TAG:' in notes:
            # Remove "TAG: SomeLabel - " pattern anywhere in the text
            cleaned = re.sub(r'\s*TAG:\s*[^-–]+\s*[-–]\s*', ' ', notes).strip()
            # Also handle "TAG: SomeLabel" at the end without dash
            cleaned = re.sub(r'\s*TAG:\s*\S+\s*$', '', cleaned).strip()
            # Clean up any double spaces
            cleaned = re.sub(r'\s{2,}', ' ', cleaned)
            if cleaned != notes:
                p['notes'] = cleaned
                fixed += 1

# Also fix label "Perfetto" where there's a better label from the notes
for w in d.get('wines', []):
    for p in w.get('ianuaPairings', []):
        if p.get('label', '') == 'Perfetto' and p.get('description', ''):
            desc = p['description']
            m = re.match(r'^TAG:\s*([^-–]+)', desc)
            if m:
                p['label'] = m.group(1).strip()

json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'Fixed notes: {fixed}')

# Verify
remaining = sum(1 for w in d['wines'] for p in w.get('ianuaPairings', []) if 'TAG:' in p.get('notes', ''))
print(f'Remaining TAG in notes: {remaining}')
remaining_desc = sum(1 for w in d['wines'] for p in w.get('ianuaPairings', []) if 'TAG:' in p.get('description', ''))
print(f'Remaining TAG in description: {remaining_desc}')
perfetto = sum(1 for w in d['wines'] for p in w.get('ianuaPairings', []) if p.get('label', '') == 'Perfetto')
print(f'Labels still "Perfetto": {perfetto}')
