
import json
import sys

try:
    print("Loading db.json...")
    with open('db.json', 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    print("Loading piemonte_full_data.json...")
    try:
        with open('piemonte_full_data.json', 'r', encoding='utf-8') as f:
            source = json.load(f)
    except FileNotFoundError:
        # Fallback manual data if file is missing (safeguard)
        print("piemonte_full_data.json not found, using hardcoded data.")
        source = {
            "wineries": [{
                "id": "andrea_oberto",
                "name": "Andrea Oberto",
                "location": "La Morra",
                "region": "Langhe",
                "description": "Winery from La Morra.",
                "curiosity": None,
                "image": ""
            }],
            "wines": [
                {
                  "id": "andrea_oberto_nebbiolo_2023",
                  "wineryId": "andrea_oberto",
                  "name": "Nebbiolo",
                  "grapes": "Nebbiolo",
                  "description": "Un vino giovane e scattante, perfetto per la freschezza degli antipasti e dei primi saporiti del menu.",
                  "pairing": "Sushi Valdôtèn...",
                  "priceRange": "€€",
                  "altitude": None,
                  "type": "red"
                },
                {
                  "id": "andrea_oberto_barolo_2019",
                  "wineryId": "andrea_oberto",
                  "name": "Barolo",
                  "grapes": "Nebbiolo",
                  "description": "L'eleganza di La Morra chiede piatti di grande struttura, selvaggina o preparazioni nobili.",
                  "pairing": "Le Polente di IANUA...",
                  "priceRange": "€€€",
                  "altitude": None,
                  "type": "red"
                }
            ]
        }

    # 1. Import Winery
    oberto_winery = next((w for w in source['wineries'] if w['id'] == 'andrea_oberto'), None)
    if oberto_winery:
        existing_winery = next((w for w in db['wineries'] if w['id'] == 'andrea_oberto'), None)
        if not existing_winery:
            db['wineries'].insert(0, oberto_winery)
            print("Imported winery: Andrea Oberto")
        else:
            print("Winery Andrea Oberto already exists.")
            
    # 2. Import Wines
    target_wine_ids = ['andrea_oberto_nebbiolo_2023', 'andrea_oberto_barolo_2019']
    
    for wid in target_wine_ids:
        source_wine = next((w for w in source['wines'] if w['id'] == wid), None)
        if source_wine:
            existing_wine = next((w for w in db['wines'] if w['id'] == wid), None)
            if not existing_wine:
                db['wines'].insert(0, source_wine)
                print(f"Imported wine: {source_wine['name']}")
            else:
                print(f"Wine {wid} already exists (updating details just in case).")
                # Update details if exists, to ensure description matches
                index = db['wines'].index(existing_wine)
                db['wines'][index] = source_wine
                print(f"Updated wine {wid}")
        else:
            print(f"Source wine {wid} not found in source data!")

    with open('db.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    print("db.json saved.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
