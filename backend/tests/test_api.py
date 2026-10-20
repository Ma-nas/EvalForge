"""
Tests for EvalForge Core API — health, root, and cross-cutting concerns.
"""

def test_root_endpoint(client):
    """Root endpoint should return API metadata."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "EvalForge API"
    assert "version" in data
    assert "endpoints" in data
    assert "evaluation" in data["endpoints"]
    assert "hallucination" in data["endpoints"]


def test_health_endpoint(client):
    """Health check should always return 200 with healthy status."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "evalforge"


def test_invalid_route_returns_404(client):
    """Unknown routes should return 404."""
    res = client.get("/api/v1/nonexistent")
    assert res.status_code == 404


def test_evaluation_missing_required_fields(client):
    """Evaluation endpoint should return 422 when required fields are missing."""
    res = client.post("/api/v1/evaluation/evaluate", json={})
    assert res.status_code == 422


def test_hallucination_missing_fields(client):
    """Hallucination detection should return 422 when fields are missing."""
    res = client.post("/api/v1/hallucination/detect", json={"context": "some context"})
    assert res.status_code == 422


def test_rag_evaluation_missing_fields(client):
    """RAG evaluation should return 422 when required fields are absent."""
    res = client.post("/api/v1/rag/evaluate", json={"query": "test query"})
    assert res.status_code == 422


def test_register_validates_email_format(client):
    """Auth registration should reject malformed emails."""
    payload = {
        "email": "not-an-email",
        "username": "testuser",
        "password": "Password123!",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 422


def test_register_validates_weak_password(client):
    """Auth registration should reject passwords that are too short."""
    payload = {
        "email": "user@test.com",
        "username": "testuser",
        "password": "123",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 422
