from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.pdf_processor import extract_text_from_pdf
from services.ai_extractor import extract_information, generate_action_plan, compute_confidence
from models.schemas import JudgmentRecord, VerificationStatus
from db.database import save_record
import uuid

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload")
async def upload_judgment(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files accepted")

        pdf_bytes = await file.read()
        print(f"File size: {len(pdf_bytes)} bytes")

        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        # Step 1: Extract text from PDF
        pdf_result = extract_text_from_pdf(pdf_bytes)
        full_text = pdf_result["full_text"]

        if not full_text or len(full_text) < 100:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF")

        # Step 2: AI extraction
        extracted = extract_information(full_text)

        # Step 3: Action plan
        action_plan = generate_action_plan(extracted)

        # Step 4: Confidence scoring
        confidence = compute_confidence(extracted, action_plan)

        # Step 5: Build source highlights
        highlights = []
        for direction in extracted.get("key_directions", [])[:3]:
            if direction and len(direction) > 10:
                highlights.append(direction[:200])

        # Step 6: Save record
        record_id = str(uuid.uuid4())
        record = JudgmentRecord(
            id=record_id,
            filename=file.filename,
            extracted_data=extracted,
            action_plan=action_plan,
            confidence_scores=confidence,
            verification_status=VerificationStatus.PENDING,
            source_highlights=highlights
        )
        save_record(record)

        return {
            "record_id": record_id,
            "message": "Judgment processed successfully",
            "is_scanned": pdf_result["is_scanned"],
            "total_pages": pdf_result["total_pages"],
            "data": record.model_dump()
        }
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(tb)
        raise HTTPException(status_code=500, detail=tb)