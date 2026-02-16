import os
from PIL import Image
import numpy as np

# Define paths
assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\assets"
input_file = "glass_red_gold_isolated_raw.png"
output_file = "glass_red_gold_proper.png"

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
    
    # Calculate "Whiteness"
    # Logic: If pixel is very bright in all channels, it is background.
    # But glass reflections are also white. 
    # However, background is pure uniform white/near white.
    
    threshold = 240
    
    # Mask of pixels that are NOT white
    # If any channel is < threshold, it is likely content (or darker shadow)
    # Be careful with white highlights.
    
    # Alternative: Flood fill from corners? 
    # Let's assume the glass is isolated.
    
    is_white_bg = (r > threshold) & (g > threshold) & (b > threshold)
    
    # INVERT to get keep mask
    keep_mask = ~is_white_bg
    
    # Clean up holes in the glass? 
    # White wine reflections might be removed if we are not careful.
    # But this is RED wine, so the liquid is dark. The glass rim might be bright.
    
    # Let's use a geometric mask to protect the center of the glass from being erased if it has highlights.
    h, w = r.shape
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    
    # Crop first strategy might be safer? 
    # The generated image has the bottle on the right and glass on the left.
    # We only want the GLASS.
    
    # 1. CROP ROI (Left side)
    crop_w = int(w * 0.45) 
    roi_mask = x < crop_w
    
    # 2. Refine Keep Mask
    # Only keep things in the ROI.
    keep_mask = keep_mask & roi_mask
    
    # 3. Create Alpha
    new_alpha = np.zeros_like(r, dtype=np.uint8)
    new_alpha[keep_mask] = 255
    new_alpha[~keep_mask] = 0
    
    # Apply alpha
    data[:,:,3] = new_alpha
    
    # 4. Crop to content (Get rid of the empty space)
    rows = np.any(new_alpha > 0, axis=1)
    cols = np.any(new_alpha > 0, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Empty image resulted!")
        return

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    # Add padding
    pad = 5
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
