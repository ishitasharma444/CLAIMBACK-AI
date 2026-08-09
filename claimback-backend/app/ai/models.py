from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class FactExtraction(BaseModel):
    key_facts: List[str] = Field(default_factory=list)
    timeline: List[str] = Field(default_factory=list)
    parties: List[str] = Field(default_factory=list)
    disputed_points: List[str] = Field(default_factory=list)


class EvidenceAssessment(BaseModel):
    existing_evidence: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)
    mapped_claim_facts: Dict[str, List[str]] = Field(default_factory=dict)


class AdversarialWeakness(BaseModel):
    weakness_summary: str
    risk_level: str
    recommended_defense: List[str] = Field(default_factory=list)


class ResolutionStepOutput(BaseModel):
    step_number: int
    title: str
    description: str
    destination_name: str | None = None
    destination_url: str | None = None
    status: str = "pending"
    expected_time: str | None = None


class ClaimLetterDraft(BaseModel):
    subject: str
    body: str
    tone: str = "professional"


class AnalysisResult(BaseModel):
    claim_strength: int = Field(ge=0, le=100)
    evidence_completeness: int = Field(ge=0, le=100)
    policy_match: int = Field(ge=0, le=100)
    factual_consistency: int = Field(ge=0, le=100)
    rejection_risk: int = Field(ge=0, le=100)
    findings_json: Dict[str, Any] = Field(default_factory=dict)


class ProtectionAnalysisResult(BaseModel):
    protection_score: int = Field(ge=0, le=100)
    key_benefits: List[str] = Field(default_factory=list)
    coverage_entitlements: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    fees_and_penalties: List[str] = Field(default_factory=list)
    important_deadlines: List[str] = Field(default_factory=list)
    user_obligations: List[str] = Field(default_factory=list)
    required_documentation: List[str] = Field(default_factory=list)
    potential_risks: List[str] = Field(default_factory=list)
    precautions: List[str] = Field(default_factory=list)
    immediate_actions: List[str] = Field(default_factory=list)
    questions_to_clarify: List[str] = Field(default_factory=list)
    findings: List[dict[str, Any]] = Field(default_factory=list)
    actions: List[dict[str, Any]] = Field(default_factory=list)
