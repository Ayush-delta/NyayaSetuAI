import os
from supabase import create_client, Client
from dotenv import load_dotenv
import hashlib

load_dotenv()

_supabase_client: Client = None

def _get_client() -> Client:
    """Lazy-initialize Supabase client so missing env vars don't crash startup."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "Missing SUPABASE_URL or SUPABASE_KEY in .env file."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client

BUCKET = os.getenv("SUPABASE_BUCKET", "judgments")

def upload_pdf_to_supabase(pdf_bytes: bytes, filename: str, record_id: str) -> dict:
    """
    Upload PDF to Supabase storage.
    Returns public URL and file hash.
    """
    # Compute hash to detect duplicates
    file_hash = hashlib.md5(pdf_bytes).hexdigest()
    
    # Store under record_id folder
    storage_path = f"{record_id}/{filename}"
    
    # Upload to Supabase
    response = _get_client().storage.from_(BUCKET).upload(
        path=storage_path,
        file=pdf_bytes,
        file_options={"content-type": "application/pdf"}
    )
    
    # Get signed URL (valid for 1 year)
    signed = _get_client().storage.from_(BUCKET).create_signed_url(
        path=storage_path,
        expires_in=31536000
    )
    
    return {
        "storage_path": storage_path,
        "signed_url": signed.get("signedURL"),
        "file_hash": file_hash,
        "file_size": len(pdf_bytes)
    }

def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """Get a fresh signed URL for a stored PDF."""
    signed = _get_client().storage.from_(BUCKET).create_signed_url(
        path=storage_path,
        expires_in=expires_in
    )
    return signed.get("signedURL")

def delete_pdf_from_supabase(storage_path: str) -> bool:
    """Delete a PDF from storage."""
    try:
        _get_client().storage.from_(BUCKET).remove([storage_path])
        return True
    except Exception:
        return False

def check_duplicate(file_hash: str) -> bool:
    """
    Check if a file with this hash already exists in DB.
    Called before processing to avoid duplicate uploads.
    """
    from db.postgres import get_record_by_hash
    existing = get_record_by_hash(file_hash)
    return existing is not None