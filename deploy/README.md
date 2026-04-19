# Despliegue en servidor Ubuntu (Docker)

## Qué incluye el repo

- `docker/backend/Dockerfile` — API Nest (build con Nx + `pnpm`).
- `docker/frontend/Dockerfile` — Angular estático + Nginx; proxy `/api` → backend.
- `docker-compose.prod.yml` — Postgres, backend, frontend (solo **imágenes**; el build ocurre en CI o en local).
- `.github/workflows/docker-images.yml` — sube imágenes a **GHCR** (`ghcr.io/<owner>/<repo>/backend|frontend`).
- `.github/workflows/deploy-ssh.yml` — opcional: `docker compose pull && up` por SSH (requiere secretos).

## Servidor (una vez)

1. Instalar Docker y plugin Compose v2.
2. Clonar o copiar en el servidor al menos:
   - `docker-compose.prod.yml`
   - `deploy/.env` (partir de `deploy/.env.example`)
3. En `deploy/.env`:
   - `DATABASE_URL` con host **`postgres`** (nombre del servicio en compose).
   - `BACKEND_IMAGE` / `FRONTEND_IMAGE` con el tag que publica CI. En **GHCR** el owner/repo debe ir en **minúsculas** (p. ej. `ghcr.io/mi-org/mi-repo/backend:main`).
4. Login en GHCR (imágenes privadas):
   ```bash
   echo TOKEN_READ_PACKAGES | docker login ghcr.io -u USUARIO --password-stdin
   ```
5. Migraciones Prisma (primera vez o tras cambios de schema), desde el host:
   ```bash
   docker compose -f docker-compose.prod.yml run --rm backend \
     npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```
6. Arranque:
   ```bash
   set -a && source deploy/.env && set +a
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

## CI/CD — secretos GitHub (deploy por SSH)

| Secreto            | Uso                                      |
| ------------------ | ---------------------------------------- |
| `DEPLOY_HOST`      | IP o hostname del servidor               |
| `DEPLOY_USER`      | Usuario SSH                              |
| `DEPLOY_SSH_KEY`   | Clave privada (PEM)                      |
| `DEPLOY_PATH`      | Directorio remoto con `deploy/.env`      |
| `GHCR_PULL_TOKEN`  | PAT con `read:packages` (pull imágenes)  |
| `GHCR_PULL_USER`   | Usuario asociado al PAT                  |

Ejecutar workflow **Deploy — SSH (Ubuntu)** manualmente tras un push que haya publicado imágenes. Configura los secretos anteriores en el repositorio; si falta alguno, el job fallará de forma explícita.

## Build local sin registry

```bash
docker build -f docker/backend/Dockerfile -t josanz-backend:local .
docker build -f docker/frontend/Dockerfile -t josanz-frontend:local .
export BACKEND_IMAGE=josanz-backend:local FRONTEND_IMAGE=josanz-frontend:local
# Completar deploy/.env (DATABASE_URL, JWT_*, etc.)
docker compose -f docker-compose.prod.yml up -d
```

Desde la raíz del monorepo también puedes usar `npm run docker:build:backend`, `npm run docker:build:frontend` y `npm run docker:prod:pull` (requiere `deploy/.env` con las variables anteriores).
