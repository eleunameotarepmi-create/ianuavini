from PIL import Image
import numpy as np

source = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_ristorante.png"
img = Image.open(source).convert("RGBA")
w, h = img.size
print(f"Orignal Ristorante Image Size: {w}x{h}")

data = np.array(img)
alpha = data[..., 3]
rows = np.any(alpha > 0, axis=1)

# Find where the content starts and ends vertically
rmin, rmax = np.where(rows)[0][[0, -1]]
print(f"Content range vertical: {rmin} to {rmax}")

# The image likely contains:
# Top: RISTORANTE text
# Bottom: Swirl
# Let's try to find a gap.
empty_rows = np.where(~rows[rmin:rmax])[0]

# Simple heuristic: The swirl is usually the bottom-most element.
# Let's take the bottom 40% of the content height and see if we can separate it.
# Or better, let's just assume the text is the big chunk on top and swirl is small on bottom.
# Let's crop the bottom 40% of the original image height as a starting point for "swirl".
# Wait, if "RISTORANTE" is text, it takes some vertical space.
# Let's try to crop from 60% of height to 100%.
swirl_candidate = img.crop((0, int(h * 0.60), w, h))

# Now let's trim this candidate to remove empty space
s_w, s_h = swirl_candidate.size
s_data = np.array(swirl_candidate)
s_alpha = s_data[..., 3]
if np.any(s_alpha > 0):
    s_rows = np.any(s_alpha > 0, axis=1)
    s_cols = np.any(s_alpha > 0, axis=0)
    s_rmin, s_rmax = np.where(s_rows)[0][[0, -1]]
    s_cmin, s_cmax = np.where(s_cols)[0][[0, -1]]
    
    final_swirl = swirl_candidate.crop((s_cmin, s_rmin, s_cmax + 1, s_rmax + 1))
    final_swirl.save(r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/ianua_swirl.png")
    print("Saved ianua_swirl.png (bottom portion cropped and trimmed)")
else:
    print("Could not find content in bottom 40%. Trying bottom 50%.")
    # Fallback logic if needed, but 40% is usually safe for a subtitle swirl.
