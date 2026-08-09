from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.orchestrator import AIOrchestrator
from app.core.database import get_db
from app.core.dependencies import get_claim_for_user, get_current_user
from app.models.user import User
from app.schemas.analysis import AnalysisCreateResponse, AnalysisRead
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/api/v1/claims", tags=["analysis"])


@router.post("/{claim_id}/analyze", response_model=AnalysisCreateResponse, status_code=status.HTTP_201_CREATED)
async def analyze_claim(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisCreateResponse:
    claim = await get_claim_for_user(claim_id, db, current_user)
    evidence = await EvidenceService.list_evidence_for_claim(db, claim_id, current_user.id)
    orchestrator = AIOrchestrator()
    analysis = await orchestrator.analyze_claim(claim.__dict__, [item.__dict__ for item in evidence])

    from app.models.analysis import Analysis

    analysis_record = Analysis(
        claim_id=claim.id,
        claim_strength=analysis.claim_strength,
        evidence_completeness=analysis.evidence_completeness,
        policy_match=analysis.policy_match,
        factual_consistency=analysis.factual_consistency,
        rejection_risk=analysis.rejection_risk,
        findings_json=analysis.findings_json,
    )
    db.add(analysis_record)
    await db.commit()
    await db.refresh(analysis_record)

    return AnalysisCreateResponse(message="Claim analysis completed", analysis=AnalysisRead.model_validate(analysis_record))


@router.get("/{claim_id}/analysis", response_model=list[AnalysisRead])
async def get_analysis_history(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AnalysisRead]:
    await get_claim_for_user(claim_id, db, current_user)
    from app.models.analysis import Analysis

    result = await db.execute(
        __import__("sqlalchemy").select(Analysis).where(Analysis.claim_id == claim_id).order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().all()
    return [AnalysisRead.model_validate(item) for item in analyses]
