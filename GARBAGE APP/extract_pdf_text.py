import sys
import os

pdf_path = "piemonte_raw.pdf"

if not os.path.exists(pdf_path):
    print(f"File not found: {pdf_path}")
    sys.exit(1)

try:
    import pypdf
except ImportError:
    try:
        import PyPDF2 as pypdf
    except ImportError:
        print("No PDF library found (pypdf or PyPDF2)")
        sys.exit(1)

try:
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    print(f"Pages: {len(reader.pages)}")
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += f"--- Page {i+1} ---\n{page_text}\n"
        else:
            print(f"Page {i+1} has no text (scanned?)")
    
    if len(text.strip()) == 0:
        print("No text extracted. Likely a scanned PDF without OCR.")
    else:
        print("Extraction successful.")
        with open("piemonte_extracted.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text saved to piemonte_extracted.txt")

except Exception as e:
    print(f"Error reading PDF: {e}")
