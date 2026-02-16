
import json
import os

search_term = "Selezione di formaggi"
files = ['live_data_backup.json', 'CLEAN_RESTORE.json', 'import_massivo.json', 'RESTORE_FINAL.json']

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    print(f"Scanning {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if search_term.lower() in content.lower():
                print(f"FOUND '{search_term}' in {file_path}")
                # Try to parse and find the context
                try:
                    data = json.loads(content)
                    # Recursive search function
                    def find_in_obj(obj, path=""):
                        if isinstance(obj, dict):
                            for k, v in obj.items():
                                find_in_obj(v, f"{path}.{k}")
                        elif isinstance(obj, list):
                            for i, v in enumerate(obj):
                                find_in_obj(v, f"{path}[{i}]")
                        elif isinstance(obj, str):
                            if search_term.lower() in obj.lower():
                                print(f"  Match at {path}: {obj[:100]}...")
                                # Print parent object if possible (hard to do with just path recursion)
                    
                    # More robust find that prints the specific item
                    def find_item(obj):
                        if isinstance(obj, dict):
                            if any(search_term.lower() in str(val).lower() for val in obj.values()):
                                print(f"  Found Object: {json.dumps(obj, indent=2)[:500]}...") # Print first 500 chars of the object
                                return
                            for v in obj.values():
                                find_item(v)
                        elif isinstance(obj, list):
                            for v in obj:
                                find_item(v)
                    
                    find_item(data)
                                
                except Exception as e:
                    print(f"  Could not parse JSON to find specific location: {e}")
            else:
                 print(f"String not found in {file_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
