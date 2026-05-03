from fastapi import APIRouter, Query
from db.database import get_verified_records
from typing import Optional

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard")
async def get_dashboard(department: Optional[str] = Query(None)):
    records = get_verified_records()

    if department:
        records = [
            r for r in records
            if department.lower() in r.get("action_plan", {})
            .get("responsible_department", "").lower()
        ]

    # Summary stats
    total = len(records)
    high_priority = sum(1 for r in records if r.get("action_plan", {}).get("priority") == "high")
    compliance = sum(1 for r in records if r.get("action_plan", {}).get("action_type") == "compliance")
    appeal = sum(1 for r in records if r.get("action_plan", {}).get("action_type") == "appeal")

    return {
        "summary": {
            "total_cases": total,
            "high_priority": high_priority,
            "compliance_required": compliance,
            "appeal_consideration": appeal
        },
        "records": records
    }