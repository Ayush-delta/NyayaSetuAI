import os
import shutil
from sqlalchemy.orm import Session
from db.postgres import _get_session_factory, JudgmentRecordDB

def clear_database():
    print("🧹 Starting Database Cleanup...")
    
    # 1. Clear PostgreSQL Table
    print("1️⃣ Clearing PostgreSQL 'judgment_records' table...")
    try:
        SessionLocal = _get_session_factory()
        db: Session = SessionLocal()
        
        count = db.query(JudgmentRecordDB).count()
        db.query(JudgmentRecordDB).delete()
        db.commit()
        db.close()
        print(f"✅ Deleted {count} records from PostgreSQL database.")
    except Exception as e:
        print(f"❌ Error clearing PostgreSQL: {e}")

    # 2. Clear ChromaDB Vector Data (Local)
    print("\n2️⃣ Clearing local ChromaDB Vector Data...")
    chroma_dir = "chroma_data"
    if os.path.exists(chroma_dir):
        try:
            shutil.rmtree(chroma_dir)
            print("✅ Deleted ChromaDB vector data folder.")
        except Exception as e:
            print(f"❌ Error deleting ChromaDB data: {e}")
    else:
        print("✅ No ChromaDB data folder found to delete.")

    print("\n✨ Database cleared successfully!")

if __name__ == "__main__":
    clear_database()
