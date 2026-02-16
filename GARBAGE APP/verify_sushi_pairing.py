
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Searching for 'Sushi'...")
    found = False
    for item in data.get('menu', []):
        if "Sushi" in item.get('name', ''):
            found = True
            print(f"Item found: {item['name']}")
            pairings = item.get('verifiedPairings')
            if pairings:
                print(f"Verified Pairings count: {len(pairings)}")
                for i, p in enumerate(pairings):
                    print(f"  Pairing {i+1}:")
                    print(f"    Wine ID: {p.get('wineId')}")
                    print(f"    Label: {p.get('label')}")
                    
                    # Check if wine exists
                    wine = next((w for w in data.get('wines', []) if w['id'] == p.get('wineId')), None)
                    if wine:
                         print(f"    -> Link to Wine: FOUND ({wine['name']})")
                    else:
                         print(f"    -> Link to Wine: NOT FOUND")
            else:
                print("No verifiedPairings found.")
    
    if not found:
        print("Item 'Sushi' NOT FOUND.")

except Exception as e:
    print(f"Error: {e}")
