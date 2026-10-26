# GeoVision — MVP 0.1

Leia primeiro ESTADO_ATUAL.md: esta entrega é uma base funcional parcial.

## Executar

1. `docker compose -f infra/compose.yaml up -d`
2. Na raiz: `python -m venv .venv`; ative o ambiente.
3. `pip install -r backend/requirements.txt`
4. `python -m uvicorn backend.app.main:app --reload`
5. Em outro terminal: `cd frontend`, `npm install`, `npm run web`.
   API: http://localhost:8000/docs. MongoDB pode ser substituído no .env.
   Para celular, use o IP LAN do computador no frontend/.env e execute a API com `--host 0.0.0.0`.

Teste: `python -m pytest backend/tests -q`.
Cada parte possui README próprio. Requisitos originais estão em docs/requisitos.md.

## Localização das rotas

Veja **ROTAS.md** na raiz. Todas as rotas FastAPI estão em `backend/app/main.py`.
