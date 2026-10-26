"""Configuração, conexão MongoDB e dependências compartilhadas."""

import secrets
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic_settings import BaseSettings, SettingsConfigDict
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "geovision"
    jwt_secret: str = "development-only-change-before-deploy"
    environment: str = "development"
    cors_origins: str = "*"
    data_dir: Path = Path("data")
    admin_email: str = "admin@example.com"
    dev_email_tokens: bool = False
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_starttls: bool = False
    email_from: str = "GeoVision <noreply@geovision.local>"


settings = Settings()
if settings.environment == "production" and (
    len(settings.jwt_secret) < 32
    or settings.jwt_secret.startswith("development-")
    or settings.dev_email_tokens
):
    raise RuntimeError("Produção exige JWT_SECRET forte e DEV_EMAIL_TOKENS=false")


@lru_cache
def get_client():
    return MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000, tz_aware=True)


def get_db():
    return get_client()[settings.mongo_db]


def now():
    return datetime.now(timezone.utc)


def new_id():
    return secrets.token_hex(12)


def initialize():
    database = get_db()
    for collection, index, options in [
        ("users", "email", {"unique": True}),
        ("areas", "id", {"unique": True}),
        ("areas", "owner", {}),
        ("keys", "hash", {"unique": True}),
        ("jobs", "id", {"unique": True}),
        ("datasets", "id", {"unique": True}),
        ("models", "id", {"unique": True}),
        ("observations", [("dataset_id", 1), ("cell_id", 1)], {"unique": True}),
        ("observations", "geometry", {"sparse": True}),
    ]:
        database[collection].create_index(index, **options)
    database.jobs.create_index([("status", 1), ("created_at", 1)])
    database.observations.create_index([("geometry", "2dsphere")])
    settings.data_dir.mkdir(parents=True, exist_ok=True)


def consume_quota(identity, limit):
    """Contagem atômica por chave de período, compartilhada entre workers."""
    collection = get_db().usage
    try:
        collection.update_one(
            {"_id": identity}, {"$setOnInsert": {"count": 0}}, upsert=True
        )
    except DuplicateKeyError:
        pass
    if not collection.update_one(
        {"_id": identity, "count": {"$lt": limit}}, {"$inc": {"count": 1}}
    ).modified_count:
        raise HTTPException(429, "Limite de requisições atingido")


bearer = HTTPBearer(auto_error=False)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    try:
        if not credentials:
            raise ValueError("missing")
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=["HS256"],
            issuer="geovision",
        )
        account = get_db().users.find_one({"email": payload["sub"], "verified": True})
        if not account:
            raise ValueError("unknown")
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(401, "Entre com sua conta verificada")
    return account


def admin_user(account=Depends(current_user)):
    if account["email"] != settings.admin_email.lower():
        raise HTTPException(403, "Operação restrita ao administrador configurado")
    return account


def owned(collection, identity, account):
    query = {"id": identity, "owner": account["email"]}
    item = get_db()[collection].find_one(query, {"_id": 0})
    if not item:
        raise HTTPException(404, "Registro não encontrado")
    return item
