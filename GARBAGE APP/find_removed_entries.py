
import json
import sys

try:
    with open('db.json.bak_integrity', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    
    # Filter out bad entries (missing id or wineryId)
    invalid_wines = [w for w in wines if not w.get('id') or not w.get('wineryId')]
    
    if invalid_wines:
        print(f"Found {len(invalid_wines)} invalid wine entries that were removed.")
        for i, w in enumerate(invalid_wines):
            print(f"Entry {i+1}: {json.dumps(w, indent=4)}")
    else:
        print("No invalid entries found in the backup.")

except Exception as e:
    print(f"Error: {e}")
