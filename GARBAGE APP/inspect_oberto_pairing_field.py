
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    target_ids = ["wine_1769635123838_0", "wine_1769631559580_1"]
    
    for wine in data.get('wines', []):
        if wine['id'] in target_ids:
            print(f"Wine: {wine['name']} ({wine['id']})")
            print(f"  Current pairing field: {json.dumps(wine.get('pairing'))}")
            print("-" * 20)

except Exception as e:
    print(f"Error: {e}")
