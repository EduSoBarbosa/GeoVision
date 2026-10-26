"""Leitura remota por janela e máscara QA para Landsat 8/9 Collection 2."""

import math
import re

import httpx
import numpy as np
import planetary_computer
import rasterio
from rasterio.warp import transform_bounds
from rasterio.windows import Window, from_bounds

CATALOG = "https://planetarycomputer.microsoft.com/api/stac/v1"
NODATA = -9999.0
MAX_PIXELS = 4_000_000


def clean_pixels(dn, qa, missing=None):
    """Remove fill, dilated cloud, cirrus, cloud, shadow e snow (bits 0–5).

    Água é preservada. Não interpola lacunas nem garante ausência de toda nuvem.
    """
    if dn.shape != qa.shape:
        raise ValueError("Grades térmica e QA incompatíveis")
    invalid = (dn == 0) | ((qa.astype("uint16") & 63) != 0)
    if missing is not None:
        invalid |= missing
    result = dn.astype("float32") * 0.00341802 + 149.0 - 273.15
    result[invalid] = NODATA
    return result, ~invalid


def process_assets(thermal_url, qa_url, bbox, output):
    """Lê somente a janela solicitada e grava GeoTIFF em °C no CRS original."""
    west, south, east, north = bbox
    if not (-46.85 <= west < east <= -46.3 and -24.05 <= south < north <= -23.3):
        raise ValueError("BBox deve estar na região suportada de São Paulo")
    with rasterio.Env(GDAL_HTTP_TIMEOUT="30", GDAL_HTTP_MAX_RETRY="2"):
        with rasterio.open(thermal_url) as thermal, rasterio.open(qa_url) as quality:
            if not thermal.crs or (thermal.crs, thermal.transform, thermal.shape) != (
                quality.crs,
                quality.transform,
                quality.shape,
            ):
                raise ValueError("Rasters devem ter mesmo CRS, resolução e alinhamento")
            bounds = transform_bounds("EPSG:4326", thermal.crs, *bbox, densify_pts=21)
            raw = from_bounds(*bounds, transform=thermal.transform)
            left, top = max(0, math.floor(raw.col_off)), max(0, math.floor(raw.row_off))
            right = min(thermal.width, math.ceil(raw.col_off + raw.width))
            bottom = min(thermal.height, math.ceil(raw.row_off + raw.height))
            if right <= left or bottom <= top:
                raise ValueError("Área não intersecta a cena")
            window = Window(left, top, right - left, bottom - top)
            if window.width * window.height > MAX_PIXELS:
                raise ValueError("Recorte excede 4 milhões de pixels; reduza a área")
            dn = thermal.read(1, window=window, masked=True)
            qa = quality.read(1, window=window, masked=True)
            lst, valid = clean_pixels(
                dn.data, qa.data, np.ma.getmaskarray(dn) | np.ma.getmaskarray(qa)
            )
            profile = dict(
                driver="GTiff",
                height=lst.shape[0],
                width=lst.shape[1],
                count=1,
                dtype="float32",
                crs=thermal.crs,
                transform=thermal.window_transform(window),
                nodata=NODATA,
                compress="deflate",
            )
            with rasterio.open(output, "w", **profile) as dst:
                dst.write(lst, 1)
                dst.update_tags(
                    units="degC",
                    mask_policy="QA_PIXEL bits 0-5; fill and source nodata",
                    valid_pixels=int(valid.sum()),
                    total_pixels=int(valid.size),
                )
    return {
        "valid_pixels": int(valid.sum()),
        "total_pixels": int(valid.size),
        "valid_fraction": float(valid.mean()),
    }


def download_scene(scene_id, bbox, output):
    """Resolve assets no catálogo fixo; nunca aceita URL arbitrário do cliente."""
    if not re.fullmatch(r"LC0[89]_L2SP_[A-Za-z0-9_]{10,100}", scene_id):
        raise ValueError("Use um identificador L2SP Landsat 8/9 retornado pela busca")
    response = httpx.get(
        f"{CATALOG}/collections/landsat-c2-l2/items/{scene_id}", timeout=30
    )
    response.raise_for_status()
    item = response.json()
    assets = item["assets"]
    thermal = assets.get("lwir11") or assets.get("ST_B10")
    quality = assets.get("qa_pixel") or assets.get("QA_PIXEL")
    if not thermal or not quality:
        raise ValueError("Cena sem temperatura de superfície ou QA_PIXEL")
    stats = process_assets(
        planetary_computer.sign(thermal["href"]),
        planetary_computer.sign(quality["href"]),
        bbox,
        output,
    )
    with rasterio.open(output, "r+") as dst:
        dst.update_tags(
            scene_id=scene_id,
            acquired_at=item["properties"].get("datetime", ""),
            source="Microsoft Planetary Computer / USGS Landsat Collection 2 L2",
        )
    return stats
