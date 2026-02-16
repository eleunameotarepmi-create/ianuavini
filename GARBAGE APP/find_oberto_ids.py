
import json

try:
    with open('c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    keywords_wines = ["oberto"]
    keywords_dishes = ["bucatini", "polent", "rognon", "rossini", "wellington", "sushi", "vitello", "entrée", "tris", "cotoletta", "formaggi"]

    wines = []
    for w in data.get('wines', []):
        if any(k.lower() in w.get('name', '').lower() for k in keywords_wines) or any(k.lower() in w.get('wineryId', '').lower() for k in keywords_wines):
            wines.append({"id": w.get('id'), "name": w.get('name')})

    dishes = []
    for m in data.get('menu', []):
        if any(k.lower() in m.get('name', '').lower() for k in keywords_dishes):
            dishes.append({"id": m.get('id'), "name": m.get('name')})

    with open('oberto_ids.json', 'w', encoding='utf-8') as out:
        json.dump({"wines": wines, "dishes": dishes}, out, indent=2)

except Exception as e:
    print(f"Error: {e}")
