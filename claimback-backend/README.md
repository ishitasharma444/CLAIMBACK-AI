# ClaimBack Backend

This is the FastAPI backend for the ClaimBack hackathon project. It provides user authentication, claim management, secure evidence uploads, analysis scaffolding, and resolution APIs.

## Stack

- Python 3.12+
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL-ready configuration
- JWT authentication
- bcrypt password hashing
- python-multipart file uploads

## Local setup

1. Create and activate a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a local environment file by copying `.env.example`:

   ```bash
   copy .env.example .env
   ```

4. Update the database connection and JWT secret values in `.env`.
5. Start the API:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API documentation

After starting the app, open:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Main endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/claims`
- `GET /api/v1/claims`
- `GET /api/v1/claims/{claim_id}`
- `PATCH /api/v1/claims/{claim_id}`
- `DELETE /api/v1/claims/{claim_id}`
- `POST /api/v1/claims/{claim_id}/evidence`
- `GET /api/v1/claims/{claim_id}/evidence`
- `DELETE /api/v1/evidence/{evidence_id}`
- `POST /api/v1/claims/{claim_id}/analyze`
- `GET /api/v1/claims/{claim_id}/analysis`
- `GET /api/v1/claims/{claim_id}/resolution`
- `GET /health`

## Notes

- The app supports both PostgreSQL and SQLite fallback for local development.
- Uploaded files are stored under the `uploads/` directory and are validated by type and size.
- The AI agent layer is intentionally stubbed and structured for future integration with real model providers.
