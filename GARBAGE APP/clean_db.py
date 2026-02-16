import json
import re

DB_FILE = 'import_massivo.json'

def normalize(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())

def main():
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['wines'])
    wines = data['wines']
    
    # 1. Deduplicate
    seen = {}
    unique_wines = []
    
    # Prefer wines with valid wineryId over 'cantina_importata'
    # Sort so 'cantina_importata' comes last, so it gets skipped if duplicate exists
    wines.sort(key=lambda x: 1 if x['wineryId'] == 'cantina_importata' else 0)

    for w in wines:
        norm = normalize(w['name'])
        if norm not in seen:
            seen[norm] = w
            unique_wines.append(w)
        else:
            # If we see it again, but the existing one was 'cantina_importata' and this one is NOT, replace it
            existing = seen[norm]
            if existing['wineryId'] == 'cantina_importata' and w['wineryId'] != 'cantina_importata':
                 # Remove existing from list (tricky, but we rebuild list at end)
                 unique_wines = [x for x in unique_wines if normalize(x['name']) != norm]
                 unique_wines.append(w)
                 seen[norm] = w

    # 2. Try to fix remaining 'cantina_importata' by guessing or just leave them
    # For now, let's just count them.
    cantina_left = [w for w in unique_wines if w['wineryId'] == 'cantina_importata']
    
    print(f"Original: {original_count}")
    print(f"After Deduplication: {len(unique_wines)}")
    print(f"Still in 'cantina_importata': {len(cantina_left)}")

    # Update DB
    data['wines'] = unique_wines
    
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
