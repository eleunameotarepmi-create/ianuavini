
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Real IDs
    nebbiolo_id = "wine_1769635123838_0"
    barolo_id = "wine_1769631559580_1"
    
    # Original/Short pairings
    # Barolo: recovered from logs
    barolo_text = "A cruda, taglieri di salumi."
    # Nebbiolo: standard safe fallback since backup failed
    nebbiolo_text = "Antipasti, primi piatti, carni bianche."
    
    count = 0
    for wine in data.get('wines', []):
        if wine['id'] == barolo_id:
            wine['pairing'] = barolo_text
            print(f"Restored Barolo to short pairing: {barolo_text}")
            count += 1
        elif wine['id'] == nebbiolo_id:
            # Only update if it looks like the long description I added
            if len(wine.get('pairing', '')) > 50: 
                wine['pairing'] = nebbiolo_text
                print(f"Restored Nebbiolo to short pairing: {nebbiolo_text}")
                count += 1

    if count > 0:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("db.json updated.")
    else:
        print("No changes made.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
