
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    target_id = "andrea_oberto_nebbiolo_2023"
    
    found = False
    for wine in data.get('wines', []):
        if wine['id'] == target_id:
            found = True
            print(f"Wine Found: {wine['name']} (ID: {wine['id']})")
            print(f"  Winery ID: {wine.get('wineryId')}")
            break
            
    if not found:
        print(f"Wine NOT FOUND: {target_id}")

except Exception as e:
    print(f"Error: {e}")
