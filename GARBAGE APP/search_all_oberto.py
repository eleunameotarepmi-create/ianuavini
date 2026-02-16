
import json

output = {}

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    found_lines = []
    
    # scan every wine
    for wine in data.get('wines', []):
        name = wine.get('name', '').lower()
        desc = wine.get('description', '').lower()
        wid = wine.get('id', '')
        
        # Check for Oberto or Andrea
        if 'oberto' in name or 'oberto' in wid or 'oberto' in desc:
             found_lines.append(f"MATCH: {wine['id']} - {wine['name']} (Winery: {wine.get('wineryId')})")
             
    output['matches'] = found_lines

except Exception as e:
    output['error'] = str(e)

with open('all_oberto_matches.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
