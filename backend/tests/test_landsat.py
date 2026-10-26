from unittest.mock import patch, Mock
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.landsat import dn_to_celsius, search_scenes


def test_temperature():
    assert dn_to_celsius(0) is None
    assert dn_to_celsius(45000) == pytest.approx(29.6609)


def test_search_contract():
    response = Mock()
    response.json.return_value = {
        "features": [
            {
                "id": "test",
                "properties": {},
                "assets": {
                    "lwir11": {"href": "thermal"},
                    "qa_pixel": {"href": "quality"},
                },
            }
        ],
        "links": [],
    }
    with patch("backend.app.landsat.httpx.post", return_value=response):
        result = TestClient(app).get("/api/v1/landsat/scenes?year=2025")
        assert result.status_code == 200
        assert result.json()["scenes"][0]["requires_asset_signing"]


def test_invalid_year():
    with pytest.raises(ValueError):
        search_scenes(1900)
    assert TestClient(app).get("/api/v1/landsat/scenes?limit=101").status_code == 422
