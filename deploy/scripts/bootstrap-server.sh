#!/usr/bin/env bash
# Bootstrap inicial en Ubuntu: Docker + clone en /var/deploys/erp
# Uso: sudo bash deploy/scripts/bootstrap-server.sh
#      o desde el repo ya clonado: sudo bash deploy/scripts/bootstrap-server.sh --skip-clone
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/var/deploys}"
REPO_NAME="${REPO_NAME:-erp}"
REPO_URL="${REPO_URL:-https://github.com/angelnietos/erp.git}"
SKIP_CLONE=false

for arg in "$@"; do
  case "$arg" in
    --skip-clone) SKIP_CLONE=true ;;
  esac
done

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta con sudo."
  exit 1
fi

TARGET_USER="${SUDO_USER:-${USER}}"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"

echo "==> Instalando Docker (si falta)..."
if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

usermod -aG docker "$TARGET_USER" 2>/dev/null || true

echo "==> Preparando ${DEPLOY_ROOT}..."
mkdir -p "$DEPLOY_ROOT"
chown "$TARGET_USER:$TARGET_USER" "$DEPLOY_ROOT"

REPO_PATH="${DEPLOY_ROOT}/${REPO_NAME}"

if [ "$SKIP_CLONE" = false ]; then
  if [ -d "$REPO_PATH/.git" ]; then
    echo "==> Repo ya existe en $REPO_PATH (omitir clone)"
  else
    echo "==> Clonando $REPO_URL ..."
    sudo -u "$TARGET_USER" git clone "$REPO_URL" "$REPO_PATH"
  fi
fi

if [ ! -f "$REPO_PATH/deploy/.env" ]; then
  sudo -u "$TARGET_USER" cp "$REPO_PATH/deploy/.env.example" "$REPO_PATH/deploy/.env"
  echo ""
  echo "IMPORTANTE: edita $REPO_PATH/deploy/.env antes del primer up"
fi

cat <<EOF

Bootstrap listo.

Siguiente (como $TARGET_USER):
  1. Editar ${REPO_PATH}/deploy/.env
  2. docker login ghcr.io   # PAT read:packages
  3. cd ${REPO_PATH}
     set -a && source deploy/.env && set +a
     docker compose -f docker-compose.prod.yml pull
     docker compose -f docker-compose.prod.yml up -d
  4. Migraciones:
     docker compose -f docker-compose.prod.yml --profile core run --rm backend \\
       npx prisma migrate deploy --schema=./prisma/schema.prisma

Para CI: añade la clave pública de GitHub Actions a ~${TARGET_USER}/.ssh/authorized_keys
DEPLOY_PATH en secretos = ${REPO_PATH}

EOF
