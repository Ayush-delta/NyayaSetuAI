import os
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

_engine = None
_SessionLocal = None

def _get_engine():
    """Lazy-initialize engine so missing DATABASE_URL doesn't crash startup."""
    global _engine
    if _engine is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not set in .env")
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,       # Test connection before using from pool
            connect_args={"connect_timeout": 5}  # Fail fast, don't hang
        )
    return _engine

def _get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal

Base = declarative_base()

# ─── Database Models ───────────────────────────────────────────────────────

class JudgmentRecordDB(Base):
    __tablename__ = "judgment_records"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    
    # Storage
    storage_path = Column(String, nullable=True)
    signed_url = Column(String, nullable=True)
    file_hash = Column(String, nullable=True, unique=True)
    file_size = Column(String, nullable=True)
    
    # Extracted data (stored as JSON)
    extracted_data = Column(JSON, nullable=True)
    action_plan = Column(JSON, nullable=True)
    confidence_scores = Column(JSON, nullable=True)
    compliance_tracking = Column(JSON, nullable=True)
    
    # Verification
    verification_status = Column(String, default="pending")
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    # AI Summary
    case_summary = Column(Text, nullable=True)
    
    # Source highlights
    source_highlights = Column(JSON, nullable=True)
    
    # Metadata
    is_scanned = Column(Boolean, default=False)
    total_pages = Column(String, nullable=True)
    processing_time = Column(Float, nullable=True)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Vector DB reference
    vector_namespace = Column(String, nullable=True)

def init_db():
    """Create all tables. Logs a warning if DB is unreachable instead of crashing."""
    try:
        Base.metadata.create_all(bind=_get_engine())
        print("[OK] PostgreSQL tables ready")
    except Exception as e:
        print(f"[WARN] PostgreSQL unavailable at startup: {e}")
        print("   Server will still start. DB calls will fail until connection is restored.")

def get_db():
    """Dependency for getting DB session."""
    db = _get_session_factory()()
    try:
        yield db
    finally:
        db.close()

# ─── CRUD Operations ───────────────────────────────────────────────────────

def save_record_pg(record_data: dict):
    db = _get_session_factory()()
    try:
        db_record = JudgmentRecordDB(**record_data)
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    finally:
        db.close()

def get_record_pg(record_id: str) -> dict:
    db = _get_session_factory()()
    try:
        record = db.query(JudgmentRecordDB).filter(
            JudgmentRecordDB.id == record_id
        ).first()
        if not record:
            return None
        return {c.name: getattr(record, c.name) 
                for c in record.__table__.columns}
    finally:
        db.close()

def get_record_by_hash(file_hash: str):
    db = _get_session_factory()()
    try:
        return db.query(JudgmentRecordDB).filter(
            JudgmentRecordDB.file_hash == file_hash
        ).first()
    finally:
        db.close()

def get_all_records_pg() -> list:
    db = _get_session_factory()()
    try:
        records = db.query(JudgmentRecordDB).order_by(
            JudgmentRecordDB.upload_timestamp.desc()
        ).all()
        return [{c.name: getattr(r, c.name) 
                 for c in r.__table__.columns} for r in records]
    finally:
        db.close()

def update_record_pg(record_id: str, updates: dict) -> bool:
    db = _get_session_factory()()
    try:
        record = db.query(JudgmentRecordDB).filter(
            JudgmentRecordDB.id == record_id
        ).first()
        if not record:
            return False
        for key, value in updates.items():
            setattr(record, key, value)
        db.commit()
        return True
    finally:
        db.close()

def get_verified_records_pg(department: str = None) -> list:
    db = _get_session_factory()()
    try:
        query = db.query(JudgmentRecordDB).filter(
            JudgmentRecordDB.verification_status.in_(["approved", "edited"])
        )
        records = query.order_by(
            JudgmentRecordDB.upload_timestamp.desc()
        ).all()
        result = [{c.name: getattr(r, c.name) 
                   for c in r.__table__.columns} for r in records]
        
        # Filter by department if provided
        if department:
            result = [
                r for r in result
                if r.get("action_plan") and 
                department.lower() in 
                r["action_plan"].get("responsible_department", "").lower()
            ]
        return result
    finally:
        db.close()