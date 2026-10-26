"""Consulta de cenas LST; não realiza ingestão nem inventa observações."""

from datetime import date

import httpx

STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1/search"


def search_scenes(year: int, cloud_cover: float = 20, limit: int = 20):
    """Consulta julho em uma caixa regional, sem equivalê-la ao limite municipal.

    Retorna apenas cenas L2SP Landsat 8/9 com temperatura de superfície.
    A cobertura de nuvens refere-se à cena inteira, não ao recorte de São Paulo.
    """
    if not 2013 <= year <= date.today().year:
        raise ValueError("Ano fora do período disponível")
    if not 0 <= cloud_cover <= 100 or not 1 <= limit <= 100:
        raise ValueError("Nuvens ou limite inválidos")

    response = httpx.post(
        STAC_URL,
        json={
            "collections": ["landsat-c2-l2"],
            "bbox": [-46.85, -24.05, -46.3, -23.3],
            "datetime": f"{year}-07-01T00:00:00Z/{year}-07-31T23:59:59Z",
            "query": {
                "eo:cloud_cover": {"lte": cloud_cover},
                "platform": {"in": ["landsat-8", "landsat-9"]},
                "landsat:processing_level": {"eq": "L2SP"},
            },
            "limit": limit,
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    scenes = []
    for item in payload.get("features", []):
        assets = item.get("assets", {})
        thermal = assets.get("lwir11") or assets.get("ST_B10")
        qa = assets.get("qa_pixel") or assets.get("QA_PIXEL")
        if not thermal or not qa:
            continue
        scenes.append(
            {
                "id": item["id"],
                "datetime": item["properties"].get("datetime"),
                "cloud_cover": item["properties"].get("eo:cloud_cover"),
                "lst_asset": thermal["href"],
                "qa_asset": qa["href"],
                "requires_asset_signing": True,
            }
        )
    return {
        "scenes": scenes,
        "has_more": any(link.get("rel") == "next" for link in payload.get("links", [])),
        "notice": "Primeira página do catálogo. URLs de assets precisam de assinatura SAS antes da leitura.",
    }


def dn_to_celsius(dn: float):
    """Escala USGS Collection 2 L2; zero indica fill. QA deve ser aplicado à parte."""
    if dn == 0:
        return None
    return dn * 0.00341802 + 149.0 - 273.15
