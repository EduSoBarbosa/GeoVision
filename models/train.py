"""Experimento reproduzível com seleção na validação e teste reservado."""

import argparse
import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
import xgboost
from sklearn.base import clone
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

from models.schema import FEATURE_SETS, validate_frame


def split_data(frame, strategy="temporal"):
    """Temporal mede generalização para outro ano; spatial para outras células."""
    if strategy == "temporal":
        years = sorted(frame.year.unique())
        if len(years) < 3:
            raise ValueError("Divisão temporal requer ao menos 3 anos distintos")
        train = frame.index[frame.year < years[-2]]
        validation = frame.index[frame.year == years[-2]]
        test = frame.index[frame.year == years[-1]]
    elif strategy == "spatial":
        # Blocos aproximados de ~1 km em WGS84. Não é validação com buffer.
        groups = (
            np.floor(frame.latitude * 100).astype(str)
            + ":"
            + np.floor(frame.longitude * 100).astype(str)
        )
        if groups.nunique() < 10:
            raise ValueError("Divisão espacial requer ao menos 10 blocos geográficos")
        rest, test_pos = next(
            GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42).split(
                frame, groups=groups
            )
        )
        train_pos, val_pos = next(
            GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=43).split(
                frame.iloc[rest], groups=groups.iloc[rest]
            )
        )
        train, validation, test = (
            frame.index[rest[train_pos]],
            frame.index[rest[val_pos]],
            frame.index[test_pos],
        )
    else:
        raise ValueError("Estratégia deve ser temporal ou spatial")
    if len(train) < 20 or min(len(validation), len(test)) < 5:
        raise ValueError("Exige 20 observações de treino, 5 de validação e 5 de teste")
    return train, validation, test


def score(y, prediction):
    return {
        "mae": float(mean_absolute_error(y, prediction)),
        "rmse": float(mean_squared_error(y, prediction) ** 0.5),
        "r2": float(r2_score(y, prediction)) if np.var(y) > 0 else None,
    }


def candidates():
    return {
        "baseline_mean": DummyRegressor(strategy="mean"),
        "random_forest": RandomForestRegressor(
            n_estimators=100,
            min_samples_leaf=3,
            max_depth=12,
            random_state=42,
            n_jobs=2,
        ),
        "xgboost": XGBRegressor(
            n_estimators=160,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.85,
            colsample_bytree=0.9,
            objective="reg:squarederror",
            random_state=42,
            n_jobs=2,
        ),
    }


def train(csv, out, feature_set="spectral", strategy="temporal", synthetic=False):
    features = FEATURE_SETS[feature_set]
    data = validate_frame(pd.read_csv(csv), features, training=True).reset_index(
        drop=True
    )
    if len(data) > 100_000:
        raise ValueError("MVP limitado a 100 mil observações por experimento")
    train_idx, val_idx, test_idx = split_data(data, strategy)
    validation_scores, fitted = {}, {}
    for name, estimator in candidates().items():
        pipeline = Pipeline([("scale", StandardScaler()), ("regressor", estimator)])
        pipeline.fit(data.loc[train_idx, features], data.loc[train_idx, "lst"])
        validation_scores[name] = score(
            data.loc[val_idx, "lst"], pipeline.predict(data.loc[val_idx, features])
        )
        fitted[name] = pipeline
    winner = min(validation_scores, key=lambda name: validation_scores[name]["mae"])
    # Importância na validação, antes do refit. Não usa o teste para seleção.
    importance = permutation_importance(
        fitted[winner],
        data.loc[val_idx, features],
        data.loc[val_idx, "lst"],
        scoring="neg_mean_absolute_error",
        n_repeats=3,
        random_state=42,
        n_jobs=1,
    )
    final = clone(fitted[winner])
    development = train_idx.union(val_idx)
    final.fit(data.loc[development, features], data.loc[development, "lst"])
    predictions = final.predict(data.loc[test_idx, features])
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    joblib.dump(final, out / "pipeline.joblib")
    metadata = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "winner": winner,
        "features": features,
        "feature_set": feature_set,
        "strategy": strategy,
        "synthetic": synthetic,
        "purpose": "Reconstrução de LST com covariáveis contemporâneas; não previsão meteorológica futura",
        "dataset_sha256": hashlib.sha256(Path(csv).read_bytes()).hexdigest(),
        "artifact_sha256": hashlib.sha256(
            (out / "pipeline.joblib").read_bytes()
        ).hexdigest(),
        "validation": validation_scores,
        "test": score(data.loc[test_idx, "lst"], predictions),
        "split_sizes": {
            "train": len(train_idx),
            "validation": len(val_idx),
            "test": len(test_idx),
        },
        "split_years": {
            "train": sorted(data.loc[train_idx, "year"].astype(int).unique().tolist()),
            "validation": sorted(
                data.loc[val_idx, "year"].astype(int).unique().tolist()
            ),
            "test": sorted(data.loc[test_idx, "year"].astype(int).unique().tolist()),
        },
        "permutation_importance": dict(
            zip(features, importance.importances_mean.tolist())
        ),
        "training_ranges": {
            f: [
                float(data.loc[development, f].min()),
                float(data.loc[development, f].max()),
            ]
            for f in features
        },
        "versions": {
            "python": platform.python_version(),
            "sklearn": sklearn.__version__,
            "xgboost": xgboost.__version__,
        },
    }
    (out / "metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False)
    )
    residuals = data.loc[test_idx, ["latitude", "longitude", "year", "lst"]].copy()
    residuals["prediction"] = predictions
    residuals["error"] = predictions - residuals.lst
    residuals.to_csv(out / "test_predictions.csv", index=False)
    return metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv")
    parser.add_argument("--out", required=True)
    parser.add_argument("--feature-set", choices=list(FEATURE_SETS), default="spectral")
    parser.add_argument(
        "--strategy", choices=["temporal", "spatial"], default="temporal"
    )
    parser.add_argument("--synthetic", action="store_true")
    args = parser.parse_args()
    print(
        json.dumps(
            train(args.csv, args.out, args.feature_set, args.strategy, args.synthetic),
            indent=2,
        )
    )
