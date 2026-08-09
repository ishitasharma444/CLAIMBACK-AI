from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.user import User


class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    protection_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    document_type: Mapped[str] = mapped_column(String(120), nullable=False)
    provider_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    key_benefits: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    coverage_entitlements: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    exclusions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    fees_and_penalties: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    important_deadlines: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    user_obligations: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    required_documentation: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    potential_risks: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    precautions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    immediate_actions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    questions_to_clarify: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    findings_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    document: Mapped["Document"] = relationship(back_populates="analyses")
    findings: Mapped[list["ProtectionFinding"]] = relationship(back_populates="analysis", cascade="all, delete-orphan")
    actions: Mapped[list["ProtectionAction"]] = relationship(back_populates="analysis", cascade="all, delete-orphan")


class ProtectionFinding(Base):
    __tablename__ = "protection_findings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_analysis_id: Mapped[int] = mapped_column(ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    source_reference: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    analysis: Mapped["DocumentAnalysis"] = relationship(back_populates="findings")


class ProtectionAction(Base):
    __tablename__ = "protection_actions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_analysis_id: Mapped[int] = mapped_column(ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    analysis: Mapped["DocumentAnalysis"] = relationship(back_populates="actions")
