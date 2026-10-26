from fastapi import APIRouter, Depends, HTTPException, Query

from backend.app.core import current_user, get_db, new_id, now, owned
from backend.app.schemas import Area

router = APIRouter(prefix="/api/v1/areas", tags=["Visitas de campo"])


@router.get("")
def list_areas(
    account=Depends(current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return list(
        get_db()
        .areas.find({"owner": account["email"]}, {"_id": 0})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )


@router.post("", status_code=201)
def create_area(body: Area, account=Depends(current_user)):
    row = body.model_dump(mode="json")
    row.update(id=new_id(), owner=account["email"], created_at=now(), updated_at=now())
    get_db().areas.insert_one(dict(row))
    return row


@router.put("/{area_id}")
def update_area(area_id: str, body: Area, account=Depends(current_user)):
    owned("areas", area_id, account)
    get_db().areas.update_one(
        {"id": area_id, "owner": account["email"]},
        {"$set": {**body.model_dump(mode="json"), "updated_at": now()}},
    )
    return owned("areas", area_id, account)


@router.delete("/{area_id}")
def delete_area(area_id: str, account=Depends(current_user)):
    if (
        not get_db()
        .areas.delete_one({"id": area_id, "owner": account["email"]})
        .deleted_count
    ):
        raise HTTPException(404, "Área não encontrada")
    return {"deleted": True}
