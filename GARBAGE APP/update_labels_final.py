
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    count = 0
    if 'menu' in data:
        for item in data['menu']:
            if 'verifiedPairings' in item and item['verifiedPairings']:
                for pairing in item['verifiedPairings']:
                    # Update any "Scelta della Casa" to "Scelta del Sommelier"
                    if pairing.get('label') == 'Scelta della Casa':
                        pairing['label'] = 'Scelta del Sommelier'
                        count += 1
                        print(f"Updated pairing for '{item.get('name')}' to 'Scelta del Sommelier'")

    if count > 0:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully updated {count} pairings in db.json.")
    else:
        print("No pairings needed updating (already correct or none found).")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
