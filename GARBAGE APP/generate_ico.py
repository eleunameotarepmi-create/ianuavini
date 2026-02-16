from PIL import Image
import os

src = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\pwa-192x192.png"
dst = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\app.ico"

try:
    if os.path.exists(src):
        img = Image.open(src)
        img.save(dst, format='ICO', sizes=[(192, 192)])
        print(f"Created {dst}")
    else:
        print(f"Source not found: {src}")
except Exception as e:
    print(f"Error: {e}")
