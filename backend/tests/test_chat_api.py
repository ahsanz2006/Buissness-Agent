from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chat_api_returns_contract() -> None:
    response = client.post("/api/chat", json={"query_text": "Show sales for last month"})

    assert response.status_code == 200
    data = response.json()
    assert data["request_id"].startswith("req_")
    assert data["conversation_id"].startswith("conv_")
    assert data["message_id"].startswith("msg_")
    assert isinstance(data["answer"], str)
    assert data["intent"] == "analytics"


def test_chat_preserves_conversation_id() -> None:
    first = client.post("/api/chat", json={"query_text": "Hello"}).json()
    second = client.post(
        "/api/chat",
        json={
            "conversation_id": first["conversation_id"],
            "query_text": "What next?",
        },
    ).json()

    assert second["conversation_id"] == first["conversation_id"]


def test_document_intent_routes_to_document_search() -> None:
    response = client.post(
        "/api/chat",
        json={"query_text": "What does the company policy document say?"},
    )

    assert response.json()["intent"] == "document_search"
