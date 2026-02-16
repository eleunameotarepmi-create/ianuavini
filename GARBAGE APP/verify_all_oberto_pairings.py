
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Real IDs from previous step
    nebbiolo_id = "wine_1769635123838_0"
    barolo_id = "wine_1769631559580_1"

    expected_pairings = {
        "Sushi": nebbiolo_id,
        "Vitello": nebbiolo_id,
        "Entrée": nebbiolo_id,
        "Tris": nebbiolo_id,
        "Bucatini": nebbiolo_id,
        "Polente": barolo_id,
        "Filetto": barolo_id,
        "Cotoletta": barolo_id,
        "Rognoncino": barolo_id,
        "Selezione": barolo_id
    }

    print("Verifying pairings in db.json...")
    
    missing_count = 0
    match_count = 0

    menu_map = {item['id']: item for item in data.get('menu', [])}
    
    # We loop through menu items and check matches
    found_matches = set()

    for item in data.get('menu', []):
        name = item.get('name', '')
        
        # Check if this item is one of our targets
        target_key = None
        for key in expected_pairings:
            if key.lower() in name.lower():
                target_key = key
                break
        
        if target_key:
            expected_wine = expected_pairings[target_key]
            
            # Check verified pairings
            pairings = item.get('verifiedPairings', [])
            has_pairing = False
            for p in pairings:
                if p.get('wineId') == expected_wine:
                    has_pairing = True
                    break
            
            if has_pairing:
                print(f"[OK] {name} -> Correctly paired with {expected_wine}")
                match_count += 1
                found_matches.add(target_key)
            else:
                print(f"[MISSING] {name} -> MISSING pairing with {expected_wine}")
                missing_count += 1

    # Check if we missed any expected dishes entirely
    for key in expected_pairings:
        if key not in found_matches:
             print(f"[NOT FOUND] Dish matching '{key}' not found in menu items.")

    print(f"\nVerification Complete. {match_count}/10 pairings verified.")

except Exception as e:
    print(f"Error: {e}")
