import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

EXTRACTION_PROMPT = """You are a legal document analyst for the Karnataka government.
Analyze this court judgment and extract the following. Respond ONLY in valid JSON.
Use null for string fields not found, but use [] for empty lists.

{{
  "case_details": {{
    "case_number": "...",
    "court_name": "...",
    "date_of_order": "DD-MM-YYYY or null",
    "petitioner": "...",
    "respondent": "...",
    "judge_name": "..."
  }},
  "judgment_metadata": {{
    "judgment_type": "Writ Petition / Civil Revision / Criminal Appeal / etc",
    "case_status": "Ongoing or Final Judgment",
    "next_hearing_date": "DD-MM-YYYY or null",
    "subject_matter": "Service Matter / Land / Contempt / etc",
    "relief_granted": "what the court decided",
    "is_interim_order": true or false,
    "has_contempt_risk": true or false,
    "related_case_numbers": []
  }},
  "key_directions": ["direction 1", "direction 2"],
  "deadlines": ["deadline with timeframe"],
  "parties_involved": ["party 1", "party 2"],
  "raw_text_snippet": "most relevant 2-3 sentences"
}}

JUDGMENT TEXT:
{text}
"""

ACTION_PLAN_PROMPT = """You are a legal advisor for Karnataka government departments.
Generate a structured action plan from this judgment. Respond ONLY in valid JSON.
Use null for string fields not found, but use [] for empty lists.

{{
  "action_type": "compliance" | "appeal" | "both" | "unclear",
  "action_required": "one sentence summary",
  "responsible_department": "specific department",
  "secondary_departments": ["other dept if needed"],
  "priority": "urgent" | "high" | "medium" | "low",
  "deadline": "specific date or timeframe or null",
  "limitation_period": "appeal window or null",
  "appeal_analysis": {{
    "is_appeal_recommended": true or false,
    "limitation_days": 90,
    "limitation_expiry_date": "DD-MM-YYYY",
    "appeal_court": "Division Bench / Supreme Court",
    "grounds_for_appeal": ["ground 1", "ground 2"],
    "risk_if_not_appealed": "consequence if no appeal filed"
  }},
  "steps": ["step 1", "step 2", "step 3"],
  "reasoning": "why this action plan"
}}

Priority rules:
- URGENT: contempt risk OR deadline within 7 days
- HIGH: deadline within 30 days OR fundamental rights
- MEDIUM: deadline 30-90 days OR monetary directions
- LOW: over 90 days OR policy directions

EXTRACTED DATA:
{extracted_data}
"""

CONFIDENCE_PROMPT = """You extracted data from a legal judgment. 
Rate your confidence for each field from 0.0 to 1.0.
Respond ONLY with valid JSON.

{{
  "case_details": 0.0-1.0,
  "judgment_metadata": 0.0-1.0,
  "key_directions": 0.0-1.0,
  "deadlines": 0.0-1.0,
  "action_type": 0.0-1.0,
  "responsible_department": 0.0-1.0
}}

Scoring guide:
- 1.0: Explicitly stated in text, no ambiguity
- 0.7-0.9: Clearly implied, high certainty
- 0.4-0.6: Inferred from context, some uncertainty
- 0.1-0.3: Guessed, very uncertain
- 0.0: Not found, defaulted

EXTRACTED DATA:
{extracted_data}

ACTION PLAN:
{action_plan}
"""

def call_llm(prompt: str) -> dict:
    """Call Groq LLM and parse JSON response."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=2000
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())

def extract_information(text: str) -> dict:
    """Extract structured information from judgment text."""
    # Use first 6000 chars to stay within token limits
    truncated = text[:6000]
    prompt = EXTRACTION_PROMPT.format(text=truncated)
    return call_llm(prompt)

def generate_action_plan(extracted_data: dict) -> dict:
    """Generate action plan from extracted data."""
    prompt = ACTION_PLAN_PROMPT.format(
        extracted_data=json.dumps(extracted_data, indent=2)
    )
    return call_llm(prompt)

def compute_confidence(extracted_data: dict, action_plan: dict) -> dict:
    """Get LLM self-assessed confidence scores."""
    prompt = CONFIDENCE_PROMPT.format(
        extracted_data=json.dumps(extracted_data, indent=2),
        action_plan=json.dumps(action_plan, indent=2)
    )
    scores = call_llm(prompt)
    # Compute overall as weighted average
    weights = {
        "case_details": 0.2,
        "judgment_metadata": 0.1,
        "key_directions": 0.2,
        "deadlines": 0.2,
        "action_type": 0.2,
        "responsible_department": 0.1
    }
    overall = sum(scores.get(k, 0) * w for k, w in weights.items())
    scores["overall"] = round(overall, 2)
    return scores