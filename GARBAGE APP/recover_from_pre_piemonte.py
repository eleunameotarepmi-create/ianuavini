
import json

try:
    print("Reading db.json.pre_piemonte_backup...")
    with open('db.json.pre_piemonte_backup', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Searching for Oberto wines in backup by name...")
    
    for wine in data.get('wines', []):
        name = wine.get('name', '').lower()
        if 'oberto' in name or (wine.get('wineryId') and 'oberto' in wine.get('wineryId')):
             print(f"FOUND: {wine['name']}")
             print(f"  ID: {wine['id']}")
             print(f"  Pairing: {json.dumps(wine.get('pairing'))}")
             print("-" * 10)

except Exception as e:
    print(f"Error: {e}")
