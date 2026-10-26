# Estado atual — 26/10/2026

## Implementado

API de cadastro/login, verificação LOCAL, consulta de dados LST, áreas salvas por proprietário, exclusão, catálogo de planos, emissão de chaves e cota mensal persistida em MongoDB. Interface Expo com formulários e navegação. Pipeline offline XGBoost com separação temporal e métricas. MongoDB local via Compose e configuração .env.

## Parcial / pendente

Esta é uma base inicial, não o MVP completo dos requisitos. Mapa 2D integrado, desenho visual de polígonos, camadas térmicas, meteorologia, edição de visitas, envio real de email, inferência online, importação de cenas, SHAP e cobertura abrangente de testes ainda precisam ser implementados.
/api/v1/ml/predict responde 503; status declara ready=false. Nenhuma previsão ou medição fictícia é apresentada como real. Plano de dados inclui Landsat e variáveis urbanas; não há dados carregados.

## Limitações

Token de cadastro devolvido localmente não confirma posse do email. Segredo de desenvolvimento deve ser substituído. Falta proteção contra força bruta, revogação de chaves, paginação completa e validação topológica de polígonos. Preços são sugestões acadêmicas, sem cobrança. Não publicar esta configuração diretamente.

## Próximos passos

1. Integrar mapa web/mobile e desenho de áreas.
2. Importar cenas reais com procedência e QA.
3. Implementar SMTP e endurecer autenticação.
4. Treinar, validar espacialmente e integrar modelo/SHAP.
5. Completar testes de cada rota e fluxo mobile.

## Revisão de legibilidade e consulta Landsat

Python formatado com Black; frontend, JSON e documentação com Prettier.
Adicionada rota `/api/v1/landsat/scenes` e testes locais de contrato/escala.
Consulta documentada em `docs/LST_API.md`. Ainda não baixa, recorta ou ingere rasters.

## Atualização: pixels e nuvens

Implementado download de recorte via POST /api/v1/landsat/download,
assinatura dos assets, leitura por janela, conversão °C e máscara QA_PIXEL
(bits 0–5), com GeoTIFF georreferenciado para download.
Esta atualização substitui as observações anteriores sobre falta de download/recorte.
Ainda pendem ingestão MongoDB, botão no frontend, filtros ST_QA/QA_RADSAT,
e validação ponta a ponta com cena remota real. Consulte docs/LST_API.md.
