from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ClaimBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field(..., min_length=2, max_length=120)
    description: str = Field(..., min_length=10)
    status: str = Field(default="draft", max_length=50)
    potential_amount: Optional[float] = None
    currency: str = Field(default="USD", max_length=10)
    claim_strength: Optional[int] = None


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    category: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, min_length=10)
    status: Optional[str] = Field(default=None, max_length=50)
    potential_amount: Optional[float] = None
    currency: Optional[str] = Field(default=None, max_length=10)
    claim_strength: Optional[int] = None


class ClaimRead(ClaimBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
