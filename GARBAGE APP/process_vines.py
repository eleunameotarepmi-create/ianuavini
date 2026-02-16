
import os
from PIL import Image
import numpy as np

# Define paths
source_dir = r"C:\Users\Urukk\.gemini\antigravity\brain\7d649865-a0d2-436b-ae22-4d1899163052"
target_dir = r"c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-app\public\assets"

files_map = {
    "golden_vine_cinematic_long_1_1768871190316.png": "vine_cinematic_1.png",
    "golden_vine_cinematic_long_2_1768871208413.png": "vine_cinematic_2.png",
    "golden_vine_cinematic_long_3_1768871225159.png": "vine_cinematic_3.png"
}

print("Processing Cinematic Golden Vines...")

for src_name, target_name in files_map.items():
    src_path = os.path.join(source_dir, src_name)
    target_path = os.path.join(target_dir, target_name)
    
    if not os.path.exists(src_path):
        continue

    print(f"Processing {src_name} -> {target_name}...")
    
    try:
        img = Image.open(src_path).convert("RGBA")
        data = np.array(img)
        
        # Split channels
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Calculate grayscale/brightness
        r_f, g_f, b_f = r.astype(np.float32), g.astype(np.float32), b.astype(np.float32)
        brightness = (r_f + g_f + b_f) / 3.0
        
        # New Alpha: Use brightness with a boost for transparency
        new_alpha = np.zeros_like(r, dtype=np.uint8)
        
        # Keep pixels where brightness is above 20
        mask = brightness > 20
        
        # boost for a clean golden look
        new_alpha[mask] = np.clip(brightness[mask] * 2.0, 0, 255).astype(np.uint8)
        
        # Update alpha channel
        data[:,:,3] = new_alpha
        
        # Save result
        processed_img = Image.fromarray(data)
        processed_img.save(target_path)
        print(f"Saved: {target_path}")
        
    except Exception as e:
        print(f"Error: {e}")

print("Done.")
