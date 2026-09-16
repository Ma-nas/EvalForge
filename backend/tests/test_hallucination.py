"""
Tests for Hallucination Detection Routes (/api/v1/hallucination)
"""

def test_detect_hallucination_factual(client):
    context = (
        "The Apollo 11 mission was launched on July 16, 1969. "
        "Neil Armstrong and Buzz Aldrin were the first humans to land on the Moon on July 20, 1969."
    )
    output = "Neil Armstrong and Buzz Aldrin landed on the Moon during the Apollo 11 mission in July 1969."

    res = client.post("/api/v1/hallucination/detect", json={"context": context, "output": output})
    assert res.status_code == 200
    data = res.json()

    assert data["hallucination_score"] < 0.4
    assert data["supported_claims"] > 0
    assert "claims" in data
    assert "flags" in data

    # Verify history endpoint
    res_hist = client.get("/api/v1/hallucination/history")
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 1
    assert history[0]["id"] == data["id"]


def test_detect_hallucination_fabricated(client):
    context = (
        "The Eiffel Tower was built in Paris, France, and was completed in 1889. "
        "It was designed by Gustave Eiffel for the World's Fair."
    )
    output = (
        "The Eiffel Tower was built in Berlin, Germany in 1950 by Thomas Edison. "
        "It was constructed using solid titanium and laser cutting technology."
    )

    res = client.post("/api/v1/hallucination/detect", json={"context": context, "output": output})
    assert res.status_code == 200
    data = res.json()

    assert data["hallucination_score"] > 0.4
    assert data["unsupported_claims"] > 0
