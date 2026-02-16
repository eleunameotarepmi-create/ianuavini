
import json

output = {}

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    output['keys'] = list(data.keys())
    
    if 'menu' in data:
        output['menu_count'] = len(data['menu'])
        output['first_5'] = [item.get('name', 'NO NAME') for item in data['menu'][:5]]
            
        # Search for specific dishes
        targets = [
            "Sushi", 
            "Vitello", 
            "Entrée", 
            "Tris", 
            "Bucatini",
            "Polente",
            "Filetto",
            "Cotoletta",
            "Rognoncino",
            "Selezione"
        ]
        
        output['search_results'] = []
        for target in targets:
            for item in data['menu']:
                if target.lower() in item.get('name', '').lower():
                    result = {
                        'target': target,
                        'found_name': item.get('name'),
                        'id': item.get('id'),
                        'verifiedPairings': item.get('verifiedPairings')
                    }
                    output['search_results'].append(result)
                
    else:
        output['error'] = "'menu' key not found"

except Exception as e:
    output['error'] = str(e)

with open('found_menu.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
