import hashlib
import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from backend.app.core import consume_quota, current_user, get_db, new_id, now
from backend.app.routers.public import PLANS

router = APIRouter(prefix="/api/v1", tags=["Desenvolvedores"])


@router.post("/keys", status_code=201)
def create_key(account=Depends(current_user)):
    if (
        get_db().keys.count_documents({"owner": account["email"], "revoked": False})
        >= 5
    ):
        raise HTTPException(409, "Máximo de 5 chaves ativas")
    raw = "gv_" + secrets.token_urlsafe(32)
    record = {
        "id": new_id(),
        "hash": hashlib.sha256(raw.encode()).hexdigest(),
        "prefix": raw[:10],
        "owner": account["email"],
        "created_at": now(),
        "revoked": False,
    }
    get_db().keys.insert_one(record)
    return {"id": record["id"], "key": raw, "notice": "Exibida apenas agora"}


@router.get("/keys")
def keys(account=Depends(current_user)):
    return list(get_db().keys.find({"owner": account["email"]}, {"_id": 0, "hash": 0}))


@router.delete("/keys/{key_id}")
def revoke(key_id: str, account=Depends(current_user)):
    result = get_db().keys.update_one(
        {"id": key_id, "owner": account["email"]}, {"$set": {"revoked": True}}
    )
    if not result.matched_count:
        raise HTTPException(404, "Chave não encontrada")
    return {"revoked": True}


@router.get("/usage")
def usage(account=Depends(current_user)):
    period = now().strftime("%Y-%m")
    row = get_db().usage.find_one({"_id": account["email"] + period}) or {}
    plan = next(p for p in PLANS if p["name"] == account["plan"])
    return {
        "period": period,
        "requests": row.get("count", 0),
        "limit": plan["monthly_requests"],
        "plan": account["plan"],
    }


@router.get("/developer/lst")
def developer_data(
    dataset_id: str,
    x_api_key: str = Header(default=""),
    limit: int = Query(1000, ge=1, le=5000),
    offset: int = Query(0, ge=0),
):
    key = get_db().keys.find_one(
        {"hash": hashlib.sha256(x_api_key.encode()).hexdigest(), "revoked": False}
    )
    if not key:
        raise HTTPException(401, "Chave inválida")
    account = get_db().users.find_one({"email": key["owner"], "verified": True})
    if not account:
        raise HTTPException(401, "Conta indisponível")
    dataset = get_db().datasets.find_one({"id": dataset_id, "owner": key["owner"]})
    if not dataset:
        raise HTTPException(404, "Dataset não encontrado")
    quota = next(p["monthly_requests"] for p in PLANS if p["name"] == account["plan"])
    consume_quota(account["email"] + now().strftime("%Y-%m"), quota)
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
        "total": dataset["rows"],
        "has_more": offset + len(rows) < dataset["rows"],
        "synthetic": dataset["synthetic"],
    }
