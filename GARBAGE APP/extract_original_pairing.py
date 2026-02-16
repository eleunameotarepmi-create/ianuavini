
import json

try:
    with open('db.backup.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = []
    for wine in data.get('wines', []):
        if "Barolo DOCG del Comune di La Morra 2019" in wine.get('name', ''):
             results.append({
                 "name": wine['name'],
                 "pairing": wine.get('pairing')
             })
        elif "Langhe Nebbiolo DOC 2022" in wine.get('name', ''):
             results.append({
                 "name": wine['name'],
                 "pairing": wine.get('pairing')
             })

    print(json.dumps(results, indent=2, ensure_ascii=False))

except Exception as e:
    print(e)
