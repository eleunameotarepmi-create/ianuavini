import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import io

# Force stdout to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r"C:\Users\Urukk\Desktop\Vini Piemonte v2\Oberto\Oberto abbinamenti Ianua.docx"

if not os.path.exists(path):
    print(f"File not found: {path}")
    sys.exit(1)

try:
    with zipfile.ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        # XML namespace for Word
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for p in tree.findall('.//w:p', namespaces):
            texts = [node.text for node in p.findall('.//w:t', namespaces) if node.text]
            if texts:
                text.append(''.join(texts))
        
        print('\n'.join(text))

except Exception as e:
    print(f"Error reading docx: {e}")
