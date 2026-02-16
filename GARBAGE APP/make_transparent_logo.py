import sys
import subprocess

# Ensure PIL is installed
try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy"])
    from PIL import Image
    import numpy as np

source = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_gold.png"
target = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_gold_transparent.png"

print(f"Opening {source}...")
img = Image.open(source)
img = img.convert("RGBA")
data = np.array(img)

# Make black background transparent
# Keep only the gold (R=212, G=175, B=55 and close variants)
r, g, b, a = data.T

# Identify black/very dark pixels (background)
# These are pixels where all RGB values are low
black_areas = (r < 50) & (g < 50) & (b < 50)

# Make black areas fully transparent
data[..., 3][black_areas.T] = 0  # Set alpha to 0

im2 = Image.fromarray(data)
im2.save(target)
print(f"Saved transparent gold logo to {target}")
