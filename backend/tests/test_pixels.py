import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin
from backend.app.pixels import clean_pixels, process_assets, NODATA


def test_cloud_bits_and_water():
    dn = np.full((1, 9), 45000, dtype="uint16")
    dn[0, 8] = 0
    qa = np.array([[1, 2, 4, 8, 16, 32, 64, 128, 0]], dtype="uint16")
    lst, valid = clean_pixels(dn, qa)
    assert valid.tolist() == [[False] * 6 + [True, True, False]]
    assert lst[0, 6] == pytest.approx(29.6609, abs=0.0001)
    assert lst[0, 0] == NODATA


def test_local_geotiff_end_to_end(tmp_path):
    profile = dict(
        driver="GTiff",
        height=10,
        width=10,
        count=1,
        dtype="uint16",
        crs="EPSG:4326",
        transform=from_origin(-46.65, -23.55, 0.001, 0.001),
    )
    dn = np.full((10, 10), 45000, dtype="uint16")
    qa = np.zeros((10, 10), dtype="uint16")
    qa[:5] = 8
    for name, array in [("thermal", dn), ("qa", qa)]:
        with rasterio.open(tmp_path / f"{name}.tif", "w", **profile) as dst:
            dst.write(array, 1)
    output = tmp_path / "out.tif"
    stats = process_assets(
        tmp_path / "thermal.tif",
        tmp_path / "qa.tif",
        [-46.65, -23.56, -46.64, -23.55],
        output,
    )
    assert stats["valid_fraction"] == 0.5
    with rasterio.open(output) as src:
        data = src.read(1, masked=True)
        assert data.count() == 50
        assert src.tags()["units"] == "degC"
    with pytest.raises(ValueError):
        process_assets("", "", [0, 0, 1, 1], output)


def test_download_route(monkeypatch):
    from fastapi.testclient import TestClient
    from backend.app import main, pixels

    monkeypatch.setattr(main, "user", lambda token: {"email": "test@example.com"})

    def fake_download(scene, bbox, output):
        output.write_bytes(b"test-raster")
        return {"valid_fraction": 0.5}

    monkeypatch.setattr(pixels, "download_scene", fake_download)
    result = TestClient(main.app).post(
        "/api/v1/landsat/download",
        json={"scene_id": "test", "bbox": [-46.65, -23.56, -46.64, -23.55]},
    )
    assert result.status_code == 200
    assert result.content == b"test-raster"
    assert "attachment" in result.headers["content-disposition"]
