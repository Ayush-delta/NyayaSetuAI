from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, verification, dashboard, auth
from db.postgres import init_db

app = FastAPI(
    title="NyayaSetuAI API",
    description="AI-powered court judgment processing system",
    version="1.0.0"
)

@app.on_event("startup")
async def on_startup():
    print("🔥 Backend starting up...")
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://nyaya-setu-ai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(verification.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "NyayaSetuAI backend running", "status": "online"}