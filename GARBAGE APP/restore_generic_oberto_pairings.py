
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Valid IDs from previous steps
    nebbiolo_id = "wine_1769635123838_0"
    barolo_id = "wine_1769631559580_1"
    
    # Generic pairings from source text
    nebbiolo_pairing = "Un vino giovane e scattante, perfetto per la freschezza degli antipasti e dei primi saporiti del menu."
    barolo_pairing = "L'eleganza di La Morra chiede piatti di grande struttura, selvaggina o preparazioni nobili."
    
    count = 0
    for wine in data.get('wines', []):
        if wine['id'] == nebbiolo_id:
            wine['pairing'] = nebbiolo_pairing
            print(f"Restored embedding pairing for Nebbiolo ({wine['id']})")
            count += 1
        elif wine['id'] == barolo_id:
            wine['pairing'] = barolo_pairing
            print(f"Restored embedding pairing for Barolo ({wine['id']})")
            count += 1

    if count > 0:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("db.json updated: Generic pairing text restored.")
    else:
        print("Target wines not found.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
