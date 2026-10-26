from backend.app.worker import run_once


def test_full_training_consumption_and_explanation(client, headers):
    job = client.post(
        "/api/v1/datasets/demo", json={"confirm_synthetic": True}, headers=headers
    ).json()
    run_once()
    dataset = client.get("/api/v1/jobs/" + job["id"], headers=headers).json()["result"][
        "dataset_id"
    ]
    train_job = client.post(
        "/api/v1/ml/train", json={"dataset_ids": [dataset]}, headers=headers
    )
    assert train_job.status_code == 202, train_job.text
    run_once()
    finished = client.get(
        "/api/v1/jobs/" + train_job.json()["id"], headers=headers
    ).json()
    assert finished["status"] == "completed", finished
    identity = finished["result"]["model_id"]
    assert (
        client.get(
            "/api/v1/ml/models/" + identity + "/report", headers=headers
        ).status_code
        == 200
    )
    assert len(client.get("/api/v1/ml/models", headers=headers).json()) == 1
    rows = [{"ndvi": 0.5, "ndbi": 0.1, "latitude": -23.55, "longitude": -46.63}]
    predicted = client.post(
        "/api/v1/ml/predict", headers=headers, json={"model_id": identity, "rows": rows}
    )
    assert predicted.status_code == 200, predicted.text
    assert predicted.json()["synthetic"] is True
    explanation = client.post(
        "/api/v1/ml/explain", headers=headers, json={"model_id": identity, "rows": rows}
    )
    assert explanation.status_code == 200, explanation.text
    detail = explanation.json()
    assert (
        abs(
            detail["base_value"]
            + sum(detail["contributions"].values())
            - detail["prediction"]
        )
        < 0.001
    )
    assert (
        client.post(
            "/api/v1/ml/models/" + identity + "/activate", headers=headers
        ).status_code
        == 409
    )
    assert (
        client.post(
            "/api/v1/ml/predict",
            headers=headers,
            json={"model_id": identity, "rows": [{"ndvi": 2}]},
        ).status_code
        == 422
    )
