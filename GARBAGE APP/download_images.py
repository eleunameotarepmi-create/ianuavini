import urllib.request
import os
import hashlib

IMAGES = {
    'canavese.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Lago_di_Viverone_da_Anzasco.jpg',
    'langhe.jpg': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Barolo_and_vineyards_langhe.jpg',
    'roero.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Rocche_del_Roero.jpg',
    'monferrato.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Cella_Monte_Panorama.jpg',
    'alto_piemonte.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Gattinara_vigneti_torre.jpg',
    'tortonese.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Vigneti_a_Monleale.jpg'
}

TARGET_DIR = 'public/assets/images/regions'

def download_images():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    opener = urllib.request.build_opener()
    opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]
    urllib.request.install_opener(opener)

    for filename, url in IMAGES.items():
        filepath = os.path.join(TARGET_DIR, filename)
        try:
            print(f"Downloading {filename} from {url}...")
            urllib.request.urlretrieve(url, filepath)
            
            # Verify file size
            size = os.path.getsize(filepath)
            if size < 1000: # Less than 1KB is suspicious
                print(f"WARNING: {filename} is too small ({size} bytes). Possibly a redirect/error page.")
            else:
                print(f"SUCCESS: {filename} downloaded ({size} bytes).")
                
        except Exception as e:
            print(f"ERROR downloading {filename}: {e}")

if __name__ == "__main__":
    download_images()
