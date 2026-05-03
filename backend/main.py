from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, verification, dashboard

app = FastAPI(
    title="NyayaSetuAI API",
    description="AI-powered court judgment processing system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(verification.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "NyayaSetuAI backend running", "docs": "/docs"}