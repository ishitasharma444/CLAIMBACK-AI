from __future__ import annotations

from typing import Any

from app.ai.models import AdversarialWeakness, EvidenceAssessment, ResolutionStepOutput


class ResolutionAgent:
    async def plan(
        self,
        claim_data: dict[str, Any],
        evidence: EvidenceAssessment,
        weaknesses: AdversarialWeakness,
    ) -> list[ResolutionStepOutput]:
        return [
            ResolutionStepOutput(
                step_number=1,
                title="Gather missing evidence",
                description="Collect and organize the key supporting documents and timeline.",
                destination_name="Customer portal",
                destination_url="https://example.com",
                status="pending",
                expected_time="2-3 days",
            ),
            ResolutionStepOutput(
                step_number=2,
                title="Submit a formal response",
                description="Send a professional counter-response with supporting records.",
                destination_name="Claims team",
                destination_url="https://example.com",
                status="pending",
                expected_time="3-5 days",
            ),
        ]
