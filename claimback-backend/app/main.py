from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db

# Import models so SQLAlchemy registers them before create_all()
from app.models.analysis import Analysis
from app.models.claim import Claim
from app.models.document import Document
from app.models.evidence import Evidence
from app.models.protection import (
    DocumentAnalysis,
    ProtectionAction,
    ProtectionFinding,
)
from app.models.resolution import ResolutionStep
from app.models.user import User

from app.routers.analysis import router as analysis_router
from app.routers.auth import router as auth_router
from app.routers.claims import router as claims_router
from app.routers.evidence import router as evidence_router
from app.routers.protection import router as protection_router
from app.routers.resolution import router as resolution_router


app = FastAPI(
    title="ClaimBack API",
    version="1.0.0",
    description=(
        "AI-powered consumer protection and claim resolution platform."
    ),
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    # Keep production responses generic.
    # Detailed errors should be logged rather than exposed.
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred."
        },
    )


@app.get(
    "/health",
    tags=["System"],
)
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(claims_router)
app.include_router(evidence_router)
app.include_router(analysis_router)
app.include_router(protection_router)
app.include_router(resolution_router)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )