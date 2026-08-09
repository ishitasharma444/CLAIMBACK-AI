from __future__ import annotations

import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_document_for_user
from app.models.user import User
from app.schemas.protection import DocumentAnalysisResponse, DocumentAnalysisRead, DocumentRead
from app.services.file_service import save_upload, validate_upload
from app.services.protection_service import ProtectionService

router = APIRouter(prefix="/api/v1/protection", tags=["protection"])


@router.post("/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_protection_document(
    title: str = Form(..., min_length=2, max_length=255),
    document_type: str = Form(..., min_length=2, max_length=120),
    provider_name: str | None = Form(default=None, max_length=255),
    description: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentRead:
    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds allowed size")

    validate_upload(file)
    file_path = save_upload(__import__("io").BytesIO(file_bytes), file.filename or "document")
    document = await ProtectionService.create_document(
        db,
        current_user.id,
        title=title,
        document_type=document_type,
        original_filename=os.path.basename(file_path),
        file_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        provider_name=provider_name,
        description=description,
    )
    return DocumentRead.model_validate(document)


@router.get("/documents", response_model=list[DocumentRead])
async def list_protection_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentRead]:
    documents = await ProtectionService.list_documents(db, current_user.id)
    return [DocumentRead.model_validate(item) for item in documents]


@router.post("/documents/{document_id}/analyze", response_model=DocumentAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_protection_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentAnalysisResponse:
    document = await get_document_for_user(document_id, db, current_user)
    analysis = await ProtectionService.analyze_document(db, document)
    return DocumentAnalysisResponse(message="Protection analysis completed", analysis=DocumentAnalysisRead.model_validate(analysis))


@router.get("/documents/{document_id}/analysis", response_model=list[DocumentAnalysisRead])
async def list_document_analyses(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentAnalysisRead]:
    await get_document_for_user(document_id, db, current_user)
    analyses = await ProtectionService.list_analyses_for_document(db, document_id, current_user.id)
    return [DocumentAnalysisRead.model_validate(item) for item in analyses]


@router.get("/analysis/{document_analysis_id}", response_model=DocumentAnalysisRead)
async def get_document_analysis(
    document_analysis_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentAnalysisRead:
    analysis = await ProtectionService.get_analysis(db, document_analysis_id, current_user.id)
    return DocumentAnalysisRead.model_validate(analysis)
