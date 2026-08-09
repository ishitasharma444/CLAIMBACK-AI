from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DocumentUploadRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    document_type: str = Field(..., min_length=2, max_length=120)
    provider_name: str | None = Field(default=None, max_length=255)
    description: str | None = None


class DocumentRead(BaseModel):
    id: int
    user_id: int
    title: str
    document_type: str
    provider_name: str | None = None
    description: str | None = None
    original_filename: str
    mime_type: str
    file_size: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProtectionFindingRead(BaseModel):
    id: int
    category: str
    title: str
    description: str
    severity: str
    source_reference: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProtectionActionRead(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentAnalysisRead(BaseModel):
    id: int
    document_id: int
    user_id: int
    protection_score: int
    document_type: str
    provider_name: str | None = None
    key_benefits: list[str] = Field(default_factory=list)
    coverage_entitlements: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    fees_and_penalties: list[str] = Field(default_factory=list)
    important_deadlines: list[str] = Field(default_factory=list)
    user_obligations: list[str] = Field(default_factory=list)
    required_documentation: list[str] = Field(default_factory=list)
    potential_risks: list[str] = Field(default_factory=list)
    precautions: list[str] = Field(default_factory=list)
    immediate_actions: list[str] = Field(default_factory=list)
    questions_to_clarify: list[str] = Field(default_factory=list)
    findings_json: dict[str, Any] = Field(default_factory=dict)
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentAnalysisResponse(BaseModel):
    message: str
    analysis: DocumentAnalysisRead


class ProtectionSummary(BaseModel):
    document_id: int
    document_title: str
    protection_score: int
    key_benefits: list[str] = Field(default_factory=list)
    top_issues: list[str] = Field(default_factory=list)
    recommended_next_steps: list[str] = Field(default_factory=list)
