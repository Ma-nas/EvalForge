"""
Tests for Dataset Management Routes (/api/v1/datasets) and Export Routes (/api/v1/export)
"""

def test_dataset_seed_and_batch_evaluate(client):
    # 1. Seed default datasets
    res_seed = client.post("/api/v1/datasets/seed")
    assert res_seed.status_code == 200
    datasets = res_seed.json()["datasets"]
    assert len(datasets) >= 1

    # Pick the first dataset
    ds = datasets[0]
    ds_id = ds["id"]

    # 2. Get dataset details
    res_detail = client.get(f"/api/v1/datasets/{ds_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["filename"] == ds["filename"]

    # 3. Get dataset rows
    res_data = client.get(f"/api/v1/datasets/{ds_id}/data?limit=5")
    assert res_data.status_code == 200
    assert len(res_data.json()["data"]) <= 5

    # 4. Batch evaluate dataset rows
    res_eval = client.post(
        f"/api/v1/datasets/{ds_id}/evaluate",
        json={"max_samples": 3, "model_name": "gemini-1.5-flash"},
    )
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["total_samples"] >= 1
    assert "avg_composite_score" in eval_data


def test_export_endpoints(client):
    # Ensure at least one evaluation exists
    client.post(
        "/api/v1/evaluation/evaluate",
        json={
            "prompt": "Test prompt for export",
            "expected_output": "Expected output",
            "actual_output": "Actual output",
        },
    )

    # 1. Export evaluations as JSON
    res_json = client.get("/api/v1/export/evaluations?format=json")
    assert res_json.status_code == 200
    assert "application/json" in res_json.headers["content-type"]
    evals = res_json.json()
    assert len(evals) >= 1

    # 2. Export evaluations as CSV
    res_csv = client.get("/api/v1/export/evaluations?format=csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "prompt" in res_csv.text
