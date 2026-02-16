import json

# DB Path
db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

# Load DB
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

print("--- BORGOGNO WINES ---")
for w in db['wines']:
    if 'borgogno' in w.get('wineryId', '').lower() or 'borgogno' in w.get('name', '').lower():
        print(f"ID: {w['id']} | Name: {w['name']}")

print("\n--- MENU ITEMS SEARCH ---")
targets = [
    'formaggi', 'salumi', 'polenta', 'camoscio', 
    'filetto', 'rossini', 'wellington', 'sottofiletto', 'griglia',
    'prosciutto', 'tonno', 'stracciatella', 'zuppetta', 'pesce', 
    'sushi', 'scaloppa', 'foie', 'nocciola', 'chevre', 
    'risotto', 'amaretto', 'zucca', 'spaghetti', 'scoglio', 
    'spigola', 'acqua pazza', 'ratatouille',
    'vitello', 'tonnato', 'tris', 'vol au vent', 'sformato', 'verza', 'insalata russa',
    'bucatini', 'amatriciana', 'fonduta', 'cotoletta', 'grissini', 'coniglio', 'ligure'
]

found_ids = set()
for m in db['menu']:
    m_name = m['name'].lower()
    for t in targets:
        if t in m_name:
            if m['id'] not in found_ids:
                print(f"ID: {m['id']} | Name: {m['name']} | Cat: {m['category']}")
                found_ids.add(m['id'])
