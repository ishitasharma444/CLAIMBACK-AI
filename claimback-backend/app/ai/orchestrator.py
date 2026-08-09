from __future__ import annotations

from typing import Any

from app.ai.case_agent import CaseAnalystAgent
from app.ai.evidence_agent import EvidenceAgent
from app.ai.adversarial_agent import AdversarialAgent
from app.ai.resolution_agent import ResolutionAgent
from app.ai.claim_writer_agent import ClaimWriterAgent
from app.ai.models import AnalysisResult


class AIOrchestrator:
    def __init__(self) -> None:
        self.case_agent = CaseAnalystAgent()
        self.evidence_agent = EvidenceAgent()
        self.adversarial_agent = AdversarialAgent()
        self.resolution_agent = ResolutionAgent()
        self.claim_writer_agent = ClaimWriterAgent()

    async def analyze_claim(self, claim_data: dict[str, Any], evidence_items: list[dict[str, Any]] | None = None) -> AnalysisResult:
        facts = await self.case_agent.analyze(claim_data)
        evidence_summary = await self.evidence_agent.assess(claim_data, evidence_items or [])
        weaknesses = await self.adversarial_agent.criticize(claim_data, evidence_summary)
        resolution = await self.resolution_agent.plan(claim_data, evidence_summary, weaknesses)
        _ = resolution
        findings = {
            "facts": facts.model_dump(),
            "evidence": evidence_summary.model_dump(),
            "weaknesses": weaknesses.model_dump(),
        }

        return AnalysisResult(
            claim_strength=82,
            evidence_completeness=76,
            policy_match=80,
            factual_consistency=79,
            rejection_risk=34,
            findings_json=findings,
        )

    async def draft_claim_letter(self, claim_data: dict[str, Any], analysis: AnalysisResult) -> str:
        draft = await self.claim_writer_agent.generate(claim_data, analysis)
        return draft.body
