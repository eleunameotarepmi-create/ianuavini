
import json
import io

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    wineries = {w['id']: w['name'] for w in data['wineries']}
    
    with open('wines_by_winery.txt', 'w', encoding='utf-8') as out:
        out.write(f"Total Wines: {len(data['wines'])}\n")
        out.write(f"Total Wineries: {len(data['wineries'])}\n\n")
        
        # Group wine by winery
        grouped = {}
        for w_id in wineries:
            grouped[w_id] = []
            
        for wine in data['wines']:
            wid = wine.get('wineryId')
            if wid in grouped:
                grouped[wid].append(wine.get('name', 'Unknown'))
            else:
                out.write(f"Orphan: {wine.get('name')} {wid}\n")

        for wid, names in grouped.items():
            wname = wineries.get(wid, "Unknown Winery")
            out.write(f"### {wname} ({len(names)})\n")
            for n in names:
                out.write(f"- {n}\n")
            out.write("\n")
            
    print("Success")

except Exception as e:
    print(f"Error: {e}")
