import os
from PIL import Image
import numpy as np

# Define paths
assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\assets"
input_file = "glass_white_gold_isolated_raw.png"
output_file = "glass_white_gold_clean_v5.png"

def process():
    path = os.path.join(assets_dir, input_file)
    dest_path = os.path.join(assets_dir, output_file)
    
    if not os.path.exists(path):
        print(f"Source file not found: {path}")
        return

    print(f"Processing {path} -> {output_file}...")
    
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    # Split channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # WHITE BACKGROUND REMOVAL STRATEGY
    # Background is white (255, 255, 255)
    
    threshold = 240
    
    # Identify Background
    is_white_bg = (r > threshold) & (g > threshold) & (b > threshold)
    
    # INVERT to get keep mask
    keep_mask = ~is_white_bg
    
    # PROTECT THE GLASS INTERIOR
    # The white wine itself might be light/white/yellow and getting removed.
    # We need a geometric mask to protect the center.
    
    h, w = r.shape
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    
    # Geometric Keep Zone (Center of the image where the glass is)
    # The glass is usually centered in these generations.
    # Let's define an ellipse/box in the middle that we force-keep if it's not PURE white 255.
    
    # Let's trust the "isolated" generation updates the contrast well.
    # If the wine is "pale yellow", R and G will be high, but B might be lower.
    # (255, 255, 200) -> is_white_bg logic (all > 240) might catch it if B > 240.
    # We should refine the threshold or logic.
    
    # Refined Logic:
    # Background is NEUTRAL white. |R-G| < 5 and |G-B| < 5 and R > 240.
    # Wine has color (Saturation).
    
    c_max = np.maximum(np.maximum(r, g), b).astype(np.float32)
    c_min = np.minimum(np.minimum(r, g), b).astype(np.float32)
    delta = c_max - c_min
    saturation = np.zeros_like(c_max)
    non_zero = c_max > 0
    saturation[non_zero] = delta[non_zero] / c_max[non_zero]
    
    is_colorful = saturation > 0.05 # Even pale wine has some saturation
    
    # If it is colorful, KEEP it.
    keep_mask = keep_mask | is_colorful
    
    # Also keep dark lines (rims) - covered by `~is_white_bg` (brightness < 240)
    
    # Apply alpha
    new_alpha = np.zeros_like(r, dtype=np.uint8)
    new_alpha[keep_mask] = 255
    new_alpha[~keep_mask] = 0
    
    data[:,:,3] = new_alpha
    
    # CROP TO CONTENT
    rows = np.any(new_alpha > 0, axis=1)
    cols = np.any(new_alpha > 0, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Empty image resulted!")
        return

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    # Padding
    pad = 10
    ymin = max(0, ymin - pad)
    ymax = min(h, ymax + pad)
    xmin = max(0, xmin - pad)
    xmax = min(w, xmax + pad)
    
    cropped_data = data[ymin:ymax, xmin:xmax]
    
    new_img = Image.fromarray(cropped_data)
    new_img.save(dest_path)
    print(f"Success: Saved cleanly extracted glass to {dest_path}")

if __name__ == "__main__":
    process()
