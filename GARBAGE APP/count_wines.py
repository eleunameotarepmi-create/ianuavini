
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    wineries = data.get('wineries', [])
    
    print(f"Total Wines in Database: {len(wines)}")
    print(f"Total Wineries in Database: {len(wineries)}")
    
    # Check VDA count
    vda_zones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne']
    
    # Re-impl VDA logic
    vdaLocationMap = {
        'bassa': ['donnas', 'pont-saint-martin', 'bard'],
        'nus-quart': ['nus', 'quart', 'fenis'],
        'la-plaine': ['aosta', 'saint-christophe', 'ghessi', 'sarre'],
        'plaine-to-valdigne': ['saint-pierre', 'aymavilles', 'villeneuve', 'introd'],
        'valdigne': ['morgex', 'la salle']
    }

    def determine_region(winery):
        if not winery: return 'unknown'
        loc = (winery.get('location') or "").lower()
        regionManual = (winery.get('region') or "").lower()

        if "bassa" in regionManual: return 'bassa'
        if "nus" in regionManual: return 'nus-quart'
        if "quart" in regionManual: return 'nus-quart'
        if "plaine" in regionManual: return 'la-plaine'
        if "valdigne" in regionManual: return 'valdigne'

        for zone_id, towns in vdaLocationMap.items():
            if any(town in loc for town in towns):
                return zone_id
        return 'unknown'

    vda_count = 0
    for w in wines:
        winery = next((win for win in wineries if win['id'] == w.get('wineryId')), None)
        region_id = determine_region(winery)
        if region_id in vda_zones:
            vda_count += 1
            
    print(f"Total VDA Wines identified: {vda_count}")
    
except Exception as e:
    print(f"Error: {e}")
