
import os

path = 'errors.txt'
if os.path.exists(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    # Try different encodings
    for enc in ['utf-16-le', 'utf-16', 'utf-8']:
        try:
            print(f"--- Encoding: {enc} ---")
            print(content.decode(enc))
            break
        except:
            pass
else:
    print("File not found")
