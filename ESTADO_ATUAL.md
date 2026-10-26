# Estado consolidado · GeoVision 0.2.0

## Implementado

- Backend modular com OpenAPI, validação, JWT, Argon2, SMTP e permissões.
- CRUD de visitas com polígonos válidos, notas, data e status.
- Chaves de API revogáveis, cotas mensais e controles básicos de abuso.
- Catálogo Landsat e download de pixels por janela com QA_PIXEL e LST em °C.
- Coleta assíncrona com extração NDVI/NDBI e amostras persistidas em MongoDB.
- Importação CSV, exportação de datasets e registro de procedência.
- Fila MongoDB, status, heartbeat e retomada após interrupção.
- Planejamento de experimentos, split temporal/espacial, baseline/RF/XGBoost,
  normalização, seleção na validação, teste reservado e relatório de erros.
- Registro de modelos, integridade por SHA-256, publicação manual, inferência
  em lote, avisos de extrapolação e explicações TreeSHAP.
- Mapa 2D interativo, pontos, camadas, desenho de visitas, previsão/erro e telas
  de dados, tarefas, modelos, conta e desenvolvedores.
- Dockerfiles e Compose para web/API/worker/MongoDB/Mailpit, volumes e healthchecks.
- Dependências diretas fixadas, lockfile npm, formatação, lint, testes e CI.

## Dados reais versus demonstração

Não há modelo científico aprovado nem cenas reais embutidas no ZIP.
Mapa público e dataset de laboratório são sintéticos e rotulados.
A aplicação pode treinar/consumir dados reais fornecidos pelo usuário.
Modelos sintéticos são bloqueados para publicação como modelo ativo.

## Limitações conhecidas

- QA_RADSAT/ST_QA e validação espaço-temporal com buffer ainda pendentes.
- Bases urbanas, meteorologia e referência rural para SUHI não foram integradas.
- Mapa exibe amostras paginadas, não tiles de um raster completo.
- Exportação de arquivos via botão é apenas web; mobile exige validação física.
- Não há cobrança, 3D, simulação causal, refresh token, expurgo ou migração automática da v0.1.
- O MVP usa um worker; operações disco/MongoDB não são uma transação única.
- Compose é de desenvolvimento; não foi homologado para produção.

## Evidências de validação

Consulte `docs/VALIDACAO.md` para resultados reais de testes, builds e limitações
do ambiente. A existência de Dockerfile/CI não significa que uma implantação foi executada.
