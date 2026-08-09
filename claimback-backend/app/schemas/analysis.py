from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, Field


class AnalysisRead(BaseModel):
    id: int
    claim_id: int
    claim_strength: int
    evidence_completeness: int
    policy_match: int
    factual_consistency: int
    rejection_risk: int
    findings_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisCreateResponse(BaseModel):
    message: str
    analysis: AnalysisRead
