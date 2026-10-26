# Backend

FastAPI + PyMongo. Execute a partir da raiz conforme README geral.
Coleções users, areas, lst, keys e usage são criadas na primeira gravação.
Autenticação: cadastro → token local → verificação → login → Bearer JWT.
Senhas Argon2; chaves armazenadas por hash. Cota mensal por usuário, compartilhada entre chaves.
Planos pagos são propostas; atribuição administrativa manual. CORS aberto para testes.
Verificação usa token devolvido na resposta e NÃO verifica posse do email: substituir por SMTP antes de publicar.
Rotas e contratos: /docs e /openapi.json. Nenhum dado real é semeado.

## Pixels Landsat

Rota autenticada `POST /api/v1/landsat/download`: recorte e máscara de nuvens,
saída GeoTIFF em °C. Uso e limites em `../docs/LST_API.md`.
Reinstale requirements.txt para obter Rasterio e planetary-computer.
