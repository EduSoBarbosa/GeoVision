import numpy as np
import pytest

from models.demo import generate
from models.inference import Predictor
from models.schema import FEATURE_SETS, validate_frame
from models.train import split_data, train


def test_split_and_validation(tmp_path):
    frame = generate(tmp_path / "input.csv", 300)
    train_idx, val_idx, test_idx = split_data(frame)
    assert frame.loc[train_idx, "year"].max() < frame.loc[val_idx, "year"].min()
    assert frame.loc[val_idx, "year"].max() < frame.loc[test_idx, "year"].min()
    groups = (
        np.floor(frame.latitude * 100).astype(str)
        + ":"
        + np.floor(frame.longitude * 100).astype(str)
    )
    a, b, c = split_data(frame, "spatial")
    assert not set(groups[a]) & set(groups[b])
    assert not set(groups[a]) & set(groups[c])
    assert not set(groups[b]) & set(groups[c])
    frame.loc[0, "ndvi"] = np.inf
    with pytest.raises(ValueError):
        validate_frame(frame, FEATURE_SETS["spectral"], True)


def test_artifact_reproducibility_and_hash(tmp_path):
    frame = generate(tmp_path / "input.csv", 300)
    out = tmp_path / "model"
    metadata = train(tmp_path / "input.csv", out, synthetic=True)
    assert metadata["test"]["mae"] < 2
    assert set(metadata["validation"]) == {"baseline_mean", "random_forest", "xgboost"}
    model = Predictor(out)
    rows = frame[FEATURE_SETS["spectral"]].head(3).to_dict("records")
    assert len(model.predict(rows)["lst_celsius"]) == 3
    with pytest.raises(ValueError):
        model.predict([{"lst": 20}])
    (out / "pipeline.joblib").write_bytes(b"corrupted")
    with pytest.raises(ValueError):
        Predictor(out)


def test_insufficient_temporal_data(tmp_path):
    frame = generate(tmp_path / "input.csv", 100)
    frame["year"] = 2024
    with pytest.raises(ValueError):
        split_data(frame)
