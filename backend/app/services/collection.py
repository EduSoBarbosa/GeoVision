"""Converte recorte Landsat em amostras com LST, NDVI e NDBI."""

from contextlib import ExitStack

import httpx
import numpy as np
import pandas as pd
import planetary_computer
import rasterio
from rasterio.warp import transform

from backend.app.pixels import CATALOG, download_scene


def normalized_difference(a, b):
    denominator = a + b
    return np.divide(
        a - b,
        denominator,
        out=np.full_like(a, np.nan, dtype=float),
        where=np.abs(denominator) > 1e-8,
    )


def collect_scene(scene_id, bbox, directory, sample_limit=10000):
    raster = directory / "lst.tif"
    stats = download_scene(scene_id, bbox, raster)
    response = httpx.get(
        f"{CATALOG}/collections/landsat-c2-l2/items/{scene_id}", timeout=30
    )
    response.raise_for_status()
    item = response.json()
    with rasterio.open(raster) as src:
        thermal = src.read(1, masked=True)
        positions = np.argwhere(~np.ma.getmaskarray(thermal))
        if len(positions) < 5:
            raise ValueError("Menos de cinco pixels válidos após máscara de nuvens")
        # Amostragem determinística; raster integral do recorte permanece disponível.
        positions = positions[
            np.linspace(
                0, len(positions) - 1, min(sample_limit, len(positions)), dtype=int
            )
        ]
        rows, cols = positions[:, 0], positions[:, 1]
        xs, ys = rasterio.transform.xy(src.transform, rows, cols)
        longitude, latitude = transform(src.crs, "EPSG:4326", xs, ys)
        values = thermal.data[rows, cols]
    reflectances = {}
    with ExitStack() as stack:
        for key, fallback in [
            ("red", "SR_B4"),
            ("nir08", "SR_B5"),
            ("swir16", "SR_B6"),
        ]:
            asset = item["assets"].get(key) or item["assets"].get(fallback)
            if not asset:
                raise ValueError(f"Banda espectral ausente: {key}")
            dataset = stack.enter_context(
                rasterio.open(planetary_computer.sign(asset["href"]))
            )
            sx, sy = transform("EPSG:4326", dataset.crs, longitude, latitude)
            sampled = np.ma.vstack(
                list(dataset.sample(zip(sx, sy), indexes=1, masked=True))
            )[:, 0]
            raw = sampled.filled(0).astype(float)
            reflectances[key] = np.where(raw == 0, np.nan, raw * 0.0000275 - 0.2)
    ndvi = normalized_difference(reflectances["nir08"], reflectances["red"])
    ndbi = normalized_difference(reflectances["swir16"], reflectances["nir08"])
    year = int(item["properties"]["datetime"][:4])
    frame = pd.DataFrame(
        {
            "latitude": latitude,
            "longitude": longitude,
            "lst": values,
            "ndvi": ndvi,
            "ndbi": ndbi,
            "year": year,
            "scene_id": scene_id,
        }
    )
    frame = frame.dropna()
    frame = frame[frame.ndvi.between(-1, 1) & frame.ndbi.between(-1, 1)]
    stats["spectral_valid_samples"] = len(frame)
    if len(frame) < 5:
        raise ValueError("Amostras espectrais válidas insuficientes")
    return frame, stats
