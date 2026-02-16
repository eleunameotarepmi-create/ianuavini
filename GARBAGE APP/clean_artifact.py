from PIL import Image
import numpy as np
import os

assets_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\public\assets"
# Use the backup source to ensure we have the full image data before wiping
source_file = "glass_white_gold_clean_v2_backup.png"
# OUTPUT TO NEW FILE to allow cache busting
target_file = "glass_white_gold_clean_v4.png"

def clean():
    path = os.path.join(assets_dir, source_file)
    dest_path = os.path.join(assets_dir, target_file)
    
    if not os.path.exists(path):
        # Fallback if backup doesn't exist
        print(f"Backup not found, trying v2: {path}")
        path = os.path.join(assets_dir, "glass_white_gold_clean_v2.png")
    
    if not os.path.exists(path):
        print("No source file found!")
        return

    print(f"Cleaning artifact from {path} -> {dest_path}...")
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    h, w, c = data.shape
    
    # User said "QUASI" and screenshot shows a vertical line (my previous cut).
    # This means the artifact extends further to the right than 33%.
    # I need to cut closer to the glass.
    # Wiping 41% (0.41). This is nearing the center but should be safe for the bowl.
    wipe_width = int(w * 0.41)
    
    # Set alpha to 0 for x < wipe_width
    data[:, :wipe_width, 3] = 0
    
    # Save the cleaned image to new filename
    cleaned_img = Image.fromarray(data)
    cleaned_img.save(dest_path)
    print(f"Success: Created {dest_path} - Wiped left {wipe_width} pixels.")

if __name__ == "__main__":
    clean()
