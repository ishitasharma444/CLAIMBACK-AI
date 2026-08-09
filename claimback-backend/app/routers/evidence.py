from __future__ import annotations

import os

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_claim_for_user, get_current_user
from app.models.claim import Claim
from app.models.user import User
from app.schemas.evidence import EvidenceRead, EvidenceUploadResponse
from app.services.evidence_service import EvidenceService
from app.services.file_service import save_upload, validate_upload

router = APIRouter(prefix="/api/v1", tags=["evidence"])


@router.post("/claims/{claim_id}/evidence", response_model=EvidenceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    claim_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceUploadResponse:
    claim = await get_claim_for_user(claim_id, db, current_user)

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

    validate_upload(file)
    file_path = save_upload(__import__('io').BytesIO(file_bytes), file.filename or "evidence")
    evidence = await EvidenceService.create_evidence(
        db,
        claim,
        current_user.id,
        filename=os.path.basename(file_path),
        file_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        evidence_type="document",
    )
    return EvidenceUploadResponse.model_validate(evidence)


@router.get("/claims/{claim_id}/evidence", response_model=list[EvidenceRead])
async def get_claim_evidence(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[EvidenceRead]:
    claim = await get_claim_for_user(claim_id, db, current_user)
    evidence_items = await EvidenceService.list_evidence_for_claim(db, claim_id, current_user.id)
    return [EvidenceRead.model_validate(item) for item in evidence_items]


@router.delete("/evidence/{evidence_id}", response_model=EvidenceRead)
async def delete_evidence(
    evidence_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceRead:
    evidence = await EvidenceService.delete_evidence(db, evidence_id, current_user.id)
    return EvidenceRead.model_validate(evidence)
