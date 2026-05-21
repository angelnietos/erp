# Despliegue en servidor Ubuntu (Docker)

## Apps y perfiles Compose

| App Nx | Imagen GHCR | Perfil Compose |
|--------|-------------|----------------|
| `backend` | `.../backend:tag` | `core`, `josanz`, `legacy-front`, `all` |
| `josanz-web-app` | `.../josanz-web-app:tag` | `josanz`, `all` |
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
- `.github/workflows/deploy-ssh.yml` — deploy por SSH (`production` / `staging`)
- `.github/workflows/deploy-railway.yml` — deploy manual a Railway por servicio
- `deploy/railway/` — Dockerfiles y guía para servicios Railway

## Servidor (una vez)

1. Docker + Compose v2.
2. Copiar `docker-compose.prod.yml` y `deploy/.env` (desde `deploy/.env.example`).
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

## Railway

También hay configuración para desplegar servicios individuales en Railway:

- Dockerfiles por app en `deploy/railway/dockerfiles/`.
- Nginx preparado para el `PORT` dinámico de Railway en apps Angular.
- Workflow manual **Deploy — Railway** con selector de entorno y servicio.
- Push a `test-deploy` despliega automáticamente `backend` y `josanz-web-app` en Railway `staging`.

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
