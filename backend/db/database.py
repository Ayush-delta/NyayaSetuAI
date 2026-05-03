import json
import os
from typing import Dict, Optional

DB_FILE = "db/records.json"

def _load() -> Dict:
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def _save(data: Dict):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_record(record):
    data = _load()
    data[record.id] = record.model_dump()
    _save(data)

def get_record(record_id: str) -> Optional[Dict]:
    data = _load()
    return data.get(record_id)

def get_all_records() -> Dict:
    return _load()

def update_record(record_id: str, updates: Dict):
    data = _load()
    if record_id in data:
        data[record_id].update(updates)
        _save(data)
        return True
    return False

def get_verified_records() -> list:
    data = _load()
    return [
        r for r in data.values()
        if r.get("verification_status") in ["approved", "edited"]
    ]