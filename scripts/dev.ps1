# Execute na raiz: powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
$ErrorActionPreference = "Stop"
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw "Falha ao iniciar Docker Compose" }
Write-Host "Web: http://localhost:8080 | API: http://localhost:8000/docs | Emails: http://localhost:8025"
