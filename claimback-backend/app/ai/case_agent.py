from __future__ import annotations

from typing import Any

from app.ai.models import FactExtraction


class CaseAnalystAgent:
    async def analyze(self, claim_data: dict[str, Any]) -> FactExtraction:
        return FactExtraction(
            key_facts=[claim_data.get("title", "Claim summary")],
            timeline=["Incident date recorded."],
            parties=["Customer", "Company"],
            disputed_points=["Policy interpretation may need review."],
        )
