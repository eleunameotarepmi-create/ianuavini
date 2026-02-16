import os

def replace_color(root_dir, old_color, new_color):
    for root, dirs, files in os.walk(root_dir):
        if '.git' in dirs:
            dirs.remove('.git')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.json')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if old_color in content or old_color.lower() in content:
                        new_content = content.replace(old_color, new_color)
                        new_content = new_content.replace(old_color.lower(), new_color)
                        
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    replace_color('.', '#F4C430', '#D4AF37')
