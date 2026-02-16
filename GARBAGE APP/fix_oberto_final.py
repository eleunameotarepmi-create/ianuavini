
import json
import sys

try:
    print("Loading db.json...")
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Define the CORRECT existing IDs
    real_nebbiolo_id = "wine_1769635123838_0"  # Langhe Nebbiolo DOC 2022
    real_barolo_id = "wine_1769631559580_1"    # Barolo DOCG del Comune di La Morra 2019
    
    # 2. Update Menu Pairings
    # Map from forced ID to real ID
    # andrea_oberto_nebbiolo_2023 -> real_nebbiolo_id
    # andrea_oberto_barolo_2019 -> real_barolo_id
    
    count_updated = 0
    if 'menu' in data:
        for item in data['menu']:
            if 'verifiedPairings' in item and item['verifiedPairings']:
                for pairing in item['verifiedPairings']:
                    current_wine_id = pairing.get('wineId')
                    
                    if current_wine_id == 'andrea_oberto_nebbiolo_2023':
                        pairing['wineId'] = real_nebbiolo_id
                        print(f"Updated pairing for '{item['name']}' to use REAL Nebbiolo ID")
                        count_updated += 1
                        
                    elif current_wine_id == 'andrea_oberto_barolo_2019':
                        pairing['wineId'] = real_barolo_id
                        print(f"Updated pairing for '{item['name']}' to use REAL Barolo ID")
                        count_updated += 1

    print(f"Total pairings updated to real IDs: {count_updated}")

    # 3. DELETE the forced duplicates
    original_wine_count = len(data.get('wines', []))
    data['wines'] = [w for w in data.get('wines', []) if w['id'] not in ['andrea_oberto_nebbiolo_2023', 'andrea_oberto_barolo_2019']]
    new_wine_count = len(data.get('wines', []))
    print(f"Deleted {original_wine_count - new_wine_count} duplicate wines.")

    # 4. DELETE the forced winery
    original_winery_count = len(data.get('wineries', []))
    data['wineries'] = [w for w in data.get('wineries', []) if w['id'] != 'andrea_oberto']
    new_winery_count = len(data.get('wineries', []))
    print(f"Deleted {original_winery_count - new_winery_count} duplicate wineries.")

    with open('db.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("db.json cleaned and saved.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
