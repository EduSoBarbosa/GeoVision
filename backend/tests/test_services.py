from datetime import timedelta
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin

from backend.app import core
from backend.app.services.collection import collect_scene
from backend.app.services.mail import send_verification
from backend.app.worker import run_once
from models.demo import generate


def test_smtp_transport(database, monkeypatch):
    monkeypatch.setattr(core.settings, "dev_email_tokens", False)
    monkeypatch.setattr(core.settings, "smtp_starttls", True)
    monkeypatch.setattr(core.settings, "smtp_user", "sender")
    monkeypatch.setattr(core.settings, "smtp_password", "test-only")
    with patch("backend.app.services.mail.smtplib.SMTP") as smtp:
        send_verification("test@example.com", "one-time-code")
        connection = smtp.return_value.__enter__.return_value
        connection.starttls.assert_called_once()
        connection.login.assert_called_once()
        message = connection.send_message.call_args.args[0]
        assert message["To"] == "test@example.com"
        assert "one-time-code" in message.get_content()


def test_resend_and_mail_failure(client, monkeypatch):
    body = {"email": "resend@example.com", "password": "password123"}
    with patch("backend.app.routers.auth.send_verification", side_effect=OSError()):
        assert client.post("/api/v1/auth/register", json=body).status_code == 503
    result = client.post("/api/v1/auth/resend", json=body)
    assert result.status_code == 200
    assert (
        client.post(
            "/api/v1/auth/verify",
            json={"token": result.json()["development_verification_token"]},
        ).status_code
        == 200
    )
    assert client.post("/api/v1/auth/resend", json=body).status_code == 400


def test_local_spectral_collection(tmp_path):
    profile = dict(
        driver="GTiff",
        height=10,
        width=10,
        count=1,
        dtype="uint16",
        crs="EPSG:4326",
        transform=from_origin(-46.65, -23.55, 0.001, 0.001),
    )
    assets = {}
    for key, value in [("red", 12000), ("nir08", 20000), ("swir16", 18000)]:
        path = tmp_path / f"{key}.tif"
        with rasterio.open(path, "w", **profile) as dst:
            dst.write(np.full((10, 10), value, dtype="uint16"), 1)
        assets[key] = {"href": str(path)}

    def fake_download(scene, bbox, output):
        with rasterio.open(
            output, "w", **{**profile, "dtype": "float32", "nodata": -9999}
        ) as dst:
            dst.write(np.full((10, 10), 30, dtype="float32"), 1)
        return {"valid_fraction": 1.0}

    response = MagicMock()
    response.json.return_value = {
        "assets": assets,
        "properties": {"datetime": "2024-07-01T00:00:00Z"},
    }
    with (
        patch(
            "backend.app.services.collection.download_scene", side_effect=fake_download
        ),
        patch("backend.app.services.collection.httpx.get", return_value=response),
        patch(
            "backend.app.services.collection.planetary_computer.sign",
            side_effect=lambda x: x,
        ),
    ):
        frame, stats = collect_scene(
            "fixture", [-46.65, -23.56, -46.64, -23.55], tmp_path, sample_limit=20
        )
    assert len(frame) == 20
    assert frame.ndvi.iloc[0] == pytest.approx((0.35 - 0.13) / (0.35 + 0.13))
    assert frame.ndbi.iloc[0] == pytest.approx((0.295 - 0.35) / (0.295 + 0.35))
    assert stats["spectral_valid_samples"] == 20


def test_successful_csv_import_and_pagination(client, headers, tmp_path):
    frame = generate(tmp_path / "fixture.csv", 60)
    result = client.post(
        "/api/v1/datasets/import",
        headers=headers,
        json={"name": "Fixture", "csv": frame.to_csv(index=False)},
    )
    assert result.status_code == 201, result.text
    dataset = result.json()["id"]
    page1 = client.get(
        "/api/v1/map", params={"dataset_id": dataset, "limit": 10}, headers=headers
    ).json()
    page2 = client.get(
        "/api/v1/map",
        params={"dataset_id": dataset, "limit": 10, "offset": 10},
        headers=headers,
    ).json()
    assert {x["cell_id"] for x in page1["features"]}.isdisjoint(
        {x["cell_id"] for x in page2["features"]}
    )
    result = client.post(
        "/api/v1/datasets/upload",
        headers=headers,
        files={"file": ("fixture.csv", frame.to_csv(index=False).encode(), "text/csv")},
    )
    assert result.status_code == 201


def test_worker_reclaims_expired_lease(database):
    database.jobs.insert_one(
        {
            "id": "a" * 24,
            "kind": "demo",
            "payload": {},
            "owner": "admin@example.com",
            "status": "running",
            "lease_until": core.now() - timedelta(minutes=1),
            "attempts": 1,
            "created_at": core.now(),
        }
    )
    assert run_once()
    assert database.jobs.find_one({"id": "a" * 24})["attempts"] == 2
    assert database.jobs.find_one({"id": "a" * 24})["status"] == "completed"
    assert not run_once()
