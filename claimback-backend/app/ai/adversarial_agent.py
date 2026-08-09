from __future__ import annotations

from typing import Any

from app.ai.models import AdversarialWeakness, EvidenceAssessment


class AdversarialAgent:
    async def criticize(self, claim_data: dict[str, Any], evidence: EvidenceAssessment) -> AdversarialWeakness:
        return AdversarialWeakness(
            weakness_summary="The claim may be weakened by incomplete documentation and missing timestamps.",
            risk_level="medium",
            recommended_defense=["Upload stronger proof", "Clarify chronology", "Include policy references"],
        )
