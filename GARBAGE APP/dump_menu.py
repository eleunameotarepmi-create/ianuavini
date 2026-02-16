
import json

try:
    with open('c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("MENU ITEMS:")
    for m in data.get('menu', []):
        print(f"ID: {m.get('id')} | Name: {m.get('name')}")

except Exception as e:
    print(e)
