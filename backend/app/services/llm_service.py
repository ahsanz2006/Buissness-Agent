import httpx

from app.core.config import get_settings


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def complete(self, system_prompt: str, user_prompt: str) -> str:
        settings = self.settings
        if not settings.llm_api_key:
            return self._development_response(user_prompt)

        payload = {
            "model": settings.llm_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
        timeout_seconds = 25

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                provider_response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )
                provider_response.raise_for_status()
        except (httpx.HTTPError, httpx.TimeoutException) as exc:
            raise RuntimeError("LLM_PROVIDER_ERROR: language model request failed") from exc

        data = provider_response.json()
        response_text = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not response_text:
            raise RuntimeError("LLM_PROVIDER_ERROR: malformed language model response")
        return response_text

    def _development_response(self, user_prompt: str) -> str:
        return (
            "Development mock response: I can help analyze business performance, "
            "summarize documents once indexed, and prepare decision-ready follow-ups. "
            f"You asked: {user_prompt}"
        )


llm_service = LLMService()
