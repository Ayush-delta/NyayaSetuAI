import fitz  # PyMuPDF
import re
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

def extract_judge_name(text: str) -> str:
    """
    Rule-based judge name extraction using regex patterns.
    More reliable than LLM for structured header fields.
    """
    patterns = [
        # "HEMANT GUPTA, J." or "HEMANT GUPTA AND SUDHANSHU DHULIA, JJ."
        r'([A-Z][A-Z\s\.]+),\s*J{1,2}\.',
        # "HON'BLE MR. JUSTICE HEMANT GUPTA"
        r"HON[''']BLE\s+(?:MR\.|MS\.|MRS\.)?\s*JUSTICE\s+([A-Z][A-Za-z\s\.]+)",
        # "CORAM: HEMANT GUPTA, J"
        r'CORAM\s*:\s*([A-Z][A-Z\s\.]+),?\s*J{1,2}',
        # "Before Hon'ble Mr. Justice"
        r"Before\s+Hon[''']ble\s+(?:Mr\.|Ms\.)?\s*Justice\s+([A-Za-z\s\.]+)",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text[:10000])  # search first 10000 chars
        if matches:
            # Clean up the match
            name = matches[0].strip()
            # Title case and remove extra spaces
            name = ' '.join(name.title().split())
            if len(name) > 3:  # filter out false positives
                return name

    return None

def extract_case_metadata(text: str) -> dict:
    """
    Rule-based extraction of key metadata fields.
    Used to supplement/correct LLM output.
    """
    metadata = {}

    # Judge name
    judge = extract_judge_name(text)
    if judge:
        metadata["judge_name"] = judge

    # Date patterns
    date_patterns = [
        r'(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})',
        r'(\d{1,2})\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text[:5000])
        if match:
            metadata["date_hint"] = match.group(0)
            break

    return metadata