
import json

db_path = 'c:/Surface Shares/Riproviamo da qui Antigravity/Ianua vini v3/db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

target_ids = ["winery_1768274751270", "winery_1768275355324"]

found = False
for winery in data.get('wineries', []):
    if winery['id'] in target_ids:
        # Create a copy to not modify original if we were doing more
        w_copy = winery.copy()
        if 'image' in w_copy:
            w_copy['image'] = "<IMAGE_DATA_REMOVED>"
        print(json.dumps(w_copy, indent=2))
        found = True

if not found:
    print("Wineries not found.")
