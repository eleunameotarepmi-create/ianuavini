
import json

try:
    with open('c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    keywords = ["Brandini", "Rebelle", "Annunziata", "Resa 56", "Fonduta", "Uovo", "Spigola", "Zuppetta", "Coniglio", "Pansoti", "Sushi", "Vitello", "Petto", "Cotoletta", "Rossini", "Wellington", "Tartiflette", "Polenta", "Sottofiletto"]

    wines = []
    for w in data.get('wines', []):
        if any(k.lower() in w.get('name', '').lower() for k in keywords) or "brandini" in w.get('wineryId', '').lower():
            wines.append({"id": w.get('id'), "name": w.get('name')})

    dishes = []
    for m in data.get('menu', []):
        if any(k.lower() in m.get('name', '').lower() for k in keywords):
            dishes.append({"id": m.get('id'), "name": m.get('name')})

    print(json.dumps({"wines": wines, "dishes": dishes}, indent=2))

except Exception as e:
    print(f"Error: {e}")
