import mongomock
from fastapi.testclient import TestClient
from backend.app import main


def test_workflow():
    main.db = mongomock.MongoClient().geovision
    c = TestClient(main.app)
    credentials = {"email": "edu@example.com", "password": "senha12345"}
    r = c.post("/api/v1/auth/register", json=credentials)
    assert r.status_code == 201
    assert c.post("/api/v1/auth/login", json=credentials).status_code == 403
    assert (
        c.post(
            "/api/v1/auth/verify",
            json={"token": r.json()["development_verification_token"]},
        ).status_code
        == 200
    )
    token = c.post("/api/v1/auth/login", json=credentials).json()["access_token"]
    h = {"Authorization": "Bearer " + token}
    assert c.get("/api/v1/map").json()["empty"]
    a = c.post(
        "/api/v1/areas",
        headers=h,
        json={
            "name": "Teste",
            "coordinates": [[-46.6, -23.5], [-46.61, -23.5], [-46.61, -23.51]],
        },
    )
    assert a.status_code == 201
    assert len(c.get("/api/v1/areas", headers=h).json()) == 1
    assert c.delete("/api/v1/areas/" + a.json()["id"], headers=h).status_code == 200
    key = c.post("/api/v1/keys", headers=h).json()["key"]
    assert c.get("/api/v1/developer/lst", headers={"X-API-Key": key}).status_code == 200
    assert c.get("/api/v1/developer/lst").status_code == 401
    assert c.post("/api/v1/ml/predict").status_code == 503
    for path in ["about", "plans", "ml/status"]:
        assert c.get("/api/v1/" + path).status_code == 200
