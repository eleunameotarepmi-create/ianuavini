
import json

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    wineries = data.get('wineries', [])
    
    # Re-impl VDA logic from MobileApp.tsx
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
    
    excluded_wines = []
    
    for w in wines:
        winery = next((win for win in wineries if win['id'] == w.get('wineryId')), None)
        region_id = determine_region(winery)
        
        # Logic from MobileApp.tsx
        isVdaZone = region_id in vda_zones
        include = False
        
        if isVdaZone:
            include = True
        else:
             isPiemonteZone = region_id in ['langhe', 'roero', 'monferrato', 'alto-piemonte', 'canavese', 'tortonese']
             winery_region = (winery.get('region') or "").lower()
             is_liguria = region_id == 'liguria'
             is_sardegna = region_id == 'sardegna'
             is_piemonte_str = 'piemonte' in winery_region
             
             if not isPiemonteZone and not is_liguria and not is_sardegna and not is_piemonte_str:
                 include = True # Included as "Generic/Unknown" in VDA view
                 
        if not include:
            excluded_wines.append({
                'name': w.get('name'),
                'winery': winery.get('name') if winery else 'Unknown',
                'region_id': region_id,
                'winery_region': winery.get('region')
            })

    print(f"Total Excluded Wines: {len(excluded_wines)}")
    for ew in excluded_wines:
        print(f" - {ew['name']} ({ew['winery']}) [{ew['winery_region']}]")

except Exception as e:
    print(f"Error: {e}")
