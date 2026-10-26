# Validação da entrega 0.2.0

## Executado neste ambiente

| Verificação | Resultado |
| --- | --- |
| Pytest backend + ML | 22 aprovados, 1 ignorado |
| Cobertura de linhas (sem os arquivos de testes) | Aproximadamente 88% |
| Ruff | Aprovado |
| Black | Aprovado |
| Prettier | Aprovado |
| Expo compatibilidade de dependências | Dependências compatíveis |
| Export web | Aprovado |
| Export do bundle Android | Aprovado; não é um APK nem teste em aparelho |
| Smoke em Chromium headless | Cadastro, verificação local, login, navegação, desenho/salvamento de visita, dataset, treino, inferência e SHAP concluídos |
| Layout 390 px | Sem overflow horizontal do documento |
| Erros JavaScript no smoke | Nenhum após inclusão local do Leaflet |
| YAML Compose | Sintaxe, serviços e volume compartilhado conferidos |

O smoke usou API real em processo local, mongomock, token de verificação de
desenvolvimento e worker real com dados sintéticos. Não exercitou SMTP real,
MongoDB real nem satélite remoto. Os testes de serviços usam rasters GeoTIFF
locais sintéticos e mocks das respostas externas.

## Não executado / limitações

- Docker não está disponível neste ambiente: não foi possível iniciar Compose
  ou construir as imagens aqui. A definição de CI inclui essas verificações.
- Um teste de índices em MongoDB real foi ignorado. É habilitado por
  RUN_MONGO_TESTS=1 e pelo serviço MongoDB no CI.
- Teste completo de coleta Landsat real não foi concluído: na revisão anterior
  o catálogo respondeu, mas leitura dos blobs falhou por certificado TLS do ambiente.
- Tiles OpenStreetMap não carregaram no teste local; o aviso de indisponibilidade
  apareceu e os pontos/desenho continuaram funcionando. A biblioteca Leaflet
  agora faz parte do build, sem depender de CDN para executar.
- Não houve teste em aparelho Android/iOS físico, auditoria WCAG ou homologação
  científica com cenas reais.
- Existem avisos de depreciação em dependências (TestClient/httpx e
  planetary-computer/Pydantic). Não houve falha associada nos testes.

## Reproduzir

Veja README geral para pytest, lint e build. Para validar a integração de serviços,
execute o percurso de laboratório descrito no README após docker compose up.
Métricas obtidas de dados sintéticos são evidência de funcionamento do pipeline,
não de acurácia científica em São Paulo.
