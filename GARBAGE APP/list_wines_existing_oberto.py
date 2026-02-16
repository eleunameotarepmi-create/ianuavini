
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    target_winery_id = "azienda_agricola_andrea_oberto"
    
    print(f"Listing wines for winery: {target_winery_id}")
    
    count = 0
    for wine in data.get('wines', []):
        if wine.get('wineryId') == target_winery_id:
             print(f"- {wine['name']} (ID: {wine['id']})")
             count += 1
             
    if count == 0:
        print("No wines found for this winery.")

except Exception as e:
    print(f"Error: {e}")
