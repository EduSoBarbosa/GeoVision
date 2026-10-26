import os, secrets, hashlib
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from argon2 import PasswordHasher
import jwt
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="GeoVision", version="0.1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
db = MongoClient(
    os.getenv("MONGO_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=3000
).geovision
secret = os.getenv("JWT_SECRET", "development-only-change-before-deploy")
ph = PasswordHasher()


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class Verification(BaseModel):
    token: str


class Area(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    coordinates: list[list[float]] = Field(min_length=3, max_length=100)
    notes: str = Field(default="", max_length=2000)


def user(authorization):
    try:
        token = authorization.removeprefix("Bearer ")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        u = db.users.find_one({"email": payload["sub"]})
        if not u or not u["verified"]:
            raise ValueError()
        return u
    except Exception:
        raise HTTPException(401, "Entre com sua conta verificada")


@app.get("/health")
def health():
    db.command("ping")
    return {"status": "ok"}


@app.post("/api/v1/auth/register", status_code=201)
def register(body: Credentials):
    email = str(body.email).lower()
    db.users.create_index("email", unique=True)
    if db.users.find_one({"email": email}):
        raise HTTPException(409, "Email já cadastrado")
    token = secrets.token_urlsafe(32)
    db.users.insert_one(
        {
            "email": email,
            "password": ph.hash(body.password),
            "verified": False,
            "verification": hashlib.sha256(token.encode()).hexdigest(),
            "expires": datetime.now(timezone.utc) + timedelta(hours=1),
            "plan": "Free",
        }
    )
    return {
        "message": "Cadastro realizado. Modo local: copie o token para verificar.",
        "development_verification_token": token,
    }


@app.post("/api/v1/auth/verify")
def verify(body: Verification):
    result = db.users.update_one(
        {
            "verification": hashlib.sha256(body.token.encode()).hexdigest(),
            "expires": {"$gt": datetime.now(timezone.utc)},
        },
        {"$set": {"verified": True}, "$unset": {"verification": "", "expires": ""}},
    )
    if not result.modified_count:
        raise HTTPException(400, "Token inválido ou expirado")
    return {"verified": True}


@app.post("/api/v1/auth/login")
def login(body: Credentials):
    u = db.users.find_one({"email": str(body.email).lower()})
    try:
        ph.verify(u["password"], body.password)
    except Exception:
        raise HTTPException(401, "Credenciais inválidas")
    if not u["verified"]:
        raise HTTPException(403, "Verifique o cadastro")
    return {
        "access_token": jwt.encode(
            {"sub": u["email"], "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
            secret,
            algorithm="HS256",
        ),
        "token_type": "bearer",
    }


@app.get("/api/v1/about")
def about():
    return {
        "text": "O GeoVision aproxima a análise ambiental do cotidiano de São Paulo. Reunimos mapas e ferramentas para estudar a temperatura da superfície, explorar relações com vegetação e construções e organizar visitas de campo. Projeto acadêmico em desenvolvimento.",
        "methodology": "LST é temperatura da superfície, não temperatura do ar. Anomalia espacial não equivale automaticamente a SUHI. O histórico planejado usa cenas de julho de 2016–2026; 2019 depende de cena adequada.",
    }


@app.get("/api/v1/plans")
def plans():
    return [
        {
            "name": n,
            "monthly_requests": q,
            "price_brl": v,
            "status": "Proposta, sem cobrança",
        }
        for n, q, v in [
            ("Free", 100, 0),
            ("Plus", 10000, 29),
            ("Pro", 100000, 99),
            ("Team", 500000, 299),
        ]
    ]


@app.get("/api/v1/map")
def map_data():
    rows = list(db.lst.find({}, {"_id": 0}).limit(2000))
    return {
        "type": "FeatureCollection",
        "features": rows,
        "source": "MongoDB",
        "empty": not rows,
        "notice": (
            "Nenhuma cena carregada"
            if not rows
            else "Consulte a procedência de cada registro"
        ),
    }


@app.get("/api/v1/areas")
def areas(authorization: str = Header(default="")):
    u = user(authorization)
    return list(db.areas.find({"owner": u["email"]}, {"_id": 0}))


@app.post("/api/v1/areas", status_code=201)
def create_area(body: Area, authorization: str = Header(default="")):
    u = user(authorization)
    if any(
        len(x) != 2 or not (-47.2 <= x[0] <= -45.8 and -24.2 <= x[1] <= -23.0)
        for x in body.coordinates
    ):
        raise HTTPException(422, "Use pares longitude, latitude na região de São Paulo")
    row = body.model_dump()
    row.update(id=secrets.token_hex(12), owner=u["email"], status="planejada")
    db.areas.insert_one(dict(row))
    return row


@app.delete("/api/v1/areas/{area_id}")
def delete_area(area_id: str, authorization: str = Header(default="")):
    u = user(authorization)
    if not db.areas.delete_one({"id": area_id, "owner": u["email"]}).deleted_count:
        raise HTTPException(404, "Área não encontrada")
    return {"deleted": True}


@app.post("/api/v1/keys")
def key(authorization: str = Header(default="")):
    u = user(authorization)
    raw = secrets.token_urlsafe(32)
    db.keys.insert_one(
        {"hash": hashlib.sha256(raw.encode()).hexdigest(), "owner": u["email"]}
    )
    return {"key": raw, "notice": "Guarde a chave; ela não será exibida novamente"}


@app.get("/api/v1/developer/lst")
def developer(x_api_key: str = Header(default="")):
    k = db.keys.find_one({"hash": hashlib.sha256(x_api_key.encode()).hexdigest()})
    if not k:
        raise HTTPException(401, "Chave inválida")
    u = db.users.find_one({"email": k["owner"]})
    limit = next(p["monthly_requests"] for p in plans() if p["name"] == u["plan"])
    ident = k["owner"] + datetime.now(timezone.utc).strftime("%Y-%m")
    db.usage.update_one({"_id": ident}, {"$setOnInsert": {"count": 0}}, upsert=True)
    if not db.usage.update_one(
        {"_id": ident, "count": {"$lt": limit}}, {"$inc": {"count": 1}}
    ).modified_count:
        raise HTTPException(429, "Cota mensal atingida")
    return map_data()


@app.get("/api/v1/ml/status")
def ml_status():
    return {
        "ready": False,
        "message": "Pipeline disponível em models; integração do artefato pendente",
    }


@app.post("/api/v1/ml/predict")
def predict():
    raise HTTPException(503, "Modelo real ainda não treinado e integrado")


@app.get("/api/v1/landsat/scenes")
def landsat_scenes(year: int = 2025, cloud_cover: float = 20, limit: int = 20):
    """Lista cenas candidatas; não insere LST no banco."""
    import httpx
    from .landsat import search_scenes

    try:
        return search_scenes(year, cloud_cover, limit)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            502, "Catálogo Landsat indisponível; tente novamente"
        ) from exc


class PixelDownload(BaseModel):
    scene_id: str = Field(min_length=1, max_length=120)
    bbox: tuple[float, float, float, float]


@app.post("/api/v1/landsat/download")
def download_pixels(body: PixelDownload, authorization: str = Header(default="")):
    """Baixa recorte LST mascarado como GeoTIFF. Exige sessão verificada."""
    import tempfile
    import shutil
    from pathlib import Path
    import httpx
    from rasterio.errors import RasterioError
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask
    from .pixels import download_scene

    user(authorization)
    directory = Path(tempfile.mkdtemp(prefix="geovision-"))
    output = directory / "lst_celsius.tif"
    try:
        stats = download_scene(body.scene_id, body.bbox, output)
        return FileResponse(
            output,
            media_type="image/tiff",
            filename="lst_celsius.tif",
            headers={"X-Valid-Fraction": str(stats["valid_fraction"])},
            background=BackgroundTask(shutil.rmtree, directory),
        )
    except Exception as exc:
        shutil.rmtree(directory, ignore_errors=True)
        if isinstance(exc, ValueError):
            raise HTTPException(422, str(exc)) from exc
        if isinstance(exc, (httpx.HTTPError, RasterioError)):
            raise HTTPException(
                502, "Falha ao consultar ou ler a cena Landsat"
            ) from exc
        raise
