
import json

output = {}

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 1. Find Winery ID
    oberto_winery = None
    for winery in data.get('wineries', []):
        if 'andrea_oberto' in winery['id'].lower() or 'oberto' in winery['name'].lower():
             oberto_winery = winery
             break
    
    output['winery'] = oberto_winery
            
    # 2. Find Wines matching Oberto
    found_wines = []
    if oberto_winery:
        for wine in data.get('wines', []):
            if wine.get('wineryId') == oberto_winery['id']:
                 found_wines.append(wine)
    else:
        # Fallback search by name if winery not found/linked
        for wine in data.get('wines', []):
             if 'oberto' in wine.get('name', '').lower():
                 found_wines.append(wine)

    output['wines'] = found_wines

except Exception as e:
    output['error'] = str(e)

with open('oberto_ids.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
