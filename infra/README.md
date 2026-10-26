# Infraestrutura

`docker compose -f infra/compose.yaml up -d` a partir da raiz.
MongoDB local persistido em volume. Sem autenticação, exposto somente em localhost.
Para Atlas, substitua MONGO_URI no .env. Não inclua credenciais reais em commits.
Backend e frontend são iniciados separadamente conforme README geral.
