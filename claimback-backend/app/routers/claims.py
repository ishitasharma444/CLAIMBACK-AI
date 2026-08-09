from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_claim_for_user, get_current_user
from app.models.claim import Claim
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimRead, ClaimUpdate
from app.services.claim_service import ClaimService

router = APIRouter(prefix="/api/v1/claims", tags=["claims"])


@router.post("", response_model=ClaimRead, status_code=status.HTTP_201_CREATED)
async def create_claim(
    payload: ClaimCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Claim:
    claim = await ClaimService.create_claim(
        db,
        current_user.id,
        payload.model_dump(exclude_unset=True),
    )
    return claim


@router.get("", response_model=list[ClaimRead])
async def list_claims(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Claim]:
    return await ClaimService.list_claims(db, current_user.id)


@router.get("/{claim_id}", response_model=ClaimRead)
async def get_claim(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Claim:
    return await ClaimService.get_claim(db, claim_id, current_user.id)


@router.patch("/{claim_id}", response_model=ClaimRead)
async def update_claim(
    claim_id: int,
    payload: ClaimUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Claim:
    claim = await ClaimService.get_claim(db, claim_id, current_user.id)
    return await ClaimService.update_claim(db, claim, payload.model_dump(exclude_unset=True))


@router.delete("/{claim_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_claim(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    claim = await ClaimService.get_claim(db, claim_id, current_user.id)
    await ClaimService.delete_claim(db, claim)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
