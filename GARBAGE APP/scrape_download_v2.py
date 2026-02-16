import urllib.request
import re
import os

FILES = {
    'canavese.jpg': 'https://commons.wikimedia.org/wiki/File:Lago_di_Viverone_visto_da_Roppolo.jpg', # Changed to a more common one if possible, or stick to previous
    'langhe.jpg': 'https://commons.wikimedia.org/wiki/File:Langhe_vineyards.jpg', 
    'roero.jpg': 'https://commons.wikimedia.org/wiki/File:Rocche_del_roero.jpg', 
    'monferrato.jpg': 'https://commons.wikimedia.org/wiki/File:Panorama_Cella_Monte.jpg',
    'alto_piemonte.jpg': 'https://commons.wikimedia.org/wiki/File:Torre_di_Castelle_-_Gattinara.JPG',
    'tortonese.jpg': 'https://commons.wikimedia.org/wiki/File:Vigneti_Derthona.jpg' 
}

# Fallback precise filenames if the above are guesses
FILES_V2 = {
    'canavese.jpg': 'https://commons.wikimedia.org/wiki/File:Lago_di_Viverone_da_Anzasco.jpg',
    'langhe.jpg': 'https://commons.wikimedia.org/wiki/File:Barolo_and_vineyards_langhe.jpg',
    'roero.jpg': 'https://commons.wikimedia.org/wiki/File:Rocche_del_Roero.jpg',
    'monferrato.jpg': 'https://commons.wikimedia.org/wiki/File:Cella_Monte_Panorama.jpg',
    'alto_piemonte.jpg': 'https://commons.wikimedia.org/wiki/File:Gattinara_vigneti_torre.jpg',
    'tortonese.jpg': 'https://commons.wikimedia.org/wiki/File:Vigneti_a_Monleale.jpg'
}

TARGET_DIR = 'public/assets/images/regions'

def get_real_url(wiki_page_url):
    try:
        req = urllib.request.Request(
            wiki_page_url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # Regex to find the upload.wikimedia.org link for the original file
            # Look for: "original file" or proper og:image
            # Pattern: <a href="https://upload.wikimedia.org/wikipedia/commons/x/xy/Filename.jpg"
            
            # Strategy 1: Look for the 'original file' link
            match = re.search(r'href="(https://upload\.wikimedia\.org/wikipedia/commons/[^"]+)" class="internal"', html)
            if match:
                return match.group(1)
            
            # Strategy 2: Look for fullImageLink
            match = re.search(r'class="fullImageLink" id="file"><a href="(https://upload\.wikimedia\.org/wikipedia/commons/[^"]+)"', html)
            if match:
                return match.group(1)
                
            return None
    except Exception as e:
        print(f"Error scraping {wiki_page_url}: {e}")
        return None

def download_images():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    # Use V2 as they are the ones I found in search snippets mostly
    for filename, page_url in FILES_V2.items():
        print(f"Processing {filename}...")
        real_url = get_real_url(page_url)
        
        if not real_url:
            print(f"  FAILED to find image URL for {page_url}")
            continue
            
        print(f"  Found URL: {real_url}")
        
        filepath = os.path.join(TARGET_DIR, filename)
        try:
            req = urllib.request.Request(
                real_url, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req) as source, open(filepath, 'wb') as output:
                output.write(source.read())
            
            size = os.path.getsize(filepath)
            print(f"  Downloaded {filename} ({size} bytes)")
        except Exception as e:
            print(f"  Error downloading: {e}")

if __name__ == "__main__":
    download_images()
