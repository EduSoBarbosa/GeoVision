"""Teste real opcional; CI inicia MongoDB. Não toca no banco da aplicação."""

import os
import uuid

import pytest
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError


@pytest.mark.integration
@pytest.mark.skipif(
    os.getenv("RUN_MONGO_TESTS") != "1", reason="MongoDB real não habilitado"
)
def test_mongo_unique_and_geospatial_indexes():
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
    name = "geovision_test_" + uuid.uuid4().hex
    database = client[name]
    try:
        database.users.create_index("email", unique=True)
        database.users.insert_one({"email": "test@example.com"})
        with pytest.raises(DuplicateKeyError):
            database.users.insert_one({"email": "test@example.com"})
        database.cells.create_index([("geometry", "2dsphere")])
        database.cells.insert_one(
            {"geometry": {"type": "Point", "coordinates": [-46.63, -23.55]}}
        )
        assert database.cells.count_documents({}) == 1
    finally:
        client.drop_database(name)
        client.close()
