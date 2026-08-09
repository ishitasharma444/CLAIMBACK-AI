from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    claim_id: Mapped[int] = mapped_column(ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_strength: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    evidence_completeness: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    policy_match: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    factual_consistency: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rejection_risk: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    findings_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    claim: Mapped["Claim"] = relationship(back_populates="analyses")
