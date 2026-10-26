import io
import shutil
import tempfile
from pathlib import Path

import httpx
import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import Field
from rasterio.errors import RasterioError
from starlette.background import BackgroundTask

from backend.app.core import consume_quota, current_user, get_db, now, owned, settings
from backend.app.landsat import search_scenes
from backend.app.pixels import download_scene
from backend.app.schemas import DemoRequest, PixelDownload, StrictModel
from backend.app.services.datasets import demo_geojson, store_dataset
from backend.app.services.jobs import enqueue

router = APIRouter(prefix="/api/v1", tags=["Dados e Landsat"])


@router.get("/demo/map")
def demo_map():
    return demo_geojson()


@router.get("/map")
def map_data(
    dataset_id: str,
    account=Depends(current_user),
    limit: int = Query(2000, ge=1, le=5000),
    offset: int = Query(0, ge=0),
):
    dataset = owned("datasets", dataset_id, account)
    rows = list(
        get_db()
        .observations.find({"dataset_id": dataset_id}, {"_id": 0, "dataset_id": 0})
        .sort("cell_id", 1)
        .skip(offset)
        .limit(limit)
    )
    return {
        "type": "FeatureCollection",
        "features": rows,
        "synthetic": dataset["synthetic"],
        "total": dataset["rows"],
        "offset": offset,
        "has_more": offset + len(rows) < dataset["rows"],
    }


@router.get("/datasets")
def datasets(account=Depends(current_user)):
    return list(
        get_db()
        .datasets.find({"owner": account["email"]}, {"_id": 0})
        .sort("created_at", -1)
        .limit(100)
    )


@router.post("/datasets/upload", status_code=201)
async def upload_dataset(file: UploadFile = File(...), account=Depends(current_user)):
    raw = await file.read(20 * 1024 * 1024 + 1)
    if len(raw) > 20 * 1024 * 1024:
        raise HTTPException(413, "CSV limitado a 20 MiB")
    try:
        frame = pd.read_csv(io.BytesIO(raw))
        return store_dataset(
            frame,
            account["email"],
            Path(file.filename or "dataset.csv").name[:100],
            "uploaded_csv",
        )
    except (ValueError, UnicodeError) as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/datasets/{dataset_id}/download")
def dataset_download(
    dataset_id: str,
    kind: str = Query("csv", pattern="^(csv|tif)$"),
    account=Depends(current_user),
):
    dataset = owned("datasets", dataset_id, account)
    if kind == "tif" and not dataset.get("has_raster"):
        raise HTTPException(404, "Este dataset não possui raster")
    path = (
        settings.data_dir
        / "datasets"
        / dataset_id
        / ("dataset.csv" if kind == "csv" else "lst.tif")
    )
    if not path.exists():
        raise HTTPException(404, "Arquivo indisponível")
    return FileResponse(path, filename=f"geovision-{dataset_id}.{kind}")


@router.post("/datasets/demo", status_code=202)
def demo(body: DemoRequest, account=Depends(current_user)):
    return enqueue("demo", {}, account["email"])


@router.get("/landsat/scenes")
def scenes(
    year: int = Query(2025, ge=2013, le=2100),
    cloud_cover: float = Query(20, ge=0, le=100),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        return search_scenes(year, cloud_cover, limit)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(502, "Catálogo indisponível") from exc


@router.post("/landsat/collect", status_code=202)
def collect(body: PixelDownload, account=Depends(current_user)):
    return enqueue("collect", body.model_dump(), account["email"])


@router.post("/landsat/download")
def download(body: PixelDownload, account=Depends(current_user)):
    consume_quota("raster:" + account["email"] + now().strftime("%Y%m%d%H"), 20)
    directory = Path(tempfile.mkdtemp(prefix="geovision-"))
    output = directory / "lst.tif"
    try:
        stats = download_scene(body.scene_id, body.bbox, output)
        return FileResponse(
            output,
            filename="lst_celsius.tif",
            media_type="image/tiff",
            headers={"X-Valid-Fraction": str(stats["valid_fraction"])},
            background=BackgroundTask(shutil.rmtree, directory),
        )
    except Exception as exc:
        shutil.rmtree(directory, ignore_errors=True)
        if isinstance(exc, ValueError):
            raise HTTPException(422, str(exc)) from exc
        if isinstance(exc, (httpx.HTTPError, RasterioError)):
            raise HTTPException(502, "Erro externo ao processar a cena") from exc
        raise


@router.get("/jobs")
def jobs(account=Depends(current_user)):
    return list(
        get_db()
        .jobs.find({"owner": account["email"]}, {"_id": 0})
        .sort("created_at", -1)
        .limit(100)
    )


@router.get("/jobs/{job_id}")
def job(job_id: str, account=Depends(current_user)):
    return owned("jobs", job_id, account)


class CsvImport(StrictModel):
    name: str = Field(default="Dataset importado", min_length=1, max_length=100)
    csv: str = Field(min_length=10, max_length=2_000_000)


@router.post("/datasets/import", status_code=201)
def import_csv(body: CsvImport, account=Depends(current_user)):
    try:
        return store_dataset(
            pd.read_csv(io.StringIO(body.csv)),
            account["email"],
            body.name,
            "uploaded_csv",
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
