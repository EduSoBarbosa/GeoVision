# Backend

FastAPI modular. Entrada: `python -m uvicorn backend.app.main:app --reload` na raiz.
Worker: `python -m backend.app.worker` em outro processo.

## Módulos

- `core.py`: configuração, MongoDB, índices, JWT, permissões e cotas atômicas.
- `schemas.py`: contratos Pydantic e validação de polígonos.
- `routers/auth.py`: cadastro, email, reenvio, login e perfil.
- `routers/areas.py`: CRUD de visitas por proprietário.
- `routers/data.py`: catálogo, importação, coleta, downloads, mapa e tarefas.
- `routers/ml.py`: treino, registro, publicação, inferência e SHAP.
- `routers/developer.py`: emissão/revogação de chaves, consumo e exportação GeoJSON.
- `services/`: persistência de datasets, leitura de bandas e transporte SMTP.
- `pixels.py`: QA_PIXEL, conversão LST e GeoTIFF.

## Banco e arquivos

Índices são criados na inicialização. MongoDB armazena contas, visitas, chaves,
cotas, observações geográficas, tarefas, datasets, metadados dos modelos e
histórico resumido de previsões. CSV, GeoTIFF e artefatos joblib vivem no volume
`DATA_DIR`, compartilhado pela API e worker. Não existe banco relacional.

Arquivos grandes têm armazenamento próprio; duplicar pixels de um raster completo
em documentos individuais seria caro. O mapa consulta a amostra no MongoDB.
O CSV e o raster mantêm procedência e podem ser exportados.

## Contratos e permissões

Swagger: `/docs`, OpenAPI: `/openapi.json`. Em **Authorize**, cole o JWT de login.
Conta verificada exige Bearer; o endpoint de desenvolvedores usa `X-API-Key`.
Treinar/publicar requer o email exato de `ADMIN_EMAIL` e datasets do próprio administrador.
IDs de outros usuários retornam 404. As chaves não liberam dados de terceiros.

Os planos são uma proposta acadêmica e não possuem checkout. Cotas contam por
conta e mês UTC. Há limite de 20 operações de autenticação/minuto/IP,
20 tarefas/hora/usuário, 3 tarefas pendentes e 5 chaves ativas.

## Fila

MongoDB recebe tarefas; worker faz claim atômico e heartbeat a cada 20s, com lease
renovado para 2min. Interrupções podem ser retomadas até 3 tentativas. Erros normais
terminam em failed e não são repetidos automaticamente. Use **um worker** no MVP.
Essa implementação não oferece transações entre disco e MongoDB nem exactly-once.

Consulte `../docs/OPERACAO.md` para os limites antes de produção.
