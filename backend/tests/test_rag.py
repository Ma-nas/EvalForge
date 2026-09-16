"""
Tests for RAG Evaluation Routes (/api/v1/rag)
"""

def test_rag_evaluation(client):
    payload = {
        "query": "How does vector search find similar documents?",
        "retrieved_contexts": [
            "Vector search represents texts as mathematical vectors and finds near neighbors using distance metrics.",
            "Cosine similarity and Euclidean distance are standard metrics for vector similarity calculation in dense retrieval."
        ],
        "generated_output": "Vector search maps text to dense embedding vectors and computes similarities like cosine distance to find relevant matches.",
        "ground_truth": "Vector embeddings represent semantic meaning, and nearest neighbor search finds similar documents via distance metrics.",
    }

    res = client.post("/api/v1/rag/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "id" in data
    assert data["retrieval_precision"] >= 0.0
    assert data["context_relevance"] > 0.3
    assert data["answer_relevance"] > 0.4
    assert data["faithfulness_score"] > 0.4
    assert data["composite_rag_score"] > 0.4
    assert "details" in data
    assert isinstance(data["flags"], list)

    # Check RAG history
    res_hist = client.get("/api/v1/rag/history")
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 1
    assert history[0]["id"] == data["id"]
