import sys
import subprocess
try:
    from PIL import Image
    import numpy as np
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy"])
    from PIL import Image
    import numpy as np

source = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_gold_transparent.png"
target = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_header.png"

print(f"Processing {source}...")
img = Image.open(source)
img = img.convert("RGBA")
data = np.array(img)

# 1. Find bounding box of non-transparent pixels
# Alpha channel is index 3
alpha = data[..., 3]
rows = np.any(alpha > 0, axis=1)
cols = np.any(alpha > 0, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# 2. Crop via bounding box (removes all empty space around)
cropped = img.crop((cmin, rmin, cmax, rmax))

# 3. Now we have the full logo tightly cropped. 
# We need to remove the "RISTORANTE" text at the bottom.
# Let's assume the logo structure. The "RISTORANTE" part is at the very bottom.
# We can aggressively crop the bottom 20% of the height? 
# Or we can try to find the gap between "PORTE DES ALPES" and "RISTORANTE".
# But a simple height cut is safer if we know the proportion.

w, h = cropped.size
# Cut off bottom 15% (heuristic for Ristorante text)
new_h = int(h * 0.82) 
final_logo = cropped.crop((0, 0, w, new_h))

final_logo.save(target)
print(f"Saved cropped header logo to {target}")
