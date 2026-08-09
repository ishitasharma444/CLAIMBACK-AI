from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.protection_agent import ProtectionAgent
from app.ai.models import ProtectionAnalysisResult
from app.models.document import Document
from app.models.protection import DocumentAnalysis, ProtectionAction, ProtectionFinding


class ProtectionService:
    @staticmethod
    async def list_documents(db: AsyncSession, user_id: int) -> list[Document]:
        result = await db.execute(select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def create_document(
        db: AsyncSession,
        user_id: int,
        title: str,
        document_type: str,
        original_filename: str,
        file_path: str,
        mime_type: str,
        file_size: int,
        provider_name: str | None,
        description: str | None,
    ) -> Document:
        item = Document(
            user_id=user_id,
            title=title,
            document_type=document_type,
            provider_name=provider_name,
            description=description,
            original_filename=original_filename,
            file_path=file_path,
            mime_type=mime_type,
            file_size=file_size,
            status="uploaded",
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def create_analysis(
        db: AsyncSession,
        document: Document,
        analysis_result: ProtectionAnalysisResult,
    ) -> DocumentAnalysis:
        findings_dict_list = [
            f.model_dump() if hasattr(f, "model_dump") else f
            for f in analysis_result.findings
        ]
        actions_dict_list = [
            a.model_dump() if hasattr(a, "model_dump") else a
            for a in analysis_result.actions
        ]

        record = DocumentAnalysis(
            document_id=document.id,
            user_id=document.user_id,
            protection_score=analysis_result.protection_score,
            document_type=document.document_type,
            provider_name=document.provider_name,
            key_benefits=analysis_result.key_benefits,
            coverage_entitlements=analysis_result.coverage_entitlements,
            exclusions=analysis_result.exclusions,
            fees_and_penalties=analysis_result.fees_and_penalties,
            important_deadlines=analysis_result.important_deadlines,
            user_obligations=analysis_result.user_obligations,
            required_documentation=analysis_result.required_documentation,
            potential_risks=analysis_result.potential_risks,
            precautions=analysis_result.precautions,
            immediate_actions=analysis_result.immediate_actions,
            questions_to_clarify=analysis_result.questions_to_clarify,
            findings_json={"findings": findings_dict_list, "actions": actions_dict_list},
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        for item in analysis_result.findings:
            item_dict = item.model_dump() if hasattr(item, "model_dump") else (item if isinstance(item, dict) else {})
            finding = ProtectionFinding(
                document_analysis_id=record.id,
                category=str(item_dict.get("category", "general")),
                title=str(item_dict.get("title", "Finding")),
                description=str(item_dict.get("description", "No description provided.")),
                severity=str(item_dict.get("severity", "medium")),
                source_reference=item_dict.get("source_reference"),
            )
            db.add(finding)

        for item in analysis_result.actions:
            item_dict = item.model_dump() if hasattr(item, "model_dump") else (item if isinstance(item, dict) else {})
            action = ProtectionAction(
                document_analysis_id=record.id,
                title=str(item_dict.get("title", "Action")),
                description=str(item_dict.get("description", "No description provided.")),
                priority=str(item_dict.get("priority", "medium")),
            )
            db.add(action)

        await db.commit()
        await db.refresh(record)
        return record

    @staticmethod
    async def analyze_document(db: AsyncSession, document: Document) -> DocumentAnalysis:
        from app.services.document_extraction_service import extract_document_text

        # 1. Read stored document & extract text
        extraction = extract_document_text(document.file_path)
        extracted_text = str(extraction.get("text", ""))

        # 2. Call AI agent with extracted content
        agent = ProtectionAgent()
        result = await agent.analyze_document_content(
            extracted_text=extracted_text,
            document_type=document.document_type,
            provider_name=document.provider_name,
            title=document.title,
        )

        # 3. Update document status
        document.status = "analyzed"
        db.add(document)
        await db.commit()

        # 4. Save analysis & return
        return await ProtectionService.create_analysis(db, document, result)

    @staticmethod
    async def list_analyses_for_document(db: AsyncSession, document_id: int, user_id: int) -> list[DocumentAnalysis]:
        result = await db.execute(
            select(DocumentAnalysis).where(DocumentAnalysis.document_id == document_id, DocumentAnalysis.user_id == user_id)
            .order_by(DocumentAnalysis.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_analysis(db: AsyncSession, analysis_id: int, user_id: int) -> DocumentAnalysis:
        result = await db.execute(select(DocumentAnalysis).where(DocumentAnalysis.id == analysis_id))
        analysis = result.scalar_one_or_none()
        if analysis is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Protection analysis not found")
        if analysis.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this analysis")
        return analysis
