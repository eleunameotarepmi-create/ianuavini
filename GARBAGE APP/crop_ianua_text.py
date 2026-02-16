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
target = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_text_gold.png"

print(f"Processing {source}...")
img = Image.open(source)
img = img.convert("RGBA")
data = np.array(img)

# 1. Find bounding box of non-transparent pixels
alpha = data[..., 3]
rows = np.any(alpha > 0, axis=1)
cols = np.any(alpha > 0, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# Crop to content
cropped = img.crop((cmin, rmin, cmax, rmax))
w, h = cropped.size

# 2. Heuristics to isolate "IANUA"
# The logo has Arch (top), IANUA (middle), Subtext (bottom).
# IANUA is roughly in the middle vertical third.
# Let's try to extract the middle 25-55% height range?
# Better: Analyze row density to find the distinct text block.

# Sum of alpha per row
row_density = np.sum(np.array(cropped)[..., 3], axis=1)

# We expect gaps between Arch and IANUA, and IANUA and PORTE.
# Let's try to find those gaps (low density rows).
# Normalize density
norm_density = row_density / np.max(row_density)

# Identify blocks (rows with > 5% max density)
has_content = norm_density > 0.05
# Find transitions
transitions = np.where(np.diff(has_content.astype(int)))[0]

print(f"Transitions at rows: {transitions}")

# Assuming standard logo structure:
# Block 1: Arch
# Gap
# Block 2: IANUA
# Gap
# Block 3: Text

if len(transitions) >= 3:
    # Gap 1 ends at transitions[1], Block 2 starts at transitions[2]? 
    # Let's verify indexes.
    # If starts with content:
    # 0->1 (end of block 1), 1->0 (start of gap 1), 0->1 (start of block 2) ...
    
    # Let's keep it simple. Middle cut.
    # "IANUA" is likely between 35% and 55% of height.
    top_cut = int(h * 0.40)
    bottom_cut = int(h * 0.58)
    
    # Let's try a safer manual crop guided by standard logo proportions.
    # The uploaded image shows IANUA text is quite central.
    # Let's saving the whole middle section.
    
    ianua_img = cropped.crop((0, int(h * 0.44), w, int(h * 0.58)))
    ianua_img.save(target)
    print(f"Saved IANUA text crop to {target}")

else:
    print("Could not detect clear blocks, doing loose middle crop")
    ianua_img = cropped.crop((0, int(h * 0.40), w, int(h * 0.60)))
    ianua_img.save(target)
