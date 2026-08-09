from __future__ import annotations

from typing import Any, Dict, List, Optional
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


class ProtectionFinding(BaseModel):
    category: str = Field(description="One of: coverage, deadline, exclusion, documentation, fee, obligation, risk, eligibility")
    title: str
    description: str
    severity: str = Field(description="One of: low, medium, high, critical")
    source_reference: str = Field(default="Not explicitly identified", description="e.g. 'Page 1, Section 3' or 'Not explicitly identified'")


class ProtectionAction(BaseModel):
    title: str
    description: str
    priority: str = Field(description="One of: low, medium, high, critical")


class ProtectionAnalysisResult(BaseModel):
    protection_score: int = Field(ge=0, le=100)
    summary: str = Field(default="", description="Concise analysis overview")
    key_benefits: List[str] = Field(default_factory=list)
    coverage_entitlements: List[str] = Field(default_factory=list)
    conditions_for_entitlement: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    fees_and_penalties: List[str] = Field(default_factory=list)
    important_deadlines: List[str] = Field(default_factory=list)
    user_obligations: List[str] = Field(default_factory=list)
    required_documentation: List[str] = Field(default_factory=list)
    missing_or_weak_evidence: List[str] = Field(default_factory=list)
    potential_risks: List[str] = Field(default_factory=list)
    precautions: List[str] = Field(default_factory=list)
    immediate_actions: List[str] = Field(default_factory=list)
    questions_to_clarify: List[str] = Field(default_factory=list)
    potential_recovery_amount: Optional[float] = Field(default=None, description="Extracted numerical amount if explicitly stated in text")
    potential_recovery_currency: Optional[str] = Field(default=None, description="Currency string e.g. INR, USD if explicitly stated in text")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    findings: List[ProtectionFinding] = Field(default_factory=list)
    actions: List[ProtectionAction] = Field(default_factory=list)
