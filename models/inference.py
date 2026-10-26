"""Inferência de artefatos locais confiáveis, com hash e contrato de features."""

import hashlib
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from models.schema import validate_frame


class Predictor:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.metadata = json.loads((self.directory / "metadata.json").read_text())
        artifact = self.directory / "pipeline.joblib"
        if (
            hashlib.sha256(artifact.read_bytes()).hexdigest()
            != self.metadata["artifact_sha256"]
        ):
            raise ValueError("Integridade do modelo inválida")
        # Nunca receber joblib/pickle de usuários: desserialização executa código.
        self.pipeline = joblib.load(artifact)

    def predict(self, rows):
        if not 1 <= len(rows) <= 2000:
            raise ValueError("Envie de 1 a 2000 observações")
        features = self.metadata["features"]
        data = validate_frame(pd.DataFrame(rows), features)
        prediction = self.pipeline.predict(data[features])
        warnings = []
        for feature, (low, high) in self.metadata["training_ranges"].items():
            count = int((~data[feature].between(low, high)).sum())
            if count:
                warnings.append(
                    f"{feature}: {count} valores fora do intervalo do treino"
                )
        return {
            "lst_celsius": prediction.tolist(),
            "warnings": warnings,
            "synthetic": self.metadata["synthetic"],
        }

    def explain(self, row):
        """Tree SHAP local. Baseline médio tem contribuição zero para cada feature."""
        import shap

        features = self.metadata["features"]
        frame = validate_frame(pd.DataFrame([row]), features)
        transformed = self.pipeline.named_steps["scale"].transform(frame[features])
        regressor = self.pipeline.named_steps["regressor"]
        predicted = float(self.pipeline.predict(frame[features])[0])
        if self.metadata["winner"] == "baseline_mean":
            return {
                "base_value": predicted,
                "prediction": predicted,
                "contributions": dict.fromkeys(features, 0.0),
                "method": "constant_baseline",
            }
        explanation = shap.TreeExplainer(regressor)(transformed)
        return {
            "base_value": float(np.asarray(explanation.base_values).reshape(-1)[0]),
            "prediction": predicted,
            "contributions": dict(zip(features, explanation.values[0].tolist())),
            "method": "TreeSHAP",
            "notice": "Contribuições explicam o modelo, não efeitos causais",
        }
