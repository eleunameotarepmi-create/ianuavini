
import json
import glob

filenames = glob.glob("db*.json") + glob.glob("*.backup") + glob.glob("*backup*")

results = []

for fname in filenames:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except:
                continue
                
        if 'wines' in data:
            for wine in data['wines']:
                # Broad search
                if 'oberto' in wine.get('name', '').lower() or 'oberto' in wine.get('wineryId', '').lower():
                     # Check if it has the "A cruda" text or similar
                     p = wine.get('pairing', '')
                     if p and "cruda" in p:
                         results.append(f"FOUND in {fname}: {p} (Wine: {wine['name']})")
                     elif p and "taglieri" in p:
                         results.append(f"FOUND in {fname}: {p} (Wine: {wine['name']})")
    except:
        pass

with open("found_backups.txt", "w", encoding="utf-8") as f:
    for r in results:
        f.write(r + "\n")
