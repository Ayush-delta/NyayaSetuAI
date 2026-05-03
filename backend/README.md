# NyayaSetuAI Backend

This is the backend service for NyayaSetuAI, built with FastAPI. It handles PDF uploads, extracts text (including OCR for scanned documents), and uses Groq's LLaMa models to extract structured insights and action plans.

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

You must create a `.env` file in the root of the `backend` folder containing your Groq API key:
```env
GROQ_API_KEY="your_groq_api_key_here"
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
