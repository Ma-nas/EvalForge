"""
Tests for LLM Evaluation Routes (/api/v1/evaluation)
"""

def test_evaluate_single(client):
    payload = {
        "prompt": "Explain photosynthesis in simple terms.",
        "context": "Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
        "expected_output": "Plants convert sunlight, carbon dioxide, and water into oxygen and glucose energy.",
        "actual_output": "Photosynthesis is how plants turn sunlight, CO2, and water into sugars and release oxygen.",
        "model_name": "gemini-1.5-flash",
    }
    res = client.post("/api/v1/evaluation/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "id" in data
    assert "semantic_similarity" in data
    assert data["semantic_similarity"] > 0.6
    assert "composite_score" in data
    assert data["composite_score"] > 0.6
    assert data["quality_label"] in ["Excellent", "Good", "Fair", "Poor", "Critical"]
    assert isinstance(data["flags"], list)


def test_evaluate_batch(client):
    payload = {
        "samples": [
            {
                "prompt": "What is the capital of Japan?",
                "context": "Japan is an island nation in East Asia. Tokyo is its capital city.",
                "expected_output": "Tokyo is the capital of Japan.",
                "actual_output": "The capital of Japan is Tokyo.",
            },
            {
                "prompt": "What is water made of?",
                "context": "Water consists of hydrogen and oxygen molecules in a 2:1 ratio.",
                "expected_output": "Water is composed of two hydrogen atoms and one oxygen atom (H2O).",
                "actual_output": "Water is H2O, made of hydrogen and oxygen.",
            }
        ],
        "model_name": "gpt-4o",
    }
    res = client.post("/api/v1/evaluation/evaluate/batch", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["total_samples"] == 2
    assert data["avg_semantic_similarity"] > 0.7
    assert len(data["results"]) == 2
    assert "quality_distribution" in data
