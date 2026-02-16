
import json

db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Search for Bersano Mantico
wines = [
    {"id": w['id'], "name": w['name']} 
    for w in data['wines'] 
    if 'mantico' in w.get('name', '').lower()
]

# Search for Dishes
keywords = ['sushi', 'vitello', 'polent', 'rossini', 'wellington', 'sottofiletto', 'rognon', 'formaggi']
dishes = [
    {"id": m['id'], "name": m['name']} 
    for m in data.get('menu', []) 
    if any(k in m.get('name', '').lower() for k in keywords)
]

with open('bersano_ids.json', 'w', encoding='utf-8') as out:
    json.dump({'wines': wines, 'dishes': dishes}, out, indent=2)
