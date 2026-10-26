# Testes de API e serviços

Execute `python -m pytest` na raiz. Fixtures usam mongomock e diretório temporário.
Não são feitas requisições reais de email/satélite durante os testes.
`RUN_MONGO_TESTS=1` habilita teste de índices com MongoDB real em localhost:27017;
um banco temporário exclusivo é criado e removido.
Casos incluem autenticação, reenvio, permissões, polígonos, cotas, datasets,
recortes sintéticos, bandas espectrais, fila e treino→inferência→SHAP.
