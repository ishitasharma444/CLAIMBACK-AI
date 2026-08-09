from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Dict, Optional

from app.ai.models import ProtectionAction, ProtectionFinding, ProtectionAnalysisResult

logger = logging.getLogger(__name__)

# Try importing google-genai
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class LLMProviderInterface:
    async def generate_structured_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Any,
    ) -> Optional[Dict[str, Any]]:
        raise NotImplementedError


class GeminiLLMProvider(LLMProviderInterface):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.client = genai.Client(api_key=api_key)

    async def generate_structured_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Any,
    ) -> Optional[Dict[str, Any]]:
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.1,
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_prompt,
                config=config,
            )
            if response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini API invocation error: {e}", exc_info=True)
            return None
        return None


def get_llm_provider() -> Optional[LLMProviderInterface]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    if GENAI_AVAILABLE:
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        return GeminiLLMProvider(api_key=api_key, model_name=model_name)
    
    return None
