from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

from app.ai.models import ProtectionAction, ProtectionFinding, ProtectionAnalysisResult
from app.services.llm_provider import get_llm_provider

logger = logging.getLogger(__name__)


def calculate_protection_score(
    entitlements_count: int,
    deadlines_count: int,
    exclusions_count: int,
    risks_count: int,
    findings: List[Dict[str, Any]],
    text_length: int,
) -> int:
    """
    Calculates a deterministic, explainable Protection Score (0-100) based on document facts.
    """
    score = 70  # Baseline neutral score

    # Bonus for clear entitlements and benefits (+5 per item, max +20)
    score += min(20, entitlements_count * 5)

    # Deduction for exclusions (-4 per item, max -20)
    score -= min(20, exclusions_count * 4)

    # Deduction for severe risks / critical findings (-5 per high/critical finding)
    critical_findings = sum(
        1 for f in findings if f.get("severity") in ("high", "critical")
    )
    score -= min(25, critical_findings * 6)

    # Deduction for tight deadlines (-3 per urgent deadline)
    score -= min(15, deadlines_count * 3)

    # Clamp to [0, 100]
    return max(0, min(100, score))


def heuristic_rule_engine(
    text: str,
    document_type: str,
    provider_name: Optional[str] = None,
) -> ProtectionAnalysisResult:
    """
    Failsafe deterministic rule engine used when no LLM API key is present or when LLM fails.
    Extracts explicit facts directly from text regex without hallucinating.
    """
    provider = provider_name or "Provider"
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    key_benefits: List[str] = []
    coverage_entitlements: List[str] = []
    conditions_for_entitlement: List[str] = []
    exclusions: List[str] = []
    fees_and_penalties: List[str] = []
    important_deadlines: List[str] = []
    user_obligations: List[str] = []
    required_documentation: List[str] = []
    missing_or_weak_evidence: List[str] = []
    potential_risks: List[str] = []
    precautions: List[str] = []
    immediate_actions: List[str] = []
    questions_to_clarify: List[str] = []
    findings: List[ProtectionFinding] = []
    actions: List[ProtectionAction] = []
    potential_recovery_amount: Optional[float] = None
    potential_recovery_currency: Optional[str] = None

    # Track page numbers
    current_page = "Page 1"

    # Regex matches
    day_match = re.search(r"(\d+)\s*(calendar|working|business)?\s*days", text, re.IGNORECASE)
    amount_match = re.search(r"(?:₹|INR|USD|\$)\s*([\d,]+(?:\.\d{2})?)", text)

    if amount_match:
        try:
            val_str = amount_match.group(1).replace(",", "")
            potential_recovery_amount = float(val_str)
            if "₹" in text or "INR" in text:
                potential_recovery_currency = "INR"
            elif "$" in text or "USD" in text:
                potential_recovery_currency = "USD"
        except Exception:
            pass

    for line in lines:
        if line.startswith("--- [Page"):
            pg_match = re.search(r"Page\s*(\d+)", line)
            if pg_match:
                current_page = f"Page {pg_match.group(1)}"
            continue

        lower_line = line.lower()

        # Deadlines
        if any(kw in lower_line for kw in ["deadline", "within", "calendar days", "reporting window", "expire"]):
            important_deadlines.append(f"{line} ({current_page})")
            findings.append(
                ProtectionFinding(
                    category="deadline",
                    title="Time-sensitive deadline detected",
                    description=line,
                    severity="high" if "within" in lower_line or "days" in lower_line else "medium",
                    source_reference=current_page,
                )
            )

        # Exclusions / Rejections
        elif any(kw in lower_line for kw in ["exclusion", "not covered", "rejection", "rejected", "invalid", "will not"]):
            exclusions.append(f"{line} ({current_page})")
            findings.append(
                ProtectionFinding(
                    category="exclusion",
                    title="Exclusion clause",
                    description=line,
                    severity="high",
                    source_reference=current_page,
                )
            )

        # Requirements & Evidence
        elif any(kw in lower_line for kw in ["required", "confirmation", "receipt", "proof", "document"]):
            required_documentation.append(f"{line} ({current_page})")

        # Entitlements
        elif any(kw in lower_line for kw in ["eligible", "entitled", "refund", "reimbursement", "compensation", "benefit"]):
            coverage_entitlements.append(f"{line} ({current_page})")

        # Obligations
        elif any(kw in lower_line for kw in ["must", "shall", "obligated", "requirement"]):
            user_obligations.append(f"{line} ({current_page})")

        # Precautions
        elif any(kw in lower_line for kw in ["keep", "save", "record", "screenshot", "retain"]):
            precautions.append(f"{line} ({current_page})")

    # Clean duplicates
    key_benefits = list(dict.fromkeys(coverage_entitlements[:3]))
    if not key_benefits:
        key_benefits = ["Not specified in the provided document."]
    if not coverage_entitlements:
        coverage_entitlements = ["Not specified in the provided document."]
    if not exclusions:
        exclusions = ["No explicit exclusions found in the document."]
    if not important_deadlines:
        important_deadlines = ["No explicit deadline specified in the document."]
    if not user_obligations:
        user_obligations = ["Follow standard claim guidelines."]
    if not required_documentation:
        required_documentation = ["Keep all receipts and booking communications."]

    # Direct actions from findings
    if important_deadlines and important_deadlines[0] != "No explicit deadline specified in the document.":
        actions.append(
            ProtectionAction(
                title="Submit claim before deadline",
                description=f"Act promptly on: {important_deadlines[0]}",
                priority="high",
            )
        )
    actions.append(
        ProtectionAction(
            title="Compile evidence packet",
            description="Collect all required proof of payment and booking records before filing.",
            priority="high",
        )
    )

    findings_dict_list = [f.model_dump() for f in findings]
    score = calculate_protection_score(
        len(coverage_entitlements),
        len(important_deadlines),
        len(exclusions),
        len(potential_risks),
        findings_dict_list,
        len(text),
    )

    return ProtectionAnalysisResult(
        protection_score=score,
        summary=f"Analysis of document for {provider} ({document_type}).",
        key_benefits=key_benefits,
        coverage_entitlements=coverage_entitlements,
        conditions_for_entitlement=conditions_for_entitlement or ["Meet document eligibility terms."],
        exclusions=exclusions,
        fees_and_penalties=fees_and_penalties or ["Not specified in the provided document."],
        important_deadlines=important_deadlines,
        user_obligations=user_obligations,
        required_documentation=required_documentation,
        missing_or_weak_evidence=missing_or_weak_evidence or ["Ensure all receipts and notifications are included."],
        potential_risks=potential_risks or ["Late submission or missing proof may weaken your case."],
        precautions=precautions or ["Keep written records of all communication."],
        immediate_actions=immediate_actions or ["Review document terms and verify deadline."],
        questions_to_clarify=questions_to_clarify or ["Confirm exact submission procedures with the provider."],
        potential_recovery_amount=potential_recovery_amount,
        potential_recovery_currency=potential_recovery_currency,
        confidence=0.85,
        findings=findings,
        actions=actions,
    )


class ProtectionAgent:
    SYSTEM_PROMPT = """You are ClaimBack's Consumer Protection Analysis Agent.
Your job is to analyze consumer documents (insurance policies, flight tickets, loan contracts, financial agreements, warranties, receipts) and extract EXACT consumer rights, entitlements, exclusions, obligations, deadlines, fees, and risks.

STRICT GROUNDING & NO HALLUCINATION RULES:
1. ONLY state facts present in the provided document text.
2. If a value (fee, deadline, refund amount, policy term) is NOT stated, write "Not specified in the provided document." or place it under questions_to_clarify.
3. NEVER invent page numbers or sections. Use page numbers matching "--- [Page N] ---" in the text. If page/section cannot be determined, use "Not explicitly identified".
4. For monetary amounts: Extract potential_recovery_amount ONLY if explicitly stated as an example or entitlement in the text. Do NOT predict or invent figures.
5. Provide actionable, practical findings with categories: coverage, deadline, exclusion, documentation, fee, obligation, risk, eligibility.
6. Provide clear, prioritized actions (priority: low, medium, high, critical).
7. For financial/investment/crypto documents: Do NOT give investment advice or predict returns. Only analyze terms, fees, obligations, and risks.
"""

    async def analyze_document_content(
        self,
        extracted_text: str,
        document_type: str,
        provider_name: str | None = None,
        title: str | None = None,
    ) -> ProtectionAnalysisResult:
        if not extracted_text or not extracted_text.strip():
            # Return clear "document could not be read" result
            return ProtectionAnalysisResult(
                protection_score=0,
                summary="Document could not be read (no extractable text).",
                key_benefits=["Document contains no readable text."],
                coverage_entitlements=["Unable to determine entitlements."],
                exclusions=["Unable to determine exclusions."],
                important_deadlines=["Document unreadable."],
                user_obligations=["Provide a legible copy of the document."],
                required_documentation=["Re-upload a clear PDF or text file."],
                potential_risks=["Unreadable document cannot be analyzed for consumer protection."],
                immediate_actions=["Upload a document with extractable text."],
                questions_to_clarify=["Is this document an image-only scan or corrupted file?"],
                confidence=0.0,
                findings=[
                    ProtectionFinding(
                        category="documentation",
                        title="Unreadable Document",
                        description="The uploaded file contains no extractable text.",
                        severity="critical",
                        source_reference="File reader",
                    )
                ],
                actions=[
                    ProtectionAction(
                        title="Re-upload legible document",
                        description="Please upload a PDF containing selectable text or a plain text document.",
                        priority="critical",
                    )
                ],
            )

        provider = provider_name or "Provider"
        doc_title = title or "Document"

        llm_provider = get_llm_provider()
        if llm_provider is not None:
            user_prompt = f"""DOCUMENT TITLE: {doc_title}
DOCUMENT TYPE: {document_type}
PROVIDER: {provider}

DOCUMENT TEXT CONTENT:
{extracted_text}
"""
            raw_result = await llm_provider.generate_structured_analysis(
                system_prompt=self.SYSTEM_PROMPT,
                user_prompt=user_prompt,
                response_schema=ProtectionAnalysisResult,
            )

            if raw_result and isinstance(raw_result, dict):
                try:
                    # Calculate deterministic score based on extracted facts
                    findings_raw = raw_result.get("findings", [])
                    findings_objs = [
                        ProtectionFinding(**f) if isinstance(f, dict) else f
                        for f in findings_raw
                    ]
                    actions_raw = raw_result.get("actions", [])
                    actions_objs = [
                        ProtectionAction(**a) if isinstance(a, dict) else a
                        for a in actions_raw
                    ]

                    calc_score = calculate_protection_score(
                        entitlements_count=len(raw_result.get("coverage_entitlements", [])),
                        deadlines_count=len(raw_result.get("important_deadlines", [])),
                        exclusions_count=len(raw_result.get("exclusions", [])),
                        risks_count=len(raw_result.get("potential_risks", [])),
                        findings=[f.model_dump() for f in findings_objs],
                        text_length=len(extracted_text),
                    )

                    raw_result["protection_score"] = calc_score
                    raw_result["findings"] = findings_objs
                    raw_result["actions"] = actions_objs

                    return ProtectionAnalysisResult(**raw_result)
                except Exception as e:
                    logger.warning(f"Failed to parse LLM structured output: {e}, falling back to heuristic engine.")

        # Fallback to heuristic rule engine if LLM API key not present or call failed
        return heuristic_rule_engine(extracted_text, document_type, provider_name)
