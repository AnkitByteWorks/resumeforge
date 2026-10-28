Set-Location (Join-Path $PSScriptRoot "..")
docker compose --env-file .env -f infrastructure/docker-compose.yml up -d
