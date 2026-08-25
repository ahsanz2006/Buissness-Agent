from uuid import uuid4

from app.schemas.contracts import ChatRequest, ChatResponse, SourceRef
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service


class Supervisor:
    async def handle_chat(self, request: ChatRequest) -> ChatResponse:
        conversation_id = request.conversation_id or f"conv_{uuid4().hex}"
        request_id = f"req_{uuid4().hex}"
        message_id = f"msg_{uuid4().hex}"
        intent = self._classify_intent(request.query_text)

        try:
            if intent == "document_search":
                answer, chunks = await rag_service.answer(request.query_text)
                sources = [
                    SourceRef(
                        source_id=chunk.source_id,
                        title=chunk.title,
                        snippet=chunk.text[:180],
                    )
                    for chunk in chunks
                ]
            else:
                answer = await llm_service.complete(
                    system_prompt="You are a concise AI business intelligence copilot.",
                    user_prompt=request.query_text,
                )
                sources = []
            error = None
        except RuntimeError:
            answer = "I could not complete that request. Please try again."
            sources = []
            error = {"error_code": "LLM_PROVIDER_ERROR", "message": answer}

        return ChatResponse(
            request_id=request_id,
            conversation_id=conversation_id,
            message_id=message_id,
            answer=answer,
            intent=intent,
            sources=sources,
            error=error,
            suggested_questions=[
                "Show me sales performance",
                "What should I review next?",
                "Summarize the latest document",
            ],
        )

    def _classify_intent(self, query_text: str) -> str:
        normalized = query_text.lower()
        document_terms = ("document", "policy", "contract", "file", "pdf", "leave")
        if any(term in normalized for term in document_terms):
            return "document_search"
        return "analytics"


supervisor = Supervisor()
