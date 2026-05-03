from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
import hashlib

class ActionType(str, Enum):
    COMPLIANCE = "compliance"
    APPEAL = "appeal"
    BOTH = "both"
    UNCLEAR = "unclear"

class Priority(str, Enum):
    URGENT = "urgent"      # Added: contempt risk, < 7 days
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"

class ComplianceStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    ESCALATED = "escalated"

# Section 1: Case Details

class CaseDetails(BaseModel):
    case_number: Optional[str] = None
    court_name: Optional[str] = None
    date_of_order: Optional[str] = None
    petitioner: Optional[str] = None
    respondent: Optional[str] = None
    judge_name: Optional[str] = None

class JudgmentMetadata(BaseModel):
    judgment_type: Optional[str] = None
    # e.g., Writ Petition, Civil Revision, Criminal Appeal
    subject_matter: Optional[str] = None
    # e.g., Service Matter, Land Acquisition, Contempt
    relief_granted: Optional[str] = None
    # e.g., Stay granted, Petition dismissed
    is_interim_order: bool = False
    has_contempt_risk: bool = False
    related_case_numbers: Optional[List[str]] = []

class ExtractedData(BaseModel):
    case_details: CaseDetails
    judgment_metadata: JudgmentMetadata = JudgmentMetadata()
    key_directions: Optional[List[str]] = []
    deadlines: Optional[List[str]] = []
    parties_involved: Optional[List[str]] = []
    raw_text_snippet: str = ""

# Section 2: Action Plan 

class AppealAnalysis(BaseModel):
    is_appeal_recommended: bool = False
    limitation_days: Optional[int] = None
    limitation_expiry_date: Optional[str] = None
    appeal_court: Optional[str] = None
    grounds_for_appeal: Optional[List[str]] = []
    risk_if_not_appealed: Optional[str] = None

class ActionPlan(BaseModel):
    action_type: ActionType
    action_required: str
    responsible_department: str
    secondary_departments: Optional[List[str]] = []
    priority: Priority
    deadline: Optional[str] = None
    limitation_period: Optional[str] = None
    appeal_analysis: AppealAnalysis = AppealAnalysis()
    steps: Optional[List[str]] = []
    reasoning: str

# Section 3: Confidence Scores 

class ConfidenceScores(BaseModel):
    case_details: float = 0.0
    key_directions: float = 0.0
    deadlines: float = 0.0
    action_type: float = 0.0
    responsible_department: float = 0.0
    judgment_metadata: float = 0.0
    overall: float = 0.0

# Section 4: Compliance Tracking 

class ComplianceUpdate(BaseModel):
    timestamp: str
    note: str
    updated_by: Optional[str] = None

class ComplianceTracking(BaseModel):
    compliance_status: ComplianceStatus = ComplianceStatus.NOT_STARTED
    assigned_officer: Optional[str] = None
    assigned_date: Optional[str] = None
    due_date: Optional[str] = None
    completion_date: Optional[str] = None
    escalated: bool = False
    updates: List[ComplianceUpdate] = []

# Section 5: Document Provenance 

class DocumentProvenance(BaseModel):
    upload_timestamp: str = Field(
        default_factory=lambda: datetime.now().isoformat()
    )
    ccms_case_id: Optional[str] = None
    pdf_hash: Optional[str] = None
    total_pages: int = 0
    is_scanned: bool = False
    ocr_confidence: Optional[float] = None
    processing_time_seconds: Optional[float] = None

# Main Record 

class JudgmentRecord(BaseModel):
    id: str
    filename: str
    extracted_data: ExtractedData
    action_plan: ActionPlan
    confidence_scores: ConfidenceScores
    compliance_tracking: ComplianceTracking = ComplianceTracking()
    provenance: DocumentProvenance = DocumentProvenance()
    verification_status: VerificationStatus = VerificationStatus.PENDING
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    source_highlights: Optional[List[str]] = []