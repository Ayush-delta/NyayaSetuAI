from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_processor import extract_text_from_pdf, extract_case_metadata
from services.ai_extractor import extract_information, generate_action_plan, compute_confidence, generate_case_summary
from services.storage_service import upload_pdf_to_supabase, check_duplicate
from services.vector_service import create_vector_store, get_context_for_extraction
from db.postgres import save_record_pg, init_db
from models.schemas import VerificationStatus
from datetime import datetime
import uuid
import time
from services.dependencies import require_admin
from fastapi import Depends

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload")
async def upload_judgment(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin)  # ← add this
):
    ...

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload")
async def upload_judgment(file: UploadFile = File(...)):
    start_time = time.time()
    
    print(f"📄 Received: {file.filename}")
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    pdf_bytes = await file.read()
    
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file received")

    # Step 1: Duplicate check (disabled for testing)
    import hashlib
    file_hash = hashlib.md5(pdf_bytes).hexdigest()
    if check_duplicate(file_hash):
        raise HTTPException(
            status_code=409,
            detail="This judgment has already been uploaded. Check the review queue."
        )

    record_id = str(uuid.uuid4())

    # Step 2: Upload PDF to Supabase storage
    print("☁️ Uploading to Supabase storage...")
    try:
        storage_result = upload_pdf_to_supabase(pdf_bytes, file.filename, record_id)
    except Exception as e:
        print(f"Storage error: {e}")
        storage_result = {"storage_path": None, "signed_url": None, 
                         "file_hash": file_hash, "file_size": len(pdf_bytes)}

    # Step 3: Extract text from PDF
    print("📝 Extracting text...")
    pdf_result = extract_text_from_pdf(pdf_bytes)
    full_text = pdf_result["full_text"]

    if not full_text or len(full_text) < 100:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    # Rule-based pre-extraction (runs before LLM)
    rule_based = extract_case_metadata(full_text)
    print(f"📌 Rule-based extraction: {rule_based}")

    # Step 4: Create vector store (chunking + embeddings)
    print("🔢 Creating vector embeddings...")
    vector_result = create_vector_store(record_id, full_text)
    
    # Step 5: Get RAG context for AI extraction
    rag_context = get_context_for_extraction(record_id)
    context_text = rag_context if rag_context else full_text[:6000]

    # Step 6: AI extraction
    print("🤖 Running AI extraction...")
    extracted = extract_information(context_text)

    # Merge rule-based into LLM output — rule-based wins for judge name
    if rule_based.get("judge_name"):
        if not extracted.get("case_details"):
            extracted["case_details"] = {}
        if not extracted["case_details"].get("judge_name") or \
           extracted["case_details"]["judge_name"] in [None, "null", ""]:
            extracted["case_details"]["judge_name"] = rule_based["judge_name"]
            print(f"✅ Judge name corrected to: {rule_based['judge_name']}")

    # Step 7: Action plan
    print("📋 Generating action plan...")
    action_plan = generate_action_plan(extracted)

    # Step 7.5: Generate case summary for Source Material tab
    print("📝 Generating case summary...")
    case_summary = generate_case_summary(full_text)

    # Step 8: Confidence scoring
    print("📊 Computing confidence scores...")
    confidence = compute_confidence(extracted, action_plan)

    # Step 9: Source highlights
    highlights = []
    for direction in extracted.get("key_directions", [])[:3]:
        if direction and len(direction) > 10:
            highlights.append(direction[:200])

    processing_time = round(time.time() - start_time, 2)
    print(f"✅ Done in {processing_time}s")

    # Step 10: Save to PostgreSQL
    record_data = {
        "id": record_id,
        "filename": file.filename,
        "storage_path": storage_result.get("storage_path"),
        "signed_url": storage_result.get("signed_url"),
        "file_hash": storage_result.get("file_hash"),
        "file_size": str(storage_result.get("file_size", 0)),
        "extracted_data": extracted,
        "action_plan": action_plan,
        "confidence_scores": confidence,
        "compliance_tracking": {"compliance_status": "not_started", "updates": []},
        "verification_status": "pending",
        "case_summary": case_summary,
        "source_highlights": highlights,
        "is_scanned": pdf_result["is_scanned"],
        "total_pages": str(pdf_result["total_pages"]),
        "processing_time": processing_time,
        "upload_timestamp": datetime.utcnow(),
        "vector_namespace": vector_result.get("namespace"),
    }

    save_record_pg(record_data)

    return {
        "record_id": record_id,
        "message": "Judgment processed successfully",
        "is_scanned": pdf_result["is_scanned"],
        "total_pages": pdf_result["total_pages"],
        "chunks_created": vector_result.get("chunks", 0),
        "processing_time_seconds": processing_time,
        "storage_url": storage_result.get("signed_url"),
        "data": record_data
    }

@router.on_event("startup")
async def startup():
    init_db()