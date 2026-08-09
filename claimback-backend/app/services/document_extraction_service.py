from __future__ import annotations

import os
from pathlib import Path
from pypdf import PdfReader


def extract_document_text(file_path: str) -> dict[str, str | bool | int]:
    """
    Extracts text from a PDF, TXT, or supported document file.
    Preserves page numbers for PDFs.

    Returns dict with keys:
      - text: Full combined text string (with Page markers)
      - page_count: Total page count
      - success: bool indicating if readable text was extracted
      - error: Optional error message if extraction failed
    """
    path = Path(file_path)
    if not path.exists():
        return {
            "text": "",
            "page_count": 0,
            "success": False,
            "error": f"File not found at path: {file_path}",
        }

    ext = path.suffix.lower()

    if ext == ".pdf":
        try:
            reader = PdfReader(str(path))
            pages_text = []
            page_count = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                extracted = page.extract_text() or ""
                if extracted.strip():
                    pages_text.append(f"--- [Page {page_num}] ---\n{extracted.strip()}")

            full_text = "\n\n".join(pages_text).strip()
            if not full_text:
                return {
                    "text": "",
                    "page_count": page_count,
                    "success": False,
                    "error": "Document could not be read (no extractable text in PDF).",
                }

            return {
                "text": full_text,
                "page_count": page_count,
                "success": True,
                "error": None,
            }
        except Exception as e:
            return {
                "text": "",
                "page_count": 0,
                "success": False,
                "error": f"PDF extraction error: {str(e)}",
            }

    # Plain text / markdown files
    elif ext in {".txt", ".md", ".log", ".json"}:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read().strip()
            if not content:
                return {
                    "text": "",
                    "page_count": 1,
                    "success": False,
                    "error": "Document is empty.",
                }
            return {
                "text": f"--- [Page 1] ---\n{content}",
                "page_count": 1,
                "success": True,
                "error": None,
            }
        except Exception as e:
            return {
                "text": "",
                "page_count": 0,
                "success": False,
                "error": f"Text file extraction error: {str(e)}",
            }

    else:
        return {
            "text": "",
            "page_count": 0,
            "success": False,
            "error": f"Unsupported format for text extraction: {ext}",
        }
