from __future__ import annotations

from typing import Any

from app.ai.models import EvidenceAssessment


class EvidenceAgent:
    async def assess(self, claim_data: dict[str, Any], evidence_items: list[dict[str, Any]]) -> EvidenceAssessment:
        existing = [item.get("filename", "evidence") for item in evidence_items]
        return EvidenceAssessment(
            existing_evidence=existing,
            missing_evidence=["Payment receipt", "Incident timeline screenshot", "Company response"],
            mapped_claim_facts={"claim_summary": existing or ["No upload yet"]},
        )
