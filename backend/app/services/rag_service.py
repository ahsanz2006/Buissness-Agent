from dataclasses import dataclass

from app.services.llm_service import llm_service


@dataclass
class RetrievedChunk:
    source_id: str
    title: str
    text: str
    score: float


class RAGService:
    async def hybrid_search(self, query_text: str, top_k: int = 5) -> list[RetrievedChunk]:
        chunks: list[RetrievedChunk] = []
        return chunks[:top_k]

    async def answer(self, query_text: str) -> tuple[str, list[RetrievedChunk]]:
        chunks = await self.hybrid_search(query_text)
        if not chunks:
            return (
                "I do not have indexed document sources for that yet. Upload or index the relevant documents and I can ground the answer in them.",
                [],
            )

        context = "\n\n".join(chunk.text for chunk in chunks)
        answer = await llm_service.complete(
            system_prompt="Answer using only the provided retrieved business document context.",
            user_prompt=f"Context:\n{context}\n\nQuestion:\n{query_text}",
        )
        return answer, chunks


rag_service = RAGService()
