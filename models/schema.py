"""Contrato único compartilhado por treino e inferência."""

import numpy as np
import pandas as pd

FEATURE_SETS = {
    "spectral": ["ndvi", "ndbi", "latitude", "longitude"],
    "urban": [
        "ndvi",
        "ndbi",
        "latitude",
        "longitude",
        "building_height",
        "built_fraction",
    ],
}
RANGES = {
    "ndvi": (-1, 1),
    "ndbi": (-1, 1),
    "latitude": (-24.2, -23),
    "longitude": (-47.2, -45.8),
    "building_height": (0, 500),
    "built_fraction": (0, 1),
}


def validate_frame(frame, features, training=False):
    required = features + (["lst", "year"] if training else [])
    missing = set(required) - set(frame.columns)
    if missing:
        raise ValueError(f"Colunas ausentes: {sorted(missing)}")
    frame = frame.copy()
    for column in required:
        frame[column] = pd.to_numeric(frame[column], errors="raise")
        if np.isinf(frame[column]).any():
            raise ValueError(f"Infinito em {column}")
    if frame[features].isna().any().any():
        raise ValueError(
            "Features ausentes: complete o dataset antes de treinar ou prever"
        )
    for name in features:
        lower, upper = RANGES[name]
        if not frame[name].between(lower, upper).all():
            raise ValueError(f"{name} deve estar entre {lower} e {upper}")
    if training:
        if frame[["lst", "year"]].isna().any().any():
            raise ValueError("Alvo ou ano ausentes")
        if not frame.lst.between(-50, 100).all():
            raise ValueError("LST fora do intervalo físico aceito em °C")
        if not ((frame.year % 1 == 0) & frame.year.between(2013, 2100)).all():
            raise ValueError("Ano inválido")
        if frame.duplicated(
            ["latitude", "longitude", "year"]
            + (["scene_id"] if "scene_id" in frame else [])
        ).any():
            raise ValueError("Observações duplicadas por local/ano/cena")
    return frame
