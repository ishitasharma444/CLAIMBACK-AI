from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.claim import Claim
from app.models.evidence import Evidence


class EvidenceService:
    @staticmethod
    async def list_evidence_for_claim(db: AsyncSession, claim_id: int, user_id: int) -> list[Evidence]:
        result = await db.execute(
            select(Evidence).where(Evidence.claim_id == claim_id, Evidence.user_id == user_id).order_by(Evidence.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_evidence(
        db: AsyncSession,
        claim: Claim,
        user_id: int,
        filename: str,
        file_path: str,
        mime_type: str,
        file_size: int,
        evidence_type: str,
    ) -> Evidence:
        evidence = Evidence(
            claim_id=claim.id,
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            mime_type=mime_type,
            file_size=file_size,
            evidence_type=evidence_type,
            status="uploaded",
        )
        db.add(evidence)
        await db.commit()
        await db.refresh(evidence)
        return evidence

    @staticmethod
    async def delete_evidence(db: AsyncSession, evidence_id: int, user_id: int) -> Evidence:
        result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
        evidence = result.scalar_one_or_none()
        if evidence is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
        if evidence.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this evidence")
        await db.delete(evidence)
        await db.commit()
        return evidence
