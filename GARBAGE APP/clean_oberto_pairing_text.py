
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    target_ids = ["wine_1769635123838_0", "wine_1769631559580_1"]
    
    count = 0
    for wine in data.get('wines', []):
        if wine['id'] in target_ids:
            # User doesn't want dish lists here.
            # We will clear it. Use None or empty string.
            # Checking type in db.json, usually it's a string or null.
            print(f"Cleaning pairing for {wine['name']} (was: {wine.get('pairing')})")
            wine['pairing'] = None 
            count += 1

    if count > 0:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("db.json updated: Removed pairing text from Oberto wines.")
    else:
        print("No target wines found to clean.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
