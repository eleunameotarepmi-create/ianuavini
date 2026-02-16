
import json

try:
    print("Reading db.backup.json...")
    with open('db.backup.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    target_ids = ["wine_1769635123838_0", "wine_1769631559580_1"]
    
    print("Searching for targets in backup...")
    for wine in data.get('wines', []):
        if wine['id'] in target_ids:
            print(f"FOUND in BACKUP: {wine['name']} ({wine['id']})")
            print(f"  Pairing Value: {json.dumps(wine.get('pairing'))}")

except Exception as e:
    print(f"Error: {e}")
