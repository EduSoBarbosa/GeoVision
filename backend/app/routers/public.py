from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from backend.app.core import get_db

router = APIRouter(tags=["Plataforma"])
PLANS = [
    {
        "name": n,
        "monthly_requests": q,
        "price_brl": price,
        "status": "Proposta acadêmica; sem cobrança ou contratação automática",
    }
    for n, q, price in [
        ("Free", 100, 0),
        ("Plus", 10000, 29),
        ("Pro", 100000, 99),
        ("Team", 500000, 299),
    ]
]


@router.get("/health/live")
def live():
    return {"status": "alive", "version": "0.2.0"}


@router.get("/health")
def ready():
    try:
        get_db().command("ping")
    except PyMongoError:
        raise HTTPException(503, "MongoDB indisponível")
    return {"status": "ready"}


@router.get("/api/v1/plans")
def plans():
    return PLANS


@router.get("/api/v1/about")
def about():
    return {
        "text": "O GeoVision é um projeto acadêmico que reúne observações de satélite e ferramentas de análise para estudar o calor na Grande São Paulo. Estudantes exploram a temperatura da superfície; gestores organizam visitas de campo; desenvolvedores consultam dados com origem e qualidade documentadas.",
        "methodology": "LST descreve a superfície, não a temperatura do ar. NDVI e NDBI ajudam a estudar associações com vegetação e ocupação urbana. A comparação entre anos depende de estação, horário, nuvens e disponibilidade de dados. SHAP explica o modelo, não causalidade.",
    }
