from PIL import Image
import numpy as np

source = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_gold_transparent.png"
img = Image.open(source).convert("RGBA")
data = np.array(img)

# Find content bounds
alpha = data[..., 3]
rows = np.any(alpha > 0, axis=1)
cols = np.any(alpha > 0, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# Crop to content first (tight)
cropped = img.crop((cmin, rmin, cmax+1, rmax+1))
w, h = cropped.size

# User wants it complete but NO Ristorante.
# Based on previous tests, the bottom border of the 'Porte' section is around 85-86%.
# Let's take 86.5% to be absolutely sure we get the line but not the 'Ristorante' text.
content_h = int(h * 0.865)
final_content = cropped.crop((0, 0, w, content_h))
fw, fh = final_content.size

# Add HUGE 15% vertical safety buffer to ENSURE no browser clipping
v_pad = int(fh * 0.15)
h_pad = int(fw * 0.05)
new_w = fw + 2 * h_pad
new_h = fh + 2 * v_pad

padded_logo = Image.new("RGBA", (new_w, new_h), (255, 255, 255, 0))
padded_logo.paste(final_content, (h_pad, v_pad))

padded_logo.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_logo_home.png")

print(f"Definitive Logo: Height {fh}px -> Padded {new_h}px (Buffer: {v_pad}px top/bottom)")
