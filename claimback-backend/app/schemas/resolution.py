from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ResolutionStepRead(BaseModel):
    id: int | None = None
    claim_id: int | None = None
    step_number: int
    title: str
    description: str
    destination_name: str | None = None
    destination_url: str | None = None
    status: str
    expected_time: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class ResolutionResponse(BaseModel):
    claim_id: int
    message: str
    steps: list[ResolutionStepRead] = Field(default_factory=list)
