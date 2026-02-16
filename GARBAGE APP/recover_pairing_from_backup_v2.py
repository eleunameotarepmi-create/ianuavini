
import json

try:
    print("Reading db.backup.json...")
    with open('db.backup.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Searching for Oberto wines in backup by name...")
    # Matches we want to find
    # Barolo 2019
    # Nebbiolo 2022
    
    for wine in data.get('wines', []):
        name = wine.get('name', '').lower()
        if 'oberto' in name or (wine.get('wineryId') and 'oberto' in wine.get('wineryId')):
             print(f"FOUND: {wine['name']}")
             print(f"  ID: {wine['id']}")
             print(f"  Pairing: {json.dumps(wine.get('pairing'))}")
             print("-" * 10)

except Exception as e:
    print(f"Error: {e}")
