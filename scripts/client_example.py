"""Cliente Python: GEOVISION_TOKEN e GEOVISION_MODEL_ID são fornecidos pelo usuário."""
import os
import httpx

base = os.getenv("GEOVISION_API", "http://localhost:8000")
token = os.environ["GEOVISION_TOKEN"]
model_id = os.getenv("GEOVISION_MODEL_ID")
with httpx.Client(base_url=base, headers={"Authorization": f"Bearer {token}"}, timeout=30) as client:
    response = client.post("/api/v1/ml/predict", json={"model_id": model_id, "rows": [{"ndvi": .5, "ndbi": .1, "latitude": -23.55, "longitude": -46.63}]})
    response.raise_for_status()
    print(response.json())
