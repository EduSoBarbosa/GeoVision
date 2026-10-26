"""Treino offline. Divisão temporal; normalização ajustada somente no treino."""

import argparse, json
from pathlib import Path
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import joblib

FEATURES = [
    "ndvi",
    "ndbi",
    "building_height",
    "built_fraction",
    "latitude",
    "longitude",
]


def train(csv, out):
    data = pd.read_csv(csv)
    required = FEATURES + ["lst", "year"]
    if not set(required) <= set(data):
        raise ValueError("Colunas necessárias: " + ",".join(required))
    data = data.dropna(subset=["lst", "year"])
    year = data.year.max()
    a = data[data.year < year]
    b = data[data.year == year]
    if len(a) < 20 or len(b) < 2:
        raise ValueError("Exige >=20 linhas anteriores e >=2 no ano de teste")
    if a[FEATURES].isna().all().any():
        raise ValueError("Feature sem observações no treino")
    model = Pipeline(
        [
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            (
                "xgb",
                XGBRegressor(n_estimators=100, max_depth=4, n_jobs=2, random_state=42),
            ),
        ]
    )
    model.fit(a[FEATURES], a.lst)
    pred = model.predict(b[FEATURES])
    metrics = {
        "mae": mean_absolute_error(b.lst, pred),
        "rmse": mean_squared_error(b.lst, pred) ** 0.5,
        "r2": r2_score(b.lst, pred),
        "test_year": int(year),
        "train_rows": len(a),
        "test_rows": len(b),
    }
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, out / "pipeline.joblib")
    (out / "metrics.json").write_text(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("--out", default="models/artifacts")
    a = p.parse_args()
    print(train(a.csv, a.out))
