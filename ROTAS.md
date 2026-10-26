# Rotas · GeoVision 0.2.0

Todas são montadas em `backend/app/main.py`. Implementações ficam em `backend/app/routers/`.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | `/health/live` | Live |
| GET | `/health` | Ready |
| GET | `/api/v1/plans` | Plans |
| GET | `/api/v1/about` | About |
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/resend` | Resend |
| POST | `/api/v1/auth/verify` | Verify |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Me |
| GET | `/api/v1/areas` | List Areas |
| POST | `/api/v1/areas` | Create Area |
| PUT | `/api/v1/areas/{area_id}` | Update Area |
| DELETE | `/api/v1/areas/{area_id}` | Delete Area |
| GET | `/api/v1/keys` | Keys |
| POST | `/api/v1/keys` | Create Key |
| DELETE | `/api/v1/keys/{key_id}` | Revoke |
| GET | `/api/v1/usage` | Usage |
| GET | `/api/v1/developer/lst` | Developer Data |
| GET | `/api/v1/demo/map` | Demo Map |
| GET | `/api/v1/map` | Map Data |
| GET | `/api/v1/datasets` | Datasets |
| POST | `/api/v1/datasets/upload` | Upload Dataset |
| GET | `/api/v1/datasets/{dataset_id}/download` | Dataset Download |
| POST | `/api/v1/datasets/demo` | Demo |
| GET | `/api/v1/landsat/scenes` | Scenes |
| POST | `/api/v1/landsat/collect` | Collect |
| POST | `/api/v1/landsat/download` | Download |
| GET | `/api/v1/jobs` | Jobs |
| GET | `/api/v1/jobs/{job_id}` | Job |
| POST | `/api/v1/datasets/import` | Import Csv |
| GET | `/api/v1/ml/status` | Status |
| GET | `/api/v1/ml/models` | Models |
| POST | `/api/v1/ml/train` | Training |
| POST | `/api/v1/ml/models/{model_id}/activate` | Activate |
| POST | `/api/v1/ml/predict` | Predict |
| POST | `/api/v1/ml/explain` | Explain |
| GET | `/api/v1/ml/models/{model_id}/report` | Report |

## Testar

Inicie o Compose e abra http://localhost:8000/docs. Cadastre, verifique o email no Mailpit e faça login. Em **Authorize**, cole o JWT. Para `/developer/lst`, informe `X-API-Key`.

Contrato exportado também disponível em `docs/openapi.json`.
