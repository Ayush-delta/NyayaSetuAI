# NyayaSetuAI

NyayaSetuAI is a full-stack, AI-powered legal document intelligence system built for government departments. It automatically processes unstructured legal judgments (PDFs), extracts critical information, and generates structured, prioritized action plans for compliance and appeal analysis.

This repository contains both the **Next.js Frontend** and the **FastAPI Backend**.

---

## 🚀 Architecture & Data Flow

1. **Upload:** A user (Admin) uploads a court judgment PDF via the Next.js frontend.
2. **Storage:** The FastAPI backend securely uploads the raw PDF to **Supabase Storage**.
3. **Extraction:** **PyMuPDF** (and **Tesseract OCR** for scanned documents) extracts the raw text. Rule-based regex logic runs a preliminary extraction for highly structured fields (like Judge names).
4. **Vectorization (RAG):** The text is chunked, embedded using **sentence-transformers**, and stored in **Supabase pgvector** to isolate the most relevant legal context.
5. **AI Processing:** The contextualized text is sent to the **Groq API (LLaMA 3.1)** to:
   - Extract case details, dates, and parties.
   - Generate a structured "Action Plan" indicating compliance requirements or appeal risks.
   - Assign a self-assessed Confidence Score (0.0 to 1.0) to every extracted field.
6. **Persistence:** The structured JSON is validated via **Pydantic** and stored in a **PostgreSQL** database (via SQLAlchemy).
7. **Human-in-the-Loop:** The data is returned to the frontend where an Admin verifies the AI's extraction against the raw source text snippets. Once approved, the document becomes visible to Officers on the Dashboard.

---

## 💻 Tech Stack

### Frontend (`/frontend`)
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** React Hooks & Context API
*   **Authentication:** JWT-based Role Access Control

### Backend (`/backend`)
*   **Framework:** FastAPI (Python)
*   **Database:** PostgreSQL (hosted on Supabase)
*   **Vector DB:** Supabase pgvector
*   **Cloud Storage:** Supabase Storage
*   **LLM Provider:** Groq (`llama-3.1-8b-instant`)
*   **Embeddings:** SentenceTransformers (`all-MiniLM-L6-v2`)
*   **PDF Parsing:** PyMuPDF (`fitz`) & pytesseract

---

## ⚙️ Setup & Installation (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
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

JWT_SECRET_KEY=super_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
OFFICER_USERNAME=officer
OFFICER_PASSWORD=officer123
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
Navigate to `http://localhost:3000`.

---

## 🌍 Deployment Process Steps

### 1. Database Preparation (Supabase)
1. Ensure your PostgreSQL database has the `pgvector` extension enabled.
2. Create the necessary storage buckets in Supabase for holding PDFs.

### 2. Backend Deployment (Render / Railway)
1. Create a new Web Service on Render or Railway, connected to your GitHub repository.
2. Set the Root Directory to `backend`.
3. Set the Build Command: `pip install -r requirements.txt`
   *(Note: You may need to use a Dockerfile if Tesseract OCR needs to be installed on the host system).*
4. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all the Environment Variables from your local `.env` file into the deployment dashboard.
6. Once deployed, note the live API URL (e.g., `https://nyayasetu-api.onrender.com`).

### 3. Frontend Deployment (Vercel)
1. Create a new project on Vercel and import your repository.
2. Set the Root Directory to `frontend`.
3. Override the default Build Command if necessary (Next.js defaults are usually fine).
4. Under Environment Variables, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your live backend URL (e.g., `https://nyayasetu-api.onrender.com/api`).
   *(Note: Ensure your frontend `services/auth.ts` and other service files use this environment variable instead of `localhost` in production)*.
5. Click **Deploy**.

---

## 📋 Core Features

- **Role-Based Access Control:** Strict JWT separation between `Admin` (Upload, Review, Verify) and `Officer` (View-only Dashboard). Signups automatically default to the Officer role.
- **Duplicate Detection:** Prevents database constraint violations by hashing PDFs before processing.
- **Smart Chunking & pgvector:** Bypasses LLM context-window limits by embedding text and retrieving the exact relevant chunks via Supabase pgvector.
- **Hybrid Extraction Pipeline:** Merges deterministic RegEx rules with LLM intelligence to guarantee accurate Judge Names and Dates.
- **Confidence Scoring & HITL:** The AI self-evaluates its extraction accuracy, directing human reviewers (Admins) to manually verify low-confidence fields before saving to the production dashboard.
