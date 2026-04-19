#!/usr/bin/env bash
# Despliegue remoto por SSH (Ubuntu con Docker instalado).
# Uso: ./scripts/deploy-remote.sh usuario@servidor /opt/josanz-erp
set -euo pipefail
REMOTE="${1:?usuario@host}"
REMOTE_DIR="${2:?ruta en el servidor (contiene deploy/.env y docker-compose.prod.yml)}"

ssh -o StrictHostKeyChecking=accept-new "$REMOTE" \
  "set -euo pipefail; cd \"$REMOTE_DIR\"; \
   if [ -f deploy/.env ]; then set -a; . deploy/.env; set +a; fi; \
   if [ -n \"\${GHCR_TOKEN:-}\" ]; then echo \"\$GHCR_TOKEN\" | docker login ghcr.io -u \"\${GHCR_USER:-}\" --password-stdin; fi; \
   docker compose -f docker-compose.prod.yml pull; \
   docker compose -f docker-compose.prod.yml up -d --remove-orphans; \
   docker compose -f docker-compose.prod.yml ps"
