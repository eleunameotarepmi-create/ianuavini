
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    wineries = data.get('wineries', [])
    
    # Re-impl VDA logic exactly as before for testing
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

    vda_zones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne']
    
    matched_count = 0
    missed_count = 0
    
    print("--- Wines that SHOULD be VDA but are missed ---")
    
    for w in wines:
        winery = next((win for win in wineries if win['id'] == w.get('wineryId')), None)
        region_id = determine_region(winery)
        
        is_vda_zone = region_id in vda_zones
        
        region_str = (winery.get('region') or "").lower()
        is_declared_vda = "valle" in region_str or "aosta" in region_str or "vda" in region_str
        
        if is_vda_zone:
            matched_count += 1
        elif is_declared_vda:
            print(f"MISSED: {w.get('name')} (Winery: {winery.get('name')}, Region: {winery.get('region')}, Location: {winery.get('location')})")
            missed_count += 1
            
    print(f"--- Stats ---")
    print(f"Matched VDA: {matched_count}")
    print(f"Missed VDA (Declared but no zone match): {missed_count}")
    print(f"Total Potentially VDA: {matched_count + missed_count}")

except Exception as e:
    print(f"Error: {e}")
