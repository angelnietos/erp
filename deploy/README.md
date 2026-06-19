# Despliegue en servidor Ubuntu (Docker)

> **Para dirección / producto:** [Comparativa SSH vs PaaS — coste y atraso operativo](../docs/deploy/comparativa-ssh-vs-paas.md) · [Resumen ejecutivo](./README-DIRECCION.md)

## Apps y perfiles Compose

| App Nx | Imagen GHCR | Perfil Compose |
|--------|-------------|----------------|
| `backend` | `.../backend:tag` | `core`, `josanz`, `legacy-front`, `all` |
| `josanz-web-app` | `.../josanz-web-app:tag` | `josanz`, `all` |
| `josanz-ui-storybook` | Railway Dockerfile | Storybook UI |
| `frontend` | `.../frontend:tag` | `legacy-front`, `all` |
| `saas-platform` | `.../saas-platform:tag` | `saas`, `all` |
| `document-generator` | `.../document-generator:tag` | `docs`, `all` |
| `verifactu-api` | `.../verifactu-api:tag` | `verifactu`, `all` |
| `verifactu-worker` | `.../verifactu-worker:tag` | `verifactu`, `all` |

Ejemplo mínimo Josanz ERP:

```bash
COMPOSE_PROFILES=josanz,core
```

## Qué incluye el repo

- `docker/backend/Dockerfile` — Node API (`--build-arg NX_PROJECT=backend|verifactu-api|verifactu-worker`)
- `docker/frontend/Dockerfile` — Angular + Nginx (`NX_PROJECT`, `NGINX_PROFILE=spa|frontend`)
- `docker-compose.prod.yml` — Postgres + servicios por perfil
- `.github/workflows/nx-affected-ci.yml` — CI (lint, test, build affected)
- `.github/workflows/docker-images.yml` — build/push matricial a GHCR
- `.github/workflows/deploy-ssh.yml` — deploy automático tras GHCR (main/dev) o manual
- `.github/workflows/deploy-railway.yml` — **legacy** (Railway; sustituido por SSH)
- `deploy/railway/` — Dockerfiles y guía para servicios Railway

## Servidor (una vez)

Documentación completa: **[docs/deploy/ssh-servers.md](../docs/deploy/ssh-servers.md)** (SSH, `/var/deploys/erp`, pipelines, secretos GitHub).

Script de bootstrap:

```bash
sudo bash deploy/scripts/bootstrap-server.sh
```

Pasos resumidos:

1. Docker + Compose v2.
2. Clone en `/var/deploys/erp` y `deploy/.env` (desde `deploy/.env.example`).
3. `DATABASE_URL` con host **`postgres`**.
4. Login GHCR (imágenes privadas):

   ```bash
   echo TOKEN_READ_PACKAGES | docker login ghcr.io -u USUARIO --password-stdin
   ```

5. Migraciones (solo si despliegas `backend`):

   ```bash
   set -a && source deploy/.env && set +a
   docker compose -f docker-compose.prod.yml --profile core run --rm backend \
     npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

6. Arranque:

   ```bash
   set -a && source deploy/.env && set +a
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

## Secretos GitHub (deploy SSH)

| Secreto | Uso |
|---------|-----|
| `DEPLOY_HOST` | IP o hostname |
| `DEPLOY_USER` | Usuario SSH |
| `DEPLOY_SSH_KEY` | Clave privada PEM |
| `DEPLOY_PATH` | Directorio remoto con `deploy/.env` o `deploy/.env.staging` |
| `GHCR_PULL_TOKEN` | PAT `read:packages` |
| `GHCR_PULL_USER` | Usuario del PAT |

Workflow **Deploy — SSH (Ubuntu)** → elegir `production` o `staging` (lee `deploy/.env.production` o `deploy/.env.staging`, con fallback a `deploy/.env`).

## Railway (legacy)

Railway ya no es el destino principal. Usa SSH + GHCR (ver `docs/deploy/ssh-servers.md`).

Si aún necesitas Railway:

- Dockerfiles por app en `deploy/railway/dockerfiles/`.
- Nginx preparado para el `PORT` dinámico de Railway en apps Angular.
- Workflow manual **Deploy — Railway** con selector de entorno y servicio.
- Push a `test-deploy` despliega automáticamente `josanz-web-app` en Railway `staging`.
- La rama `storybook-deploy` despliega el Storybook de `libs/browser/shared/josanz-ui`.
- `railway.json` (commiteado en cada rama de deploy) fuerza el Dockerfile del servicio y evita el `Dockerfile` raíz con `npm ci`.

Lee `deploy/railway/README.md` para crear los servicios, apuntar cada uno a su Dockerfile y configurar secretos como `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID` y `RAILWAY_SERVICE_JOSANZ_WEB_APP`.

## Build local

```bash
docker build -f docker/backend/Dockerfile --build-arg NX_PROJECT=backend -t josanz-backend:local .
docker build -f docker/frontend/Dockerfile --build-arg NX_PROJECT=josanz-web-app --build-arg NGINX_PROFILE=spa -t josanz-web-app:local .
```

Variables en `deploy/.env` y:

```bash
export COMPOSE_PROFILES=josanz,core
export BACKEND_IMAGE=josanz-backend:local
export JOSANZ_WEB_APP_IMAGE=josanz-web-app:local
docker compose -f docker-compose.prod.yml up -d
```

Scripts npm en la raíz: `docker:build:backend`, `docker:build:frontend` (ver `package.json`).
