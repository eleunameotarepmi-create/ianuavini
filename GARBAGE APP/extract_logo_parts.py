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

print(f"Processing {source}...")
img = Image.open(source)
img = img.convert("RGBA")
data = np.array(img)

# Find bounding box of non-transparent pixels
alpha = data[..., 3]
rows = np.any(alpha > 0, axis=1)
cols = np.any(alpha > 0, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# Crop to content
cropped = img.crop((cmin, rmin, cmax, rmax))
w, h = cropped.size
print(f"Cropped size: {w}x{h}")

# Correct structure based on visual inspection:
# 0-45%: Frame with arch and columns
# 45-55%: IANUA text
# 55-75%: PORTE DES ALPES
# 75-90%: Empty space  
# 90-100%: RISTORANTE with swirl

# Extract ARCH (top frame with columns) - 0 to 45%
arch = cropped.crop((0, 0, w, int(h * 0.45)))
arch.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_arch.png")
print("Saved ianua_arch.png")

# Extract IANUA text - 45% to 55%
ianua = cropped.crop((0, int(h * 0.45), w, int(h * 0.56)))
ianua.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_title.png")
print("Saved ianua_title.png")

# Extract PORTE DES ALPES - 55% to 76%
porte = cropped.crop((0, int(h * 0.56), w, int(h * 0.76)))
porte.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_porte.png")
print("Saved ianua_porte.png")

# Extract RISTORANTE with swirl - 88% to 100%
ristorante = cropped.crop((0, int(h * 0.88), w, h))
ristorante.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_ristorante.png")
print("Saved ianua_ristorante.png")

print("All elements extracted correctly!")
