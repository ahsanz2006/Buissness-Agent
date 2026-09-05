from __future__ import annotations
import httpx
from app.core.config import get_settings

class LLMService:
    async def complete(self, system_prompt:str, user_prompt:str) -> str:
        s=get_settings()
        if not s.gemini_api_key:
            return self._offline(user_prompt)
        url=f"https://generativelanguage.googleapis.com/v1beta/models/{s.gemini_model}:generateContent"
        payload={"systemInstruction":{"parts":[{"text":system_prompt}]},"contents":[{"role":"user","parts":[{"text":user_prompt}]}],"generationConfig":{"temperature":0.2}}
        try:
            async with httpx.AsyncClient(timeout=35) as client:
                r=await client.post(url,headers={"x-goog-api-key":s.gemini_api_key},json=payload); r.raise_for_status(); data=r.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            raise RuntimeError(f"LLM provider request failed: {type(e).__name__}") from e
    def _offline(self,prompt:str)->str:
        return "I can process this request locally where deterministic analytics or document retrieval is available. Configure GEMINI_API_KEY for general generative responses."
llm_service=LLMService()
