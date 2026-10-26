from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException

from backend.app.core import (
    admin_user,
    current_user,
    get_db,
    new_id,
    now,
    owned,
    settings,
)
from backend.app.schemas import PredictRequest, TrainRequest
from backend.app.services.jobs import enqueue
from models.inference import Predictor

router = APIRouter(prefix="/api/v1/ml", tags=["Machine Learning"])


@lru_cache(maxsize=4)
def predictor(model_id):
    return Predictor(settings.data_dir / "models" / model_id)


def resolve_model(model_id, account):
    if model_id:
        return owned("models", model_id, account)
    active = get_db().registry.find_one({"_id": "active"})
    model = (
        get_db().models.find_one({"id": active["model_id"]}, {"_id": 0})
        if active
        else None
    )
    if not model:
        raise HTTPException(
            503, "Nenhum modelo publicado; treine e selecione um modelo"
        )
    return model


@router.get("/status")
def status():
    active = get_db().registry.find_one({"_id": "active"})
    model = (
        get_db().models.find_one({"id": active["model_id"]}, {"_id": 0})
        if active
        else None
    )
    public_metadata = (
        {
            key: model[key]
            for key in ["id", "winner", "features", "test", "synthetic", "created_at"]
            if key in model
        }
        if model
        else None
    )
    return {"ready": bool(model), "active_model": public_metadata}


@router.get("/models")
def models(account=Depends(current_user)):
    return list(
        get_db()
        .models.find({"owner": account["email"]}, {"_id": 0})
        .sort("created_at", -1)
        .limit(100)
    )


@router.post("/train", status_code=202)
def training(body: TrainRequest, account=Depends(admin_user)):
    if len(set(body.dataset_ids)) != len(body.dataset_ids):
        raise HTTPException(422, "Dataset repetido")
    for identity in body.dataset_ids:
        owned("datasets", identity, account)
    return enqueue("train", body.model_dump(), account["email"])


@router.post("/models/{model_id}/activate")
def activate(model_id: str, account=Depends(admin_user)):
    model = owned("models", model_id, account)
    if model["synthetic"]:
        raise HTTPException(
            409, "Modelo sintético só pode ser usado explicitamente no laboratório"
        )
    try:
        predictor(model_id)
    except (OSError, ValueError):
        raise HTTPException(409, "Artefato ausente ou corrompido")
    get_db().registry.replace_one(
        {"_id": "active"},
        {"_id": "active", "model_id": model_id, "activated_at": now()},
        upsert=True,
    )
    return {"active_model_id": model_id}


@router.post("/predict")
def predict(body: PredictRequest, account=Depends(current_user)):
    model = resolve_model(body.model_id, account)
    try:
        result = predictor(model["id"]).predict(body.rows)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except OSError as exc:
        raise HTTPException(503, "Artefato indisponível") from exc
    result.update(model_id=model["id"], id=new_id())
    get_db().predictions.insert_one(
        {
            "id": result["id"],
            "owner": account["email"],
            "model_id": model["id"],
            "rows": len(body.rows),
            "created_at": now(),
            "synthetic": result["synthetic"],
        }
    )
    return result


@router.post("/explain")
def explain(body: PredictRequest, account=Depends(current_user)):
    if len(body.rows) != 1:
        raise HTTPException(422, "Explicação aceita uma observação por chamada")
    model = resolve_model(body.model_id, account)
    try:
        result = predictor(model["id"]).explain(body.rows[0])
        return {**result, "model_id": model["id"], "synthetic": model["synthetic"]}
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except OSError as exc:
        raise HTTPException(503, "Artefato indisponível") from exc


@router.get("/models/{model_id}/report")
def report(model_id: str, account=Depends(current_user)):
    """Exporta erros no conjunto de teste reservado para inspeção espacial."""
    from fastapi.responses import FileResponse

    owned("models", model_id, account)
    path = settings.data_dir / "models" / model_id / "test_predictions.csv"
    if not path.exists():
        raise HTTPException(404, "Relatório indisponível")
    return FileResponse(path, filename=f"test-errors-{model_id}.csv")
