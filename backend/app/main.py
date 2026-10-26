"""Fábrica ASGI. As rotas ficam organizadas em app/routers/."""

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from backend.app.core import initialize, settings
from backend.app.routers import areas, auth, data, developer, ml, public

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("geovision.http")


@asynccontextmanager
async def lifespan(app):
    initialize()
    yield


app = FastAPI(
    title="GeoVision API",
    version="0.2.0",
    description="Observações Landsat, visitas urbanas e ciclo de machine learning.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Valid-Fraction", "Content-Disposition"],
)


@app.middleware("http")
async def request_log(request: Request, call_next):
    request_id = uuid.uuid4().hex
    start = time.monotonic()
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "id=%s method=%s path=%s status=%s ms=%.1f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        (time.monotonic() - start) * 1000,
    )
    return response


@app.exception_handler(PyMongoError)
async def database_error(request, exc):
    logger.error("MongoDB indisponível: %s", type(exc).__name__)
    return JSONResponse(
        status_code=503, content={"detail": "Banco indisponível; tente novamente"}
    )


for router in [
    public.router,
    auth.router,
    areas.router,
    developer.router,
    data.router,
    ml.router,
]:
    app.include_router(router)
