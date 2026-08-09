from __future__ import annotations

from typing import Any

from app.ai.models import AnalysisResult, ClaimLetterDraft


class ClaimWriterAgent:
    async def generate(self, claim_data: dict[str, Any], analysis: AnalysisResult) -> ClaimLetterDraft:
        return ClaimLetterDraft(
            subject=f"Claim regarding {claim_data.get('title', 'Matter')}",
            body=(
                "Dear Claims Team,\n\n"
                "I am writing to formally submit this claim and provide supporting evidence. "
                "The information below outlines the incident, the supporting documentation, and the requested resolution.\n\n"
                "Please review the evidence in support of this matter and respond in a timely manner.\n\n"
                "Sincerely,\n"
                "The Claimant"
            ),
            tone="professional",
        )
