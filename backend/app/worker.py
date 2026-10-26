"""Worker sequencial com lease e heartbeat. Execute python -m backend.app.worker."""

import logging
import threading
import time
from datetime import timedelta

import pandas as pd
from pymongo import ReturnDocument

from backend.app.core import get_db, initialize, now, settings
from backend.app.services.collection import collect_scene
from backend.app.services.datasets import dataset_directory, load_dataset, store_dataset
from models.demo import generate
from models.train import train

logger = logging.getLogger("geovision.worker")


def execute(job, progress):
    identity, payload, owner = job["id"], job["payload"], job["owner"]
    if job["kind"] == "collect":
        directory = dataset_directory(identity)
        progress(10)
        frame, stats = collect_scene(payload["scene_id"], payload["bbox"], directory)
        progress(80)
        store_dataset(
            frame,
            owner,
            payload["scene_id"],
            payload["scene_id"],
            identity=identity,
            raster=True,
        )
        return {"dataset_id": identity, "quality": stats}
    if job["kind"] == "demo":
        directory = dataset_directory(identity)
        frame = generate(directory / "dataset.csv")
        store_dataset(
            frame,
            owner,
            "Laboratório sintético",
            "synthetic",
            synthetic=True,
            identity=identity,
        )
        return {"dataset_id": identity}
    if job["kind"] == "train":
        datasets = [
            get_db().datasets.find_one({"id": value, "owner": owner})
            for value in payload["dataset_ids"]
        ]
        if not all(datasets):
            raise ValueError("Dataset indisponível ou sem permissão")
        provenance = {d["synthetic"] for d in datasets}
        if len(provenance) != 1:
            raise ValueError("Não misture dados sintéticos com reais")
        directory = settings.data_dir / "models" / identity
        directory.mkdir(parents=True, exist_ok=True)
        frame = pd.concat([load_dataset(d["id"]) for d in datasets], ignore_index=True)
        csv = directory / "training.csv"
        frame.to_csv(csv, index=False)
        progress(15)
        metadata = train(
            csv,
            directory,
            payload["feature_set"],
            payload["strategy"],
            provenance.pop(),
        )
        progress(90)
        record = {
            "id": identity,
            "owner": owner,
            "dataset_ids": payload["dataset_ids"],
            **metadata,
        }
        get_db().models.replace_one({"id": identity}, record, upsert=True)
        return {
            "model_id": identity,
            "winner": metadata["winner"],
            "test": metadata["test"],
        }
    raise ValueError("Tipo de tarefa desconhecido")


def run_once():
    database = get_db()
    database.jobs.update_many(
        {"status": "running", "lease_until": {"$lt": now()}, "attempts": {"$gte": 3}},
        {
            "$set": {
                "status": "failed",
                "error": "Worker interrompido após 3 tentativas",
                "updated_at": now(),
            }
        },
    )
    job = database.jobs.find_one_and_update(
        {
            "$or": [
                {"status": "queued"},
                {
                    "status": "running",
                    "lease_until": {"$lt": now()},
                    "attempts": {"$lt": 3},
                },
            ]
        },
        {
            "$set": {
                "status": "running",
                "lease_until": now() + timedelta(minutes=2),
                "updated_at": now(),
            },
            "$inc": {"attempts": 1},
        },
        sort=[("created_at", 1)],
        return_document=ReturnDocument.AFTER,
    )
    if not job:
        return False
    attempt = job["attempts"]
    query = {"id": job["id"], "attempts": attempt, "status": "running"}
    stop = threading.Event()

    def heartbeat():
        while not stop.wait(20):
            database.jobs.update_one(
                query,
                {
                    "$set": {
                        "lease_until": now() + timedelta(minutes=2),
                        "updated_at": now(),
                    }
                },
            )

    thread = threading.Thread(target=heartbeat, daemon=True)
    thread.start()
    try:

        def progress(value):
            database.jobs.update_one(
                query, {"$set": {"progress": value, "updated_at": now()}}
            )

        result = execute(job, progress)
        database.jobs.update_one(
            query,
            {
                "$set": {
                    "status": "completed",
                    "progress": 100,
                    "result": result,
                    "updated_at": now(),
                }
            },
        )
    except Exception as exc:
        logger.exception("Tarefa %s falhou", job["id"])
        message = (
            str(exc)
            if isinstance(exc, ValueError)
            else "Falha de processamento externo; confira os logs do worker"
        )
        database.jobs.update_one(
            query,
            {"$set": {"status": "failed", "error": message[:500], "updated_at": now()}},
        )
    finally:
        stop.set()
        thread.join(timeout=2)
    return True


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize()
    while True:
        try:
            if not run_once():
                time.sleep(2)
        except Exception:
            logger.exception("Falha ao consultar fila")
            time.sleep(5)
