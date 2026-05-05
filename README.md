# NyayaSetuAI

NyayaSetuAI is a full-stack, AI-powered legal document intelligence system built for government departments. It automatically processes unstructured legal judgments (PDFs), extracts critical information, and generates structured, prioritized action plans for compliance and appeal analysis.

This repository contains both the **Next.js Frontend** and the **FastAPI Backend**.

---

## 🚀 Architecture & Data Flow

1. **Upload:** A user uploads a court judgment PDF via the Next.js frontend.
2. **Storage:** The FastAPI backend securely uploads the raw PDF to **Supabase Storage**.
3. **Extraction:** **PyMuPDF** (and **Tesseract OCR** for scanned documents) extracts the raw text.
4. **Vectorization (RAG):** The text is chunked and embedded using **sentence-transformers**, then stored in a **FAISS** vector database to isolate the most relevant legal context.
5. **AI Processing:** The contextualized text is sent to the **Groq API (LLaMA 3.1)** to:
   - Extract case details, dates, and parties.
   - Generate a structured "Action Plan" indicating compliance requirements or appeal risks.
   - Assign a self-assessed Confidence Score (0.0 to 1.0) to every extracted field.
6. **Persistence:** The structured JSON is validated via **Pydantic** and stored in a **PostgreSQL** database via SQLAlchemy.
7. **Human-in-the-Loop:** The data is returned to the frontend where a human reviewer verifies the AI's extraction against the raw source text snippets. 

---

## 💻 Tech Stack

### Frontend (`/frontend`)
The frontend is a modern, responsive web application focused on Human-in-the-Loop (HITL) verification.
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **State Management:** React Hooks & Context API

### Backend (`/backend`)
The backend is a high-performance, asynchronous REST API focused on heavy AI processing and document intelligence.
*   **Framework:** FastAPI (Python)
*   **Database:** PostgreSQL (hosted on Supabase)
*   **ORM:** SQLAlchemy
*   **Cloud Storage:** Supabase Storage (for PDF persistence)
*   **LLM Provider:** Groq (running `llama-3.1-8b-instant`)
*   **Vector DB (RAG):** FAISS
*   **Embeddings:** SentenceTransformers (`all-MiniLM-L6-v2`)
*   **PDF Parsing:** PyMuPDF (`fitz`) & pytesseract
*   **Validation:** Pydantic

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL Database
- Tesseract OCR installed locally
- API Keys for Groq and Supabase

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
```

**Create a `.env` file in the `backend/` folder:**
```env
GROQ_API_KEY=your_groq_key
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
DATABASE_URL=postgresql://user:password@aws-0-pooler.supabase.com:5432/postgres
```

**Start the Backend Server:**
```bash
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
```

**Start the Frontend Development Server:**
```bash
npm run dev
```

Navigate to `http://localhost:3000` to use the application.

---

## 📋 Core Features

- **Duplicate Detection:** Prevents re-processing of the same PDF via MD5 hashing.
- **Smart Chunking:** Bypasses LLM context-window limits by using a local FAISS vector database to only feed the most relevant paragraphs to the AI.
- **Confidence Scoring:** The AI self-evaluates its extraction accuracy, directing human reviewers to check low-confidence fields.
- **Action Plans:** Automatically determines if a judgment requires immediate compliance, or if it presents grounds for an appeal before a limitation period expires.
- **Human-in-the-Loop:** Requires manual approval of AI-extracted data before it enters the central dashboard for departmental view.
