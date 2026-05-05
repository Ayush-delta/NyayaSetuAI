from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.postgres import get_record_pg, get_all_records_pg, update_record_pg
from datetime import datetime

router = APIRouter(prefix="/api", tags=["verification"])

class VerificationRequest(BaseModel):
    status: str
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    edited_action_plan: Optional[dict] = None

class EditRecordRequest(BaseModel):
    extracted_data: Optional[dict] = None
    action_plan: Optional[dict] = None
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None

@router.put("/records/{record_id}")
async def update_record_full(record_id: str, request: EditRecordRequest):
    """Save all edits made by a government agent to a record."""
    record = get_record_pg(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    updates = {
        "verification_status": "edited",
        "reviewed_by": request.reviewed_by or "government_officer",
        "reviewed_at": datetime.utcnow(),
    }
    if request.extracted_data:
        updates["extracted_data"] = request.extracted_data
    if request.action_plan:
        updates["action_plan"] = request.action_plan
    if request.reviewer_notes:
        updates["reviewer_notes"] = request.reviewer_notes

    update_record_pg(record_id, updates)
    return {
        "message": "Record updated successfully",
        "record_id": record_id
    }

@router.get("/records/{record_id}")
async def get_record_detail(record_id: str):
    record = get_record_pg(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.get("/records")
async def list_all_records():
    return get_all_records_pg()

@router.post("/records/{record_id}/verify")
async def verify_record(record_id: str, request: VerificationRequest):
    record = get_record_pg(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    updates = {
        "verification_status": request.status,
        "reviewer_notes": request.reviewer_notes,
        "reviewed_by": request.reviewed_by or "government_officer",
        "reviewed_at": datetime.utcnow()
    }

    if request.edited_action_plan and request.status == "edited":
        updates["action_plan"] = request.edited_action_plan

    update_record_pg(record_id, updates)
    return {
        "message": f"Record {request.status} successfully",
        "record_id": record_id
    }