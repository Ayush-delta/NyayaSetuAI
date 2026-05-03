import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

TESSERACT_PATH = os.getenv("TESSERACT_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def extract_text_from_pdf(pdf_bytes: bytes) -> dict:
    """
    Extracts text from PDF - handles both digital and scanned PDFs.
    Returns dict with full_text, pages, and is_scanned flag.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text = []
    is_scanned = False
    full_text = ""

    for page_num, page in enumerate(doc):
        # Try direct text extraction first
        text = page.get_text("text").strip()

        if len(text) < 50:
            # Likely scanned — use OCR
            is_scanned = True
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(image, lang="eng")

        pages_text.append({
            "page": page_num + 1,
            "text": text.strip()
        })
        full_text += f"\n--- Page {page_num + 1} ---\n{text}"

    doc.close()

    return {
        "full_text": full_text.strip(),
        "pages": pages_text,
        "is_scanned": is_scanned,
        "total_pages": len(pages_text)
    }

def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> list:
    """Split text into overlapping chunks for RAG."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks