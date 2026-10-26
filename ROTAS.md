# Rotas da aplicação

Todas as rotas estão em `backend/app/main.py`.

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/health` | `health` |
| POST | `/api/v1/auth/register` | `register` |
| POST | `/api/v1/auth/verify` | `verify` |
| POST | `/api/v1/auth/login` | `login` |
| GET | `/api/v1/about` | `about` |
| GET | `/api/v1/plans` | `plans` |
| GET | `/api/v1/map` | `map_data` |
| GET | `/api/v1/areas` | `areas` |
| POST | `/api/v1/areas` | `create_area` |
| DELETE | `/api/v1/areas/{area_id}` | `delete_area` |
| POST | `/api/v1/keys` | `key` |
| GET | `/api/v1/developer/lst` | `developer` |
| GET | `/api/v1/ml/status` | `ml_status` |
| POST | `/api/v1/ml/predict` | `predict` |
| GET | `/api/v1/landsat/scenes` | `landsat_scenes` |
| POST | `/api/v1/landsat/download` | `download_pixels` |

## Onde encontrar cada parte

- `backend/app/main.py`: FastAPI, rotas, autenticação, áreas e cotas.
- `backend/app/landsat.py`: busca de cenas no catálogo.
- `backend/app/pixels.py`: download por janela, máscara QA e GeoTIFF.
- `backend/tests/`: testes da API e dos pixels.
- `frontend/App.js`: telas React Native/Expo.
- `models/train.py`: treinamento XGBoost offline.
- `infra/compose.yaml`: MongoDB local.
- `ESTADO_ATUAL.md`: funcionalidades e pendências.

## Abrir as rotas no navegador

Na raiz `geovision/`, execute:

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload
```

Abra http://localhost:8000/docs. O contrato JSON fica em http://localhost:8000/openapi.json.
MongoDB deve estar disponível para autenticação e persistência.
A rota de previsão ainda responde 503, pois o modelo real não foi integrado.
