
import json
import base64
import os

image_path = "C:/Users/Urukk/.gemini/antigravity/brain/7ed4da3f-475f-46b3-a9a0-13651ff07ec7/uploaded_image_1768908997774.png"
output_file = "missing_dish_restore.json"

if not os.path.exists(image_path):
    print(f"Image not found: {image_path}")
    exit(1)

try:
    with open(image_path, "rb") as img_file:
        b64_string = base64.b64encode(img_file.read()).decode('utf-8')
        
    mime_type = "image/png"
    if image_path.endswith(".jpg") or image_path.endswith(".jpeg"):
        mime_type = "image/jpeg"
        
    image_data_uri = f"data:{mime_type};base64,{b64_string}"
    
    dish_data = {
        "menu": [
            {
                "id": "selezione_formaggi_salumi_locali",
                "name": "Selezione di formaggi e salumi locali",
                "category": "Antipasti",
                "description": "Selezione di formaggi e salumi locali",
                "price": "14 | 18 €",
                "image": image_data_uri,
                "hidden": False
            }
        ]
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dish_data, f, indent=2)
        
    print(f"Successfully created {output_file} with the missing dish.")
    
except Exception as e:
    print(f"Error: {e}")
