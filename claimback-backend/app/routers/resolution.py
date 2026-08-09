from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.orchestrator import AIOrchestrator
from app.core.database import get_db
from app.core.dependencies import get_claim_for_user, get_current_user
from app.models.user import User
from app.schemas.resolution import ResolutionResponse, ResolutionStepRead
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/api/v1/claims", tags=["resolution"])


@router.get("/{claim_id}/resolution", response_model=ResolutionResponse)
async def get_resolution_steps(
    claim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResolutionResponse:
    claim = await get_claim_for_user(claim_id, db, current_user)
    evidence = await EvidenceService.list_evidence_for_claim(db, claim_id, current_user.id)
    orchestrator = AIOrchestrator()
    steps = await orchestrator.resolution_agent.plan(claim.__dict__, {"existing_evidence": [e.filename for e in evidence]}, {})
    return ResolutionResponse(
        claim_id=claim.id,
        message="Resolution path generated",
        steps=[ResolutionStepRead.model_validate(item) for item in steps],
    )
