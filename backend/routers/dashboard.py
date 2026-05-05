from fastapi import APIRouter, Query
from db.postgres import get_verified_records_pg
from typing import Optional

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard")
async def get_dashboard(department: Optional[str] = Query(None)):
    records = get_verified_records_pg(department)

    total = len(records)
    high_priority = sum(
        1 for r in records 
        if r.get("action_plan", {}) and 
        r["action_plan"].get("priority") in ["high", "urgent"]
    )
    compliance = sum(
        1 for r in records 
        if r.get("action_plan", {}) and 
        r["action_plan"].get("action_type") == "compliance"
    )
    appeal = sum(
        1 for r in records 
        if r.get("action_plan", {}) and 
        r["action_plan"].get("action_type") == "appeal"
    )

    return {
        "summary": {
            "total_cases": total,
            "high_priority": high_priority,
            "compliance_required": compliance,
            "appeal_consideration": appeal
        },
        "records": records
    }