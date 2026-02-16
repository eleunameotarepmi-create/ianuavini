
import json
import sys

try:
    print("Loading db.json...")
    with open('db.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Hardcoded Oberto data from piemonte_full_data.json (lines 433 and 752)
    oberto_nebbiolo = {
      "id": "andrea_oberto_nebbiolo_2023",
      "wineryId": "andrea_oberto",
      "name": "Nebbiolo",
      "grapes": "Nebbiolo",
      "description": "Un vino giovane e scattante, perfetto per la freschezza degli antipasti e dei primi saporiti del menu.",
      "pairing": "Sushi Valdôtèn...",
      "priceRange": "€€",
      "altitude": None,
      "type": "red",
      "image": "" 
    }
    
    oberto_barolo = {
      "id": "andrea_oberto_barolo_2019",
      "wineryId": "andrea_oberto",
      "name": "Barolo",
      "grapes": "Nebbiolo",
      "description": "L'eleganza di La Morra chiede piatti di grande struttura, selvaggina o preparazioni nobili.",
      "pairing": "Le Polente di IANUA...",
      "priceRange": "€€€",
      "altitude": None,
      "type": "red",
      "image": ""
    }
    
    wines_to_add = [oberto_nebbiolo, oberto_barolo]
    
    for new_wine in wines_to_add:
        existing = next((w for w in db['wines'] if w['id'] == new_wine['id']), None)
        if existing:
            print(f"Updating existing wine: {new_wine['id']}")
            # Update fields
            index = db['wines'].index(existing)
            db['wines'][index] = new_wine
        else:
            print(f"Adding NEW wine: {new_wine['id']}")
            db['wines'].insert(0, new_wine)
            
    # Also verify winery
    oberto_winery = {
      "id": "andrea_oberto",
      "name": "Andrea Oberto",
      "location": "La Morra",
      "region": "Langhe",
      "description": "Winery from La Morra.",
      "curiosity": None,
      "image": ""
    }
    
    existing_winery = next((w for w in db['wineries'] if w['id'] == oberto_winery['id']), None)
    if not existing_winery:
        print("Adding Andrea Oberto winery")
        db['wineries'].insert(0, oberto_winery)
    else:
        print("Winery found.")

    with open('db.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    print("db.json saved successfully.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
