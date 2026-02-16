
from PIL import Image
import os

def make_transparent(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # brightness based on max of RGB
        brightness = max(item[0], item[1], item[2])
        if brightness < 8:
             newData.append((0, 0, 0, 0))
        else:
             alpha = min(255, int(brightness * 2.5)) 
             newData.append((item[0], item[1], item[2], alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

# Base folder for raw artifacts
base_raw = r"C:/Users/Urukk/.gemini/antigravity/brain/0a4a0b7a-99a3-4f5b-bd60-ac24013c7d9d/"
# Output folder in app assets
base_out = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/"

files_to_process = [
    ("glass_red_right_unif_raw_1768831565229.png", "glass_red_real_tr_v2.png"),
    ("glass_white_right_unif_raw_1768831681886.png", "glass_white_real_tr_v2.png"),
    ("glass_rose_right_unif_raw_1768831817820.png", "glass_rose_real_tr_v2.png"),
    ("glass_flute_right_unif_raw_1768831925010.png", "glass_flute_real_tr_v2.png"),
    ("glass_spk_rose_right_unif_raw_1768832083783.png", "glass_sparkling_rose_real_tr_v2.png"),
    ("glass_dessert_right_unif_raw_1768832190319.png", "glass_dessert_real_tr_v2.png")
]

for raw, out in files_to_process:
    make_transparent(os.path.join(base_raw, raw), os.path.join(base_out, out))
