
from PIL import Image
import os

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is very dark (close to black), make it transparent
        # Higher threshold to handle soft edges
        # We use the max of R, G, B to determine brightness
        brightness = max(item[0], item[1], item[2])
        if brightness < 10:
             newData.append((0, 0, 0, 0))
        else:
             # Scale alpha based on brightness for smoother edges
             alpha = min(255, brightness * 2) 
             newData.append((item[0], item[1], item[2], alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

# Process both images
rose_raw = r"C:/Users/Urukk/.gemini/antigravity/brain/0a4a0b7a-99a3-4f5b-bd60-ac24013c7d9d/glass_rose_real_tr_raw_1768829751156.png"
dessert_raw = r"C:/Users/Urukk/.gemini/antigravity/brain/0a4a0b7a-99a3-4f5b-bd60-ac24013c7d9d/glass_dessert_real_tr_raw_1768829814834.png"

rose_out = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/glass_rose_real_tr.png"
dessert_out = r"c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-app/public/assets/glass_dessert_real_tr.png"

make_transparent(rose_raw, rose_out)
make_transparent(dessert_raw, dessert_out)
