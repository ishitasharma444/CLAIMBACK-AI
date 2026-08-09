# ClaimBack

Before it costs you. Know what you're entitled to.

ClaimBack is a consumer protection platform that helps people understand
the documents, policies and terms they agree to — before those terms
turn into a financial loss.

Instead of making users go through long policy documents, ClaimBack
extracts the information that actually matters: what you're covered for,
what can exclude you, important deadlines, required evidence, potential
risks and what you should do next.

## What ClaimBack Does

A user can upload a document such as a flight policy, insurance document,
purchase invoice, warranty, banking document or contract.

ClaimBack analyzes the document and creates a structured protection
report containing:

- Protection score
- Benefits and coverage entitlements
- Exclusions
- Fees and penalties
- Important deadlines
- User obligations
- Required documentation
- Potential risks
- Precautions
- Immediate actions
- Questions that need clarification

The goal is simple: turn complicated terms and conditions into something
a person can actually understand and act on.

## How It Works

The product follows a simple workflow:

Upload a document
        ↓
Analyze the document
        ↓
Understand your rights and obligations
        ↓
Identify risks and deadlines
        ↓
Prepare the required evidence
        ↓
Take the recommended action
        ↓
Start a claim when something goes wrong

## Example

Consider a passenger whose flight has been cancelled.

Instead of manually reading an airline's cancellation and refund policy,
the user uploads the document to ClaimBack.

The system can identify things such as:

- What refund or replacement options may apply
- Conditions that affect eligibility
- Important claim or notification deadlines
- Documents the passenger should keep
- Exclusions that could affect reimbursement
- Precautions to take before submitting a claim
- The next actions the passenger should take

This gives the user a clear picture of the situation before they start
the claim process.

## Protection Before Claims

One of the main ideas behind ClaimBack is that consumer protection
should not start after something goes wrong.

A document can contain conditions that affect a user's money long before
they ever need to make a claim.

ClaimBack therefore separates the product into two connected stages:

Protection

Understand the terms, identify risks, find deadlines and prepare the
necessary evidence.

Claims

When an actual issue occurs, use the existing claim workflow to create
the claim, attach evidence, analyze it and follow the resolution steps.

## Key Features

### Document Protection Analysis

Users can upload consumer and financial documents and receive a
structured analysis instead of having to manually search through the
entire document.

### Risk and Exclusion Detection

ClaimBack highlights exclusions, conditions and other factors that may
reduce or prevent a benefit or reimbursement.

### Deadline Awareness

Important deadlines and reporting requirements are surfaced so users
know what needs to be done and when.

### Evidence Preparation

The system identifies the documents and evidence that may be required
for a claim.

### Protection Score

Each analysis can provide a protection score that summarizes the
overall result of the document analysis.

### Precautions and Immediate Actions

Instead of stopping at document summarization, ClaimBack provides
practical precautions and recommended next steps.

### Claim Management

Users can create and manage claims, attach evidence and run claim
analysis through the existing claim workflow.

### Resolution Guidance

Once a claim exists, ClaimBack can provide resolution steps to help the
user understand what should happen next.

## Supported Use Cases

The architecture is designed to work across different types of
consumer documents, including:

- Flight and travel documents
- Health and other insurance policies
- Banking and financial documents
- Purchase invoices and warranties
- Loan agreements
- Investment-related documents
- Crypto platform terms
- Subscription agreements
- Contracts and terms of service

The same protection workflow can be applied to different domains while
the underlying analysis remains structured and consistent.

## Architecture

The application is built around a frontend and a FastAPI backend.

Frontend
    |
    | REST API
    v
FastAPI Backend
    |
    +-- Authentication
    +-- Protection Documents
    +-- Document Analysis
    +-- Claims
    +-- Evidence
    +-- Claim Analysis
    +-- Resolution
    |
    v
Database / Analysis Layer

Authentication is handled using JWT access and refresh tokens.
Protected resources are associated with the authenticated user.

## Backend API

### Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me

### Protection

GET  /api/v1/protection/documents
POST /api/v1/protection/documents
POST /api/v1/protection/documents/{document_id}/analyze
GET  /api/v1/protection/documents/{document_id}/analysis
GET  /api/v1/protection/analysis/{document_analysis_id}

### Claims

GET    /api/v1/claims
POST   /api/v1/claims
GET    /api/v1/claims/{claim_id}
PATCH  /api/v1/claims/{claim_id}
DELETE /api/v1/claims/{claim_id}

### Evidence

POST   /api/v1/claims/{claim_id}/evidence
GET    /api/v1/claims/{claim_id}/evidence
DELETE /api/v1/evidence/{evidence_id}

### Analysis and Resolution

POST /api/v1/claims/{claim_id}/analyze
GET  /api/v1/claims/{claim_id}/analysis
GET  /api/v1/claims/{claim_id}/resolution

## Technology Stack

Frontend:
React / Vite

Backend:
FastAPI
Python
SQLAlchemy
Alembic

Database:
SQLite for development with PostgreSQL support

Authentication:
JWT
bcrypt / Passlib

API Documentation:
OpenAPI / Swagger

## Running the Project

### Backend

```bash
cd backend

pip install -r requirements.txt

python -m uvicorn app.main:app --host 127.0.0.1 --port 8003
### Personalized Account Setup

During account creation, users can add their own information, preferences
and personal values. This allows ClaimBack to understand what matters to
them and provide protection recommendations that are relevant to their
individual needs.

Users can also create and manage their own custom entries instead of
being restricted to predefined options.
