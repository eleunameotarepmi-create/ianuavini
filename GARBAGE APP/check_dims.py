from PIL import Image
import os

images = {
    "gold": "public/assets/ianua_logo_gold.png",
    "new": "public/assets/ianua_logo_new.png",
    "trans": "public/assets/ianua_logo_gold_transparent.png"
}

for key, img_path in images.items():
    if os.path.exists(img_path):
        try:
            with Image.open(img_path) as img:
                print(f"{key}: {img.size}")
        except Exception:
            pass
    else:
        print(f"{key}: NOT FOUND")
