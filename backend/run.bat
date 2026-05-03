@echo off
echo ==============================================
echo NyayaSetuAI Backend Setup ^& Run Script
echo ==============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in your PATH!
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Ensure virtual environment exists
IF NOT EXIST "venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

:: Install dependencies
echo [INFO] Installing required dependencies...
pip install -r requirements.txt

:: Check if Tesseract OCR is installed (required for scanning PDFs)
IF NOT EXIST "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo.
    echo [WARNING] Tesseract OCR not found in "C:\Program Files\Tesseract-OCR"
    echo You will NOT be able to extract text from scanned PDFs.
    echo Please install Tesseract OCR for full functionality.
    echo.
)

:: Check for .env file
IF NOT EXIST ".env" (
    echo [WARNING] .env file not found! 
    echo Please create a .env file with your GROQ_API_KEY.
)

:: Run the server
echo.
echo [INFO] Starting the FastAPI server...
echo ----------------------------------------------
python -m uvicorn main:app --reload --port 8000
