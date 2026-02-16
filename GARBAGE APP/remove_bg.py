import os
from PIL import Image
import numpy as np

# Define paths
assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-app\public\assets"
files = [
    "glass_red.png",      # The source images might be named without _v3 if I copied them back? 
    # Wait, earlier I copied _wireframe to _v3. Let's use _v3 source.
    "glass_red_v3.png",
    "glass_white_v3.png",
    "glass_flute_v3.png"
]

files_map = {
    # Input Source -> Output Target
    "glass_white_gold_v1.png": "glass_white_gold_clean_v2.png",
    "glass_red_gold_v1.png": "glass_red_gold_clean_v2.png",
    "glass_flute_gold_v1.png": "glass_flute_gold_clean_v2.png",
    "glass_passito_gold_v1.png": "glass_passito_gold_clean_v2.png"
}

print("Starting background removal (BINARY MODE)...")

for valid_src, target_clean in files_map.items():
    path = os.path.join(assets_dir, valid_src)
    
    if not os.path.exists(path):
        print(f"Source file not found: {path} - Skipping")
        continue
            
    print(f"Processing {path} -> {target_clean}...")
    
    try:
        img = Image.open(path).convert("RGBA")
        data = np.array(img)
        
        # Split channels
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Calculate max channel (Brightness)
        c_max = np.maximum(np.maximum(r, g), b).astype(np.float32)
        c_min = np.minimum(np.minimum(r, g), b).astype(np.float32)
        delta = c_max - c_min
        
        # Saturation
        saturation = np.zeros_like(c_max)
        non_zero = c_max > 0
        saturation[non_zero] = delta[non_zero] / c_max[non_zero]
        
        # MASKS
        highlight_mask = c_max > 220 
        saturation_mask = saturation > 0.15
        brightness_mask = c_max > 40
        
        # BASE RULE: Keep if Colorful OR Bright Highlight
        keep_mask = (saturation_mask & brightness_mask) | highlight_mask
        
        # GEOMETRIC MASK (Hourglass / Stem Protection)
        # The glass is vertical. 
        # Top 60%: Bowl (Wide)
        # Bottom 40%: Stem (Narrow) + Base (Slightly wider)
        
        h, w = c_max.shape
        cy, cx = h // 2, w // 2
        y, x = np.ogrid[:h, :w]
        
        is_slender = "flute" in valid_src or "passito" in valid_src
        
        if is_slender:
             # SLENDER MASK (Flute/Passito)
             # body is width * 0.22, base is width * 0.28
             body_cutoff_y = int(h * 0.85)
             body_width_half = w * 0.22
             
             # 2. BASE MASK (Bottom 15%) - Wider base
             base_width_half = w * 0.28
             
             geo_mask = ((y <= body_cutoff_y) & (np.abs(x - cx) < body_width_half)) | \
                        ((y > body_cutoff_y) & (np.abs(x - cx) < base_width_half))
                        
        else:
            # GOBLET MASK (Hourglass) for Red/White
            # 1. BOWL MASK (Top part)
            bowl_cutoff_y = int(h * 0.65)
            radius_x_bowl = w * 0.40 
            radius_y_bowl = h * 0.50
            bowl_mask = (((x - cx)**2 / radius_x_bowl**2) + ((y - cy)**2 / radius_y_bowl**2) <= 1.2) & (y <= bowl_cutoff_y)
            
            # 2. STEM MASK (Bottom part)
            stem_width_half = w * 0.10
            # 3. BASE MASK (Very bottom)
            base_cutoff_y = int(h * 0.90)
            base_width_half = w * 0.25
            
            stem_mask = (y > bowl_cutoff_y) & (np.abs(x - cx) < stem_width_half)
            base_mask = (y > base_cutoff_y) & (np.abs(x - cx) < base_width_half)
            
            geo_mask = bowl_mask | stem_mask | base_mask
        
        # Apply Geometric Mask to the Color Mask
        keep_mask = keep_mask & geo_mask
        
        # BINARY ALPHA: 255 (Opaque) vs 0 (Transparent)
        new_alpha = np.zeros_like(c_max, dtype=np.uint8)
        new_alpha[keep_mask] = 255
        new_alpha[~keep_mask] = 0
        
        # Update alpha
        data[:,:,3] = new_alpha
        
        # Save
        new_img = Image.fromarray(data)
        dest_path = os.path.join(assets_dir, target_clean)
        new_img.save(dest_path)
        print(f"Success: Saved to {dest_path}")
        
    except Exception as e:
        print(f"Error processing {path}: {e}")
