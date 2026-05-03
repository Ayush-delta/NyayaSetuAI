from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.database import get_record, update_record
from models.schemas import VerificationStatus

router = APIRouter(prefix="/api", tags=["verification"])

class VerificationRequest(BaseModel):
    status: VerificationStatus
    reviewer_notes: Optional[str] = None
    edited_action_plan: Optional[dict] = None

@router.get("/records/{record_id}")
async def get_record_detail(record_id: str):
    record = get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.get("/records")
async def list_all_records():
    from db.database import get_all_records
    return list(get_all_records().values())

@router.post("/records/{record_id}/verify")
async def verify_record(record_id: str, request: VerificationRequest):
    record = get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    updates = {
        "verification_status": request.status,
        "reviewer_notes": request.reviewer_notes
    }

    if request.edited_action_plan and request.status == VerificationStatus.EDITED:
        updates["action_plan"] = request.edited_action_plan

    update_record(record_id, updates)
    return {"message": f"Record {request.status} successfully", "record_id": record_id}