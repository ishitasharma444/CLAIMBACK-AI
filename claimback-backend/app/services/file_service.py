from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
}

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


def _safe_upload_directory() -> Path:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def validate_upload(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File name is required")

    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MIME type")

    if file.size and file.size > settings.max_upload_size_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds allowed size")


def generate_safe_filename(filename: str) -> str:
    original_name = Path(filename).name
    stem = Path(original_name).stem
    suffix = Path(original_name).suffix.lower()
    safe_stem = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in stem)
    unique_id = uuid.uuid4().hex
    return f"{safe_stem or 'evidence'}_{unique_id}{suffix or '.bin'}"


def save_upload(file: BinaryIO, filename: str) -> str:
    upload_dir = _safe_upload_directory()
    safe_name = generate_safe_filename(filename)
    target_path = upload_dir / safe_name
    with open(target_path, "wb") as buffer:
        while True:
            chunk = file.read(1024 * 1024)
            if not chunk:
                break
            buffer.write(chunk)
    return str(target_path)
