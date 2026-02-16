
import json
import sys
import os

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    print(f"Total wines: {len(wines)}")
    
    found_issue = False
    for i, w in enumerate(wines):
        if not w:
            print(f"CRITICAL: Null entry at index {i}")
            found_issue = True
        elif 'id' not in w:
            print(f"CRITICAL: Missing 'id' at index {i}. Content: {w}")
            found_issue = True
        elif 'wineryId' not in w:
            print(f"ERROR: Missing 'wineryId' at index {i} (ID: {w.get('id')})")
            found_issue = True

    if not found_issue:
        print("No structural issues found in wines list.")

except Exception as e:
    print(f"Error: {e}")
