import sys
import os
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

source = r"C:/Users/Urukk/.gemini/antigravity/brain/f63b655c-fe47-479a-8005-537b343cf904/uploaded_image_1768076327003.jpg"
target = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_gold.png"

print(f"Opening {source}...")
img = Image.open(source)
img = img.convert("RGBA")
data = np.array(img)

# Algorithm: Find pixels that are significantly lighter than black
# Original is Black Background, White Lines.
# We want Black Background (Keep), Gold Lines.
# Threshold: Any pixel with brightness > 50 (to catch anti-aliasing edges too)
r, g, b, a = data.T
# Mask for non-black pixels (lighter pixels)
white_areas = (r > 50) | (g > 50) | (b > 50)

# Set these pixels to Gold #D4AF37 (212, 175, 55)
# We preserve alpha channel as is (255 since source is jpg)
# To make it look better on anti-aliased edges, we could blend, but simple replacement is a good start.
# Let's try replacement.
data[..., 0][white_areas.T] = 212 # R
data[..., 1][white_areas.T] = 175 # G
data[..., 2][white_areas.T] = 55  # B

im2 = Image.fromarray(data)
im2.save(target)
print(f"Saved gold logo to {target}")
