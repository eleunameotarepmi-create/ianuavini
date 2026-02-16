
import json
import os

file_path = 'live_data_backup.json'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Keys found: {list(data.keys())}")
    
    if 'menu' in data:
        print(f"Menu items count: {len(data['menu'])}")
        if len(data['menu']) > 0:
            print("First menu item sample:")
            print(json.dumps(data['menu'][0], indent=2))
    else:
        print("'menu' key NOT found in JSON.")

except Exception as e:
    print(f"Error reading JSON: {e}")
