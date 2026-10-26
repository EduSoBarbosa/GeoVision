"""Dataset tabular persistido e observações geográficas consultáveis."""

import numpy as np
import pandas as pd

from backend.app.core import get_db, new_id, now, settings
from models.schema import FEATURE_SETS, validate_frame


def dataset_directory(identity):
    directory = settings.data_dir / "datasets" / identity
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def store_dataset(
    frame, owner, name, source, synthetic=False, identity=None, raster=False
):
    identity = identity or new_id()
    features = (
        FEATURE_SETS["urban"]
        if set(FEATURE_SETS["urban"]) <= set(frame.columns)
        else FEATURE_SETS["spectral"]
    )
    frame = validate_frame(frame, features, training=True)
    if not 5 <= len(frame) <= 100_000:
        raise ValueError("Dataset exige entre 5 e 100 mil linhas")
    path = dataset_directory(identity) / "dataset.csv"
    frame.to_csv(path, index=False)
    rows = []
    for index, row in frame.reset_index(drop=True).iterrows():
        props = {key: float(row[key]) for key in features + ["lst"]}
        props.update(
            year=int(row.year),
            scene_id=str(row.get("scene_id", source)),
            synthetic=synthetic,
        )
        rows.append(
            {
                "dataset_id": identity,
                "cell_id": str(index),
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row.longitude), float(row.latitude)],
                },
                "properties": props,
            }
        )
    # Idempotência de retry: documentos identificados por dataset/célula.
    collection = get_db().observations
    collection.delete_many({"dataset_id": identity})
    for offset in range(0, len(rows), 1000):
        collection.insert_many(rows[offset : offset + 1000])
    summary = {
        "id": identity,
        "owner": owner,
        "name": name,
        "source": source,
        "synthetic": synthetic,
        "rows": len(frame),
        "features": features,
        "years": sorted(frame.year.astype(int).unique().tolist()),
        "lst": {
            "min": float(frame.lst.min()),
            "mean": float(frame.lst.mean()),
            "max": float(frame.lst.max()),
        },
        "bbox": [
            float(frame.longitude.min()),
            float(frame.latitude.min()),
            float(frame.longitude.max()),
            float(frame.latitude.max()),
        ],
        "created_at": now(),
        "has_raster": raster,
    }
    get_db().datasets.replace_one({"id": identity}, summary, upsert=True)
    return summary


def load_dataset(identity):
    return pd.read_csv(dataset_directory(identity) / "dataset.csv")


def demo_geojson():
    """Exemplo leve público para explorar a interface sem login."""
    rng = np.random.default_rng(42)
    features = []
    for i in range(16):
        for j in range(16):
            ndvi = float(rng.uniform(0.05, 0.85))
            ndbi = float(rng.uniform(-0.2, 0.6))
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-46.72 + j * 0.011, -23.64 + i * 0.011],
                    },
                    "properties": {
                        "lst": round(31 - 8 * ndvi + 5 * ndbi, 2),
                        "ndvi": ndvi,
                        "ndbi": ndbi,
                        "year": 2024,
                        "synthetic": True,
                    },
                }
            )
    return {
        "type": "FeatureCollection",
        "features": features,
        "synthetic": True,
        "notice": "Demonstração sintética. Não representa medições de São Paulo.",
    }
