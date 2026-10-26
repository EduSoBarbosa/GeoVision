from unittest.mock import Mock, patch

import httpx
import numpy as np
import pytest

from backend.app.landsat import dn_to_celsius, search_scenes
from backend.app.services.collection import normalized_difference


def test_temperature():
    assert dn_to_celsius(0) is None
    assert dn_to_celsius(45000) == pytest.approx(29.6609)


def test_search_contract(client):
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
        result = client.get("/api/v1/landsat/scenes?year=2025")
        assert result.status_code == 200
        assert result.json()["scenes"][0]["requires_asset_signing"]
    with patch(
        "backend.app.landsat.httpx.post", side_effect=httpx.ConnectError("failed")
    ):
        assert client.get("/api/v1/landsat/scenes").status_code == 502


def test_invalid_year_and_indices(client):
    with pytest.raises(ValueError):
        search_scenes(1900)
    assert client.get("/api/v1/landsat/scenes?limit=101").status_code == 422
    values = normalized_difference(np.array([0.6, 0]), np.array([0.2, 0]))
    assert values[0] == pytest.approx(0.5)
    assert np.isnan(values[1])
