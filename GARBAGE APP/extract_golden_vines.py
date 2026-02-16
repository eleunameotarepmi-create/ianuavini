import os
from PIL import Image
import numpy as np

# Define paths
assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\assets"
input_file = "golden_vines_raw.png"
output_file = "golden_vines_transparent.png"

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
    
    # Black BG Removal Strategy
    # Background is Black (0,0,0)
    # We want to keep Gold.
    
    intensity = (r.astype(int) + g.astype(int) + b.astype(int)) / 3
    
    # Simple Luma Mask
    # If pixel is dark, make it transparent.
    # If pixel is bright (gold), make it opaque.
    
    new_alpha = intensity.astype(np.uint8)
    
    # Boost alpha for visibility
    # Gold pixels are around brightness 100-200.
    # Black is < 10.
    
    # Smooth step function
    mask = new_alpha > 10
    
    # We can just use the intensity as the alpha channel directly for a "Screen" effect baked into transparency.
    # But let's make it more solid.
    
    # Normalize alpha: 0->0, 50->255
    normalized_alpha = np.clip(new_alpha * 3.0, 0, 255).astype(np.uint8)
    
    data[:,:,3] = normalized_alpha
    
    # Save
    new_img = Image.fromarray(data)
    new_img.save(dest_path)
    print(f"Saved {dest_path}")

process()
