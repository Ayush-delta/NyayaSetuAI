# NyayaSetuAI Backend

This is the backend service for NyayaSetuAI, built with FastAPI. It handles PDF uploads, extracts text (including OCR for scanned documents), and uses Groq's LLaMa models to extract structured insights and action plans. 

**New Features:**
- **Supabase PostgreSQL:** Stores judgment records, compliance updates, and verification status.
- **Supabase Storage:** Securely stores uploaded PDF files and provides signed URLs.
- **Local FAISS Vector Store:** Uses HuggingFace `SentenceTransformers` to chunk and semantically search documents for precise Context-Aware AI Extraction (RAG).

## 🚀 Quick Start (Windows)

The easiest way to run the backend on any Windows laptop is to double-click the **`run.bat`** file. 

The `run.bat` script will automatically:
1. Create a Python Virtual Environment (`venv`)
2. Install all required dependencies
3. Start the FastAPI server on `http://127.0.0.1:8000`

## 🛠️ Prerequisites

If you are setting this up manually or running it on MacOS/Linux, ensure you have the following installed:
1. **Python 3.9+**
2. **Tesseract OCR** (Required for processing scanned PDFs):
   - **Windows:** Download and install from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). Ensure it is installed to `C:\Program Files\Tesseract-OCR\tesseract.exe`.
   - **Mac:** `brew install tesseract`
   - **Linux (Ubuntu):** `sudo apt install tesseract-ocr`

## 🔑 Environment Variables

You must create a `.env` file in the root of the `backend` folder containing your API keys and database credentials:
```env
# Groq API (Required for AI Extraction)
GROQ_API_KEY="your_groq_api_key_here"

# Tesseract (Optional, Required on Windows for scanned PDFs)
TESSERACT_PATH="C:\Program Files\Tesseract-OCR\tesseract.exe"

# SUPABASE (Required for PDF Storage)
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_KEY="your_supabase_anon_or_service_key"

# PostgreSQL (Required for Database)
# IMPORTANT: Use the Supabase IPv4 "Connection Pooling" URI if your network doesn't support IPv6.
# Remember to replace [YOUR-PASSWORD] and URL-encode special characters (e.g. @ becomes %40)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

## 📦 Manual Installation (Mac/Linux/Windows)

If you prefer not to use `run.bat`, run the following commands in your terminal:

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Run the server
uvicorn main:app --reload --port 8000
```

## 📖 API Documentation

Once the server is running, you can access the interactive API documentation and test endpoints directly from your browser:
* **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 💾 Core Services & Data Pipeline

1. **PDF Processing Service:** Handles extraction of digital and scanned PDFs. Scanned PDFs are converted to high-resolution page images and passed to **Tesseract OCR** using the `pytesseract` library.
2. **Embeddings & Vector Store:** Chunks extracted text and converts chunks into 384-dimensional vector embeddings using the `all-MiniLM-L6-v2` SentenceTransformers model. These are stored locally using a **FAISS** vector database for rapid retrieval (RAG).
3. **AI Reasoning Service (Llama 3):** Takes search-retrieved legal chunks and queries Groq API's Llama 3 model to generate structured case metadata, identify departments, parse compliance instructions, detect deadlines, and output priority scores.

---

## 🎯 Evaluation Criteria Mapping

| Criteria | Backend Implementation |
|---|---|
| **Accuracy of extraction** | Hybrid rule-based regex parsing for judges & dates + Llama 3 prompt-engineering for unstructured pages |
| **Quality of action plan** | Dynamic prompts categorizing compliance duties, appeals risks, and deadlines |
| **Human-in-the-loop** | APIs allowing Admins to edit/update JSON structures and approve entries before they are finalized |
| **Database Integration** | PostgreSQL schema on Supabase tracking status (`Pending`, `Approved`, `Rejected`), metadata, and deadlines |

---

## 🌐 Live API & Demo Credentials

* **Live Demo Frontend:** [https://nyaya-setu-ai.vercel.app](https://nyaya-setu-ai.vercel.app)
* **Demo Accounts:**
  * **Admin:** Username: `admin` | Password: `admin123`
  * **Officer:** Username: `officer` | Password: `officer123`

