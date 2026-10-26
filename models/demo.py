"""Dados explicitamente sintéticos para exercitar o pipeline, nunca validar ciência."""

import argparse
from pathlib import Path

import numpy as np
import pandas as pd


def generate(path, n=900):
    rng = np.random.default_rng(42)
    frame = pd.DataFrame(
        {
            "ndvi": rng.uniform(0, 0.85, n),
            "ndbi": rng.uniform(-0.4, 0.7, n),
            "latitude": rng.uniform(-23.7, -23.4, n),
            "longitude": rng.uniform(-46.8, -46.4, n),
            "year": np.resize([2022, 2023, 2024], n),
        }
    )
    frame["lst"] = 31 - 8 * frame.ndvi + 5 * frame.ndbi + rng.normal(0, 0.8, n)
    frame["scene_id"] = "SYNTHETIC"
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(path, index=False)
    return frame


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("output")
    args = parser.parse_args()
    generate(args.output)
