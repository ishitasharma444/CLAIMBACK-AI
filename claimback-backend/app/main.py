import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, claims, evidence, protection, resolution

# Ensure local upload directory exists
upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.app_name,
    description="ClaimBack API - Protection analysis & Claim management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(protection.router)
app.include_router(claims.router)
app.include_router(evidence.router)
app.include_router(resolution.router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    from app.core.database import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)