"""Fila persistida no MongoDB; processamento fora das threads HTTP."""

from fastapi import HTTPException

from backend.app.core import consume_quota, get_db, new_id, now


def enqueue(kind, payload, owner):
    consume_quota("jobs:" + owner + now().strftime("%Y%m%d%H"), 20)
    if (
        get_db().jobs.count_documents(
            {"owner": owner, "status": {"$in": ["queued", "running"]}}
        )
        >= 3
    ):
        raise HTTPException(429, "Aguarde as tarefas em andamento")
    job = {
        "id": new_id(),
        "kind": kind,
        "payload": payload,
        "owner": owner,
        "status": "queued",
        "progress": 0,
        "attempts": 0,
        "created_at": now(),
        "updated_at": now(),
    }
    get_db().jobs.insert_one(dict(job))
    return job
