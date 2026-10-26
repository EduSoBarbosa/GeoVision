# GeoVision · 0.2.0

Plataforma acadêmica para explorar temperatura de superfície (LST) na Grande São Paulo, organizar visitas de campo e executar experimentos de machine learning.

**Stack:** FastAPI · MongoDB · React Native/Expo · Leaflet · Rasterio · scikit-learn · XGBoost · SHAP.

## Iniciar tudo com Docker

Requer Docker Engine/Desktop com Compose v2 e acesso à internet para baixar as imagens.
Execute na pasta que contém este README e `compose.yaml`:

```bash
# O ZIP já inclui .env local sem credenciais reais.
# Se veio do GitHub, copie .env.example para .env primeiro.
docker compose up --build -d
```

| Serviço | Endereço |
| --- | --- |
| Aplicação web | http://localhost:8080 |
| API e Swagger | http://localhost:8000/docs |
| Emails locais (Mailpit) | http://localhost:8025 |
| Saúde da API | http://localhost:8000/health |

MongoDB e arquivos de dados usam volumes persistentes. Reiniciar containers preserva os dados.
`docker compose down` para os serviços; **não use `down -v` se quiser manter os dados**.

## Primeiro percurso: laboratório completo

1. Abra a aplicação; Explore já apresenta um **mapa sintético identificado**.
2. Em Conta, cadastre `admin@example.com` (ou o email definido em `ADMIN_EMAIL`). Escolha sua senha.
3. Abra Mailpit, copie o código de verificação, volte para Conta, verifique e entre.
4. Em Dados, clique em **Criar dataset sintético**. Aguarde a tarefa concluir.
5. Em Machine Learning, atualize os experimentos, selecione o dataset, escolha divisão temporal e inicie o treino.
6. Acompanhe a tarefa em Dados. Volte ao laboratório, atualize e selecione o modelo.
7. Preveja LST e peça a explicação SHAP do primeiro ponto.
8. Em Analytics, selecione o dataset e modelo; clique em **Prever pontos exibidos** para alternar LST, previsão e erro no mapa.

Esse percurso testa o software. **Métricas sintéticas não medem o desempenho em São Paulo.** Modelos sintéticos não podem ser publicados como modelo ativo.

## Percurso com Landsat real

1. Em Dados, busque cenas de julho, por ano e limite de nuvens.
2. Defina um recorte pequeno: `-46.65,-23.56,-46.64,-23.55`.
3. Clique em **Coletar LST + índices**. O worker lê rasters, aplica QA, calcula NDVI/NDBI e registra até 10 mil amostras por cena.
4. Baixe CSV/GeoTIFF ou visualize o dataset no mapa.
5. Para treino temporal, colete cenas de pelo menos três anos. Para spatial, cubra pelo menos dez blocos aproximados de 1 km.
6. Treine, avalie erros e procedência, e só então publique um modelo real pela conta administradora.

O fluxo exige acesso ao catálogo e blobs do Planetary Computer. Proxy corporativo, certificados e nuvens podem impedir uma coleta. Consulte `docs/LST_API.md`.

## Organização

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `backend/app/routers/` | Rotas HTTP por domínio |
| `backend/app/services/` | Coleta, datasets, email e fila |
| `backend/app/worker.py` | Processamento assíncrono persistente |
| `frontend/src/screens/` | Telas do aplicativo |
| `frontend/src/components/` | UI e mapa web/mobile |
| `models/` | Contrato, treinamento, inferência e explicação |
| `backend/tests/`, `models/tests/` | Testes automatizados |
| `docs/` | Arquitetura, ciência, operação, planejamento e API |
| `scripts/` | Inicialização e exemplo de cliente Python |
| `ROTAS.md` | Índice completo de endpoints |
| `ESTADO_ATUAL.md` | O que foi implementado, testado e o que falta |

## Desenvolvimento sem Docker

Python 3.12, Node 22, MongoDB 7 e SMTP local acessíveis:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install -r backend/requirements-dev.txt
python -m uvicorn backend.app.main:app --reload
# Em outro terminal, na raiz:
python -m backend.app.worker
# Em outro terminal:
cd frontend
npm ci
npm run web
```

Para desenvolvimento sem SMTP, configure `DEV_EMAIL_TOKENS=true` com `ENVIRONMENT=development`. Esse modo devolve o token no cadastro e **não comprova posse do email**.
Para dispositivo físico, use o IP LAN do computador em `frontend/.env` e inicie Uvicorn com `--host 0.0.0.0`; a configuração Docker padrão fica restrita a localhost.

## Qualidade

```bash
python -m pytest --cov=backend.app --cov=models --cov-report=term-missing
python -m ruff check backend models
python -m black --check backend models
cd frontend
npm ci
npm run check
npm run build
```

Dependências diretas Python estão fixadas; frontend inclui `package-lock.json`. A pipeline GitHub Actions executa testes, lint, export web e builds Docker. Não há cobrança, implantação externa nem modelo científico pré-aprovado no pacote.
