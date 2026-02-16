from PIL import Image
import os

def generate_icons():
    source_path = "public/assets/ianua_logo_gold_transparent.png"
    if not os.path.exists(source_path):
        print("Source image not found!")
        return

    try:
        img = Image.open(source_path)
        img = img.convert("RGBA")
        
        # Calculate aspect ratio
        width, height = img.size
        max_dim = max(width, height)
        
        # Create a new square image with transparent background
        # Add some padding (e.g. 10%) so the logo doesn't touch the edges
        padding_factor = 1.2
        square_size = int(max_dim * padding_factor)
        new_img = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 0))
        
        # Center the original image
        offset_x = (square_size - width) // 2
        offset_y = (square_size - height) // 2
        
        new_img.paste(img, (offset_x, offset_y), img)
        
        # Resize and save
        sizes = [192, 512, 64]
        for size in sizes:
            resized = new_img.resize((size, size), Image.Resampling.LANCZOS)
            filename = f"public/pwa-{size}x{size}.png"
            if size == 64:
                 # Also save as favicon.ico (though png is often supported, ico is classic)
                 # We'll just save as png for now and maybe link it
                 filename = "public/favicon.png"
            
            resized.save(filename)
            print(f"Saved {filename}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_icons()
