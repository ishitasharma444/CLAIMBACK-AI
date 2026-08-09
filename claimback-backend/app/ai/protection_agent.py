from __future__ import annotations

from typing import Any

from app.ai.models import ProtectionAnalysisResult


class ProtectionAgent:
    async def analyze_document(self, document: dict[str, Any]) -> ProtectionAnalysisResult:
        document_type = (document.get("document_type") or "insurance_policy").lower()
        provider_name = document.get("provider_name") or "Provider"

        if "insurance" in document_type or "policy" in document_type:
            key_benefits = [
                f"Coverage for financial shocks from {provider_name}",
                "Rapid claim support and dedicated assistance",
                "Protection against unexpected losses and policy exclusions",
            ]
            coverage_entitlements = [
                "Replacement or reimbursement for covered events",
                "Policy benefits as outlined in the agreement",
                "Access to policy support channels",
            ]
            exclusions = [
                "Acts of fraud, deliberate misrepresentation, or false statements",
                "Losses arising from uncovered exclusions in the policy",
                "Unreported or delayed events beyond the policy timelines",
            ]
            fees_and_penalties = [
                "Premium defaults or outstanding dues",
                "Late filing or incomplete documentation charges where applicable",
            ]
            important_deadlines = [
                "Submit a claim within the policy reporting window",
                "Update the provider if your information changes",
            ]
            user_obligations = [
                "Disclose all relevant facts and material changes",
                "Maintain required records and supporting documents",
                "Pay premium renewals on time",
            ]
            required_documentation = [
                "Identity and policy reference information",
                "Proof of incident, claim form, and supporting evidence",
                "Banking and payment details for reimbursement",
            ]
            potential_risks = [
                "Insufficient evidence may weaken the claim",
                "Policy exclusions may reduce payout eligibility",
            ]
            precautions = [
                "Read the full policy terms and obligations before filing",
                "Compile a complete evidence packet before making a claim",
            ]
            immediate_actions = [
                "Review the policy summary for benefit triggers",
                "Gather all supporting documents and claim references",
                "Contact the provider to confirm coverage and claim procedures",
            ]
            questions_to_clarify = [
                "Are there any exclusions that could block reimbursement?",
                "What is the claim submission timeline for this policy?",
            ]
            protection_score = 86
        else:
            key_benefits = [
                "Clear rights and service protections under the agreement",
                "Documented terms for dispute handling and recourse",
                "Structured customer support and procedural safeguards",
            ]
            coverage_entitlements = [
                "Benefits and services described in the agreement",
                "Stepped complaint and resolution channels",
            ]
            exclusions = [
                "Items not expressly covered by the contract or legal terms",
                "Losses caused by non-compliance with required steps",
            ]
            fees_and_penalties = [
                "Service fees or compliance penalties where applicable",
                "Late filing or delay penalties under the agreement",
            ]
            important_deadlines = [
                "Track service deadlines and formal notices",
                "Keep copies of all communication and obligations",
            ]
            user_obligations = [
                "Follow the document terms and required actions",
                "Share accurate information and supporting documents",
            ]
            required_documentation = [
                "Agreement copy and supporting records",
                "Evidence of communication or transaction history",
            ]
            potential_risks = [
                "Missing documentation may reduce leverage",
                "Procedure gaps can slow resolution",
            ]
            precautions = [
                "Review the terms carefully before a dispute escalates",
                "Document each step and response in writing",
            ]
            immediate_actions = [
                "Read the most relevant clauses and action deadlines",
                "Log the issue and expected resolution path",
            ]
            questions_to_clarify = [
                "Which sections of the document are most relevant to the issue?",
                "What is the deadline for filing a formal complaint or claim?",
            ]
            protection_score = 79

        findings = [
            {
                "category": "coverage",
                "title": "Coverage review",
                "description": "The document appears to provide meaningful protections and clear coverage terms.",
                "severity": "medium",
                "source_reference": provider_name,
            },
            {
                "category": "risk",
                "title": "Important review points",
                "description": "A few exclusions and documentation requirements could affect outcome quality.",
                "severity": "medium",
                "source_reference": "terms and conditions",
            },
        ]

        actions = [
            {
                "title": "Confirm document scope",
                "description": "Check the main policy sections and the exact covered events before acting.",
                "priority": "high",
            },
            {
                "title": "Gather supporting evidence",
                "description": "Prepare receipts, messages, statements, and formal records to support your case.",
                "priority": "high",
            },
            {
                "title": "Review deadlines",
                "description": "Track all notice and claim deadlines to avoid losing rights or benefits.",
                "priority": "medium",
            },
        ]

        return ProtectionAnalysisResult(
            protection_score=protection_score,
            key_benefits=key_benefits,
            coverage_entitlements=coverage_entitlements,
            exclusions=exclusions,
            fees_and_penalties=fees_and_penalties,
            important_deadlines=important_deadlines,
            user_obligations=user_obligations,
            required_documentation=required_documentation,
            potential_risks=potential_risks,
            precautions=precautions,
            immediate_actions=immediate_actions,
            questions_to_clarify=questions_to_clarify,
            findings=findings,
            actions=actions,
        )
