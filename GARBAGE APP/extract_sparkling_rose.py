import os
from PIL import Image
import numpy as np

# Define paths
assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\assets"
input_file = "glass_sparkling_rose_gold_isolated_raw.png"
output_file = "glass_sparkling_rose_gold_proper.png"

def process():
    path = os.path.join(assets_dir, input_file)
    dest_path = os.path.join(assets_dir, output_file)
    
    if not os.path.exists(path):
        print(f"Source file not found: {path} - Skipping")
        return

    print(f"Processing {path} -> {output_file}...")
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # White BG Threshold
    threshold = 240
    is_white_bg = (r > threshold) & (g > threshold) & (b > threshold)
    keep_mask = ~is_white_bg
    
    # Protect colorful interior
    c_max = np.maximum(np.maximum(r, g), b).astype(np.float32)
    c_min = np.minimum(np.minimum(r, g), b).astype(np.float32)
    delta = c_max - c_min
    saturation = np.zeros_like(c_max)
    non_zero = c_max > 0
    saturation[non_zero] = delta[non_zero] / c_max[non_zero]
    
    is_colorful = saturation > 0.05
    keep_mask = keep_mask | is_colorful
    
    new_alpha = np.zeros_like(r, dtype=np.uint8)
    new_alpha[keep_mask] = 255
    new_alpha[~keep_mask] = 0
    
    data[:,:,3] = new_alpha
    
    # Crop
    rows = np.any(new_alpha > 0, axis=1)
    cols = np.any(new_alpha > 0, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Empty image resulted!")
        return

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    pad = 10
    h, w = r.shape
    ymin = max(0, ymin - pad)
    ymax = min(h, ymax + pad)
    xmin = max(0, xmin - pad)
    xmax = min(w, xmax + pad)
    
    cropped_data = data[ymin:ymax, xmin:xmax]
    new_img = Image.fromarray(cropped_data)
    new_img.save(dest_path)
    print(f"Saved {dest_path}")

process()
