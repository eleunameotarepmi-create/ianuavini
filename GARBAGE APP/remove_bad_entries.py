
import json
import sys

try:
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    wines = data.get('wines', [])
    initial_count = len(wines)
    
    # Filter out bad entries (missing id or wineryId)
    valid_wines = [w for w in wines if w.get('id') and w.get('wineryId')]
    
    final_count = len(valid_wines)
    removed_count = initial_count - final_count
    
    if removed_count > 0:
        print(f"Removed {removed_count} invalid wine entries.")
        data['wines'] = valid_wines
        
        # Save backup first
        with open('db.json.bak_integrity', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4) # Saving backup of NEW data? No, backup OLD.
            
        # Re-read old to backup properly
        with open('db.json', 'r', encoding='utf-8') as f:
             old_data = json.load(f)
        with open('db.json.bak_integrity', 'w', encoding='utf-8') as f:
             json.dump(old_data, f, indent=4)
             
        # Write new Data
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print("db.json updated successfully.")
        
    else:
        print("No invalid entries found to remove.")

except Exception as e:
    print(f"Error: {e}")
