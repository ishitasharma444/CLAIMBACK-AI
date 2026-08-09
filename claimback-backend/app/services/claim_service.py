from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.claim import Claim


class ClaimService:
    @staticmethod
    async def list_claims(db: AsyncSession, user_id: int) -> list[Claim]:
        result = await db.execute(select(Claim).where(Claim.user_id == user_id).order_by(Claim.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def create_claim(db: AsyncSession, user_id: int, payload: dict[str, Any]) -> Claim:
        claim = Claim(user_id=user_id, **payload)
        db.add(claim)
        await db.commit()
        await db.refresh(claim)
        return claim

    @staticmethod
    async def get_claim(db: AsyncSession, claim_id: int, user_id: int) -> Claim:
        result = await db.execute(select(Claim).where(Claim.id == claim_id))
        claim = result.scalar_one_or_none()
        if claim is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        if claim.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this claim")
        return claim

    @staticmethod
    async def update_claim(db: AsyncSession, claim: Claim, payload: dict[str, Any]) -> Claim:
        for field, value in payload.items():
            if value is not None:
                setattr(claim, field, value)
        db.add(claim)
        await db.commit()
        await db.refresh(claim)
        return claim

    @staticmethod
    async def delete_claim(db: AsyncSession, claim: Claim) -> None:
        await db.delete(claim)
        await db.commit()
