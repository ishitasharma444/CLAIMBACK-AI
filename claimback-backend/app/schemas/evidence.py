from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EvidenceRead(BaseModel):
    id: int
    claim_id: int
    user_id: int
    filename: str
    mime_type: str
    file_size: int
    evidence_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EvidenceUploadResponse(BaseModel):
    id: int
    claim_id: int
    filename: str
    file_path: str
    mime_type: str
    file_size: int
    evidence_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
