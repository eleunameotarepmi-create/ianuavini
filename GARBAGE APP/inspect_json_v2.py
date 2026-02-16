
import json
import os

files = ['CLEAN_RESTORE.json', 'RESTORE_FINAL.json', 'import_massivo.json']

for file_path in files:
    print(f"\n--- Checking {file_path} ---")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, dict):
            print(f"Keys found: {list(data.keys())}")
            if 'menu' in data:
                print(f"FOUND 'menu' in {file_path}!")
                print(f"Count: {len(data['menu'])}")
                if len(data['menu']) > 0:
                     print(f"Sample: {json.dumps(data['menu'][0], indent=2)[:200]}...")
            elif 'menuItems' in data:
                 print(f"FOUND 'menuItems' in {file_path}!")
        elif isinstance(data, list):
            print(f"Root is a list with {len(data)} items.")
            # Check if items look like menu items
            if len(data) > 0 and 'category' in data[0] and 'price' in data[0]:
                 print("Items look like MenuItems!")
    
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
