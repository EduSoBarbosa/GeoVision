# Infraestrutura

Configuração canônica: `../compose.yaml`. `infra/compose.yaml` é um alias via
Compose include e exige uma versão recente do Compose; prefira executar da raiz.

| Serviço | Processo | Persistência |
| --- | --- | --- |
| api | FastAPI/Uvicorn, usuário sem root | Volume de dados compartilhado |
| worker | Fila e execução de tarefas | Mesmo volume + MongoDB |
| mongo | MongoDB 7 | Volume mongo_data |
| web | Expo exportado + Nginx sem root | Build imutável |
| mailpit | SMTP de desenvolvimento | Mensagens locais temporárias |

As portas publicadas usam 127.0.0.1. MongoDB não publica porta por padrão.
CORS permanece aberto conforme requisitos de teste. Backend e frontend possuem
Dockerfiles separados. O frontend usa build multi-stage e npm ci com lockfile.
Healthchecks acompanham API, MongoDB e web; worker deve ser acompanhado pelos logs/tarefas.

## Comandos

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f api worker
docker compose restart worker
docker compose down
```

Para Atlas, configure `MONGO_DOCKER_URI` na raiz (substitui URI interna do Compose).
Para uso externo, ajuste portas, domínio público embutido no frontend, HTTPS,
CORS, credenciais de MongoDB e SMTP real. Compose fornecido é para desenvolvimento.
Consulte `../docs/OPERACAO.md` antes de disponibilizar em rede pública.
