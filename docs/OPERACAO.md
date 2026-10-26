# Operação e configuração

## Variáveis

| Variável | Uso |
| --- | --- |
| MONGO_URI / MONGO_DB | Conexão e banco no modo local |
| MONGO_DOCKER_URI | Override de MongoDB dentro do Compose |
| JWT_SECRET | Chave de assinatura; substituir antes de publicar |
| ADMIN_EMAIL | Conta autorizada a treinar/publicar após verificar email |
| DATA_DIR | Volume compartilhado entre API e worker |
| CORS_ORIGINS | Lista separada por vírgula; * apenas para teste |
| DEV_EMAIL_TOKENS | Exibe token somente no modo development |
| SMTP_HOST/PORT/USER/PASSWORD/STARTTLS | Transporte SMTP |
| EXPO_PUBLIC_API_URL | URL embutida no build web |

`ENVIRONMENT=production` recusa segredo de desenvolvimento ou exposição de tokens.
Isso é uma verificação mínima, não uma certificação de segurança para produção.

## Diagnóstico

- API não inicia: confira disponibilidade de MongoDB e índices nos logs.
- Tarefa parada em queued: worker ausente. `docker compose logs worker`.
- Email não chegou: no modo Docker local, veja Mailpit; fora do Docker, configure SMTP.
- 401/403: verificação de email, expiração JWT ou ADMIN_EMAIL diferente.
- 422 no treino: leia o contrato; temporal requer 3 anos e spatial ≥10 blocos.
- 502/failed na coleta: catálogo, assinatura SAS, disponibilidade do raster ou TLS.
- Certificado corporativo: instale a CA confiável no container e configure a cadeia
  apropriada para HTTPX/GDAL. Não desative verificação TLS.
- Todos os pixels mascarados: escolha outra cena ou recorte; não preencha nuvens como temperaturas.

## Backup e recuperação

Faça backup coordenado do MongoDB (`mongodump`) e do volume `geovision_data`.
Para consistência, interrompa API/worker durante o snapshot. Não basta copiar
somente CSVs: permissões, índices, registros e versão ativa ficam no banco.
Teste restauração em ambiente separado. Não guarde senhas no repositório.

## Antes de produção

HTTPS/reverse proxy, autenticação MongoDB, política de backup, SMTP real,
secret management, política de retenção e exclusão de contas, limitação de tamanho
no proxy, monitoramento e orçamento de processamento precisam de revisão.
Os contadores antiabuso usam IP da conexão; atrás de proxy é necessário definir
uma estratégia confiável de client IP. Não confie em X-Forwarded-For arbitrário.

Planeje limpeza de arquivos/tarefas antigos: ainda não há expurgo automático.
Use um worker; falhas podem deixar arquivos temporários ou datasets parciais não
publicados. O ledger não é transacional com o filesystem.

## Compatibilidade

API v0.2 mudou `/map`: exige `dataset_id` e login. Demo pública: `/demo/map`.
As rotas saíram de main.py para routers/. Predição agora recebe JSON validado.
Coleções da versão 0.1 não possuem todos os índices/campos da 0.2. Para testes,
use um banco novo `MONGO_DB=geovision_v2`; migração de dados antigos não é automática.
