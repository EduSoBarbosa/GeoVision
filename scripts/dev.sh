#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then cp .env.example .env; fi
docker compose up --build -d
printf '%s\n' 'Web: http://localhost:8080 | API: http://localhost:8000/docs | Emails: http://localhost:8025'
