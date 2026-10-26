from unittest.mock import patch

from backend.app.core import now
from backend.app.worker import run_once
from backend.tests.conftest import register


def test_authentication(client, database):
    body = {"email": "one@example.com", "password": "password123"}
    first = client.post("/api/v1/auth/register", json=body)
    assert first.status_code == 201
    assert client.post("/api/v1/auth/register", json=body).status_code == 409
    assert client.post("/api/v1/auth/login", json=body).status_code == 403
    assert (
        client.post("/api/v1/auth/verify", json={"token": "x" * 32}).status_code == 400
    )
    token = first.json()["development_verification_token"]
    assert client.post("/api/v1/auth/verify", json={"token": token}).status_code == 200
    assert client.post("/api/v1/auth/verify", json={"token": token}).status_code == 400
    assert (
        client.post(
            "/api/v1/auth/login", json={**body, "password": "wrongpassword"}
        ).status_code
        == 401
    )
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/health/live").status_code == 200
    for path in [
        "/api/v1/about",
        "/api/v1/plans",
        "/api/v1/demo/map",
        "/api/v1/ml/status",
        "/openapi.json",
    ]:
        assert client.get(path).status_code == 200
    assert (
        database.users.find_one({"email": body["email"]})["password"]
        != body["password"]
    )


def test_area_ownership_and_validation(client, headers):
    other = register(client, "other@example.com")
    body = {
        "name": "Visita",
        "coordinates": [[-46.6, -23.5], [-46.61, -23.5], [-46.61, -23.51]],
    }
    response = client.post("/api/v1/areas", json=body, headers=headers)
    assert response.status_code == 201
    identity = response.json()["id"]
    assert client.get("/api/v1/areas", headers=other).json() == []
    assert client.delete(f"/api/v1/areas/{identity}", headers=other).status_code == 404
    assert (
        client.put(
            f"/api/v1/areas/{identity}",
            json={**body, "status": "concluida", "visit_date": "2026-12-01"},
            headers=headers,
        ).status_code
        == 200
    )
    invalid = {**body, "coordinates": [[-46.6, -23.5]] * 3}
    assert (
        client.post("/api/v1/areas", json=invalid, headers=headers).status_code == 422
    )
    assert (
        client.delete(f"/api/v1/areas/{identity}", headers=headers).status_code == 200
    )


def test_demo_job_dataset_keys_and_quota(client, headers, database):
    response = client.post(
        "/api/v1/datasets/demo", json={"confirm_synthetic": True}, headers=headers
    )
    assert response.status_code == 202
    assert run_once()
    job = client.get("/api/v1/jobs/" + response.json()["id"], headers=headers).json()
    assert job["status"] == "completed"
    dataset = job["result"]["dataset_id"]
    assert client.get("/api/v1/datasets", headers=headers).json()[0]["synthetic"]
    assert (
        client.get(
            "/api/v1/datasets/" + dataset + "/download", headers=headers
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/datasets/" + dataset + "/download?kind=tif", headers=headers
        ).status_code
        == 404
    )
    assert client.get(
        "/api/v1/map?dataset_id=" + dataset + "&limit=10", headers=headers
    ).json()["has_more"]
    key = client.post("/api/v1/keys", headers=headers).json()
    request_headers = {"X-API-Key": key["key"]}
    assert (
        client.get(
            "/api/v1/developer/lst?dataset_id=" + dataset, headers=request_headers
        ).status_code
        == 200
    )
    database.usage.update_one(
        {"_id": "admin@example.com" + now().strftime("%Y-%m")}, {"$set": {"count": 100}}
    )
    assert (
        client.get(
            "/api/v1/developer/lst?dataset_id=" + dataset, headers=request_headers
        ).status_code
        == 429
    )
    assert client.get("/api/v1/usage", headers=headers).json()["requests"] == 100
    assert client.get("/api/v1/keys", headers=headers).json()[0].get("hash") is None
    assert (
        client.delete("/api/v1/keys/" + key["id"], headers=headers).status_code == 200
    )
    assert (
        client.get(
            "/api/v1/developer/lst?dataset_id=" + dataset, headers=request_headers
        ).status_code
        == 401
    )
    assert client.get("/api/v1/jobs", headers=headers).status_code == 200


def test_failed_job_and_training_permissions(client, headers, database):
    other = register(client, "other@example.com")
    assert (
        client.post(
            "/api/v1/ml/train", headers=other, json={"dataset_ids": ["missing"]}
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/v1/ml/predict", headers=headers, json={"rows": [{"ndvi": 0.4}]}
        ).status_code
        == 503
    )
    with patch("backend.app.worker.execute", side_effect=ValueError("invalid data")):
        job = client.post(
            "/api/v1/datasets/demo", headers=headers, json={"confirm_synthetic": True}
        ).json()
        run_once()
        assert database.jobs.find_one({"id": job["id"]})["status"] == "failed"


def test_import_errors_and_throttle(client, headers, database):
    assert (
        client.post(
            "/api/v1/datasets/import",
            headers=headers,
            json={"csv": "a,b\n1,2", "name": "Invalid"},
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/datasets/upload",
            headers=headers,
            files={"file": ("test.csv", b"a,b\n1,2", "text/csv")},
        ).status_code
        == 422
    )
    for _ in range(21):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "absent@example.com", "password": "password123"},
        )
    assert response.status_code == 429


def test_health_ready_and_database_failure(client, database, monkeypatch):
    from pymongo.errors import ServerSelectionTimeoutError

    monkeypatch.setattr(database, "command", lambda *args, **kwargs: {"ok": 1})
    assert client.get("/health").status_code == 200

    def failure(*args, **kwargs):
        raise ServerSelectionTimeoutError("unavailable")

    monkeypatch.setattr(database, "command", failure)
    assert client.get("/health").status_code == 503


def test_real_model_activation_contract(client, headers, database, monkeypatch):
    from unittest.mock import Mock

    from backend.app.routers import ml

    identity = "f" * 24
    database.models.insert_one(
        {
            "id": identity,
            "owner": "admin@example.com",
            "synthetic": False,
            "winner": "xgboost",
        }
    )
    predictor = Mock()
    predictor.predict.return_value = {
        "lst_celsius": [25.0],
        "warnings": [],
        "synthetic": False,
    }
    monkeypatch.setattr(ml, "predictor", lambda value: predictor)
    assert (
        client.post(
            "/api/v1/ml/models/" + identity + "/activate", headers=headers
        ).status_code
        == 200
    )
    assert client.get("/api/v1/ml/status").json()["ready"]
    result = client.post(
        "/api/v1/ml/predict",
        headers=headers,
        json={
            "rows": [{"ndvi": 0.5, "ndbi": 0.1, "latitude": -23.5, "longitude": -46.6}]
        },
    )
    assert result.json()["lst_celsius"] == [25.0]
    assert (
        client.get(
            "/api/v1/ml/models/" + identity + "/report", headers=headers
        ).status_code
        == 404
    )
