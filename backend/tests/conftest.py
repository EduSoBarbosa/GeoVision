import mongomock
import pytest
from fastapi.testclient import TestClient

from backend.app import core
from backend.app.main import app


@pytest.fixture
def database(monkeypatch, tmp_path):
    client = mongomock.MongoClient(tz_aware=True)
    monkeypatch.setattr(core, "get_client", lambda: client)
    monkeypatch.setattr(core.settings, "data_dir", tmp_path)
    monkeypatch.setattr(core.settings, "dev_email_tokens", True)
    monkeypatch.setattr(core.settings, "admin_email", "admin@example.com")
    core.initialize()
    from backend.app.routers.ml import predictor

    predictor.cache_clear()
    return core.get_db()


@pytest.fixture
def client(database):
    with TestClient(app) as client:
        yield client


def register(client, email="admin@example.com"):
    body = {"email": email, "password": "Test-password-123"}
    result = client.post("/api/v1/auth/register", json=body)
    assert result.status_code == 201, result.text
    token = result.json()["development_verification_token"]
    assert client.post("/api/v1/auth/verify", json={"token": token}).status_code == 200
    login = client.post("/api/v1/auth/login", json=body)
    return {"Authorization": "Bearer " + login.json()["access_token"]}


@pytest.fixture
def headers(client):
    return register(client)
