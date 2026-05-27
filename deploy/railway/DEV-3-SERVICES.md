# Despliegue `dev` — backend + josanz-web-app + Storybook

Guía para publicar **3 servicios Railway** desde la **misma rama `dev`**, usando el monorepo Nx sin `Root Directory` (el build necesita `libs/`, `package.json`, `pnpm-lock.yaml`, etc.).

## Resumen

| Servicio Railway | App Nx | Config Railway | Dockerfile |
|------------------|--------|----------------|------------|
| `backend` | `backend` | `deploy/railway/config/backend.railway.json` | `deploy/railway/dockerfiles/backend.Dockerfile` |
| `josanz-web-app` | `josanz-web-app` | `deploy/railway/config/josanz-web-app.railway.json` | `deploy/railway/dockerfiles/josanz-web-app.Dockerfile` |
| `josanz-ui-storybook` | `josanz-ui` (build-storybook) | `deploy/railway/config/josanz-ui-storybook.railway.json` | `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile` |

## Paso 1 — Proyecto y base de datos

1. Crea un **proyecto** en Railway.
2. Añade **PostgreSQL** (plugin) si el backend aún no tiene `DATABASE_URL`.
3. Crea **3 servicios** vacíos en el mismo proyecto (no uses un solo servicio para todo).

## Paso 2 — Conectar GitHub (los 3 iguales)

En **cada** servicio → **Settings** → **Source**:

| Campo | Valor |
|-------|--------|
| Repo | Este monorepo |
| Branch | `dev` |
| Root Directory | *(vacío — raíz del repo)* |
| Wait for CI | Desactivado al principio; luego opcional (ver [railway-ci.md](../../docs/deploy/railway-ci.md)) |

## Paso 3 — Build por servicio

En **Settings** → **Build** de cada servicio:

### Backend

- **Builder**: Dockerfile (o Config-as-code)
- **Config file path**: `deploy/railway/config/backend.railway.json`
- **Dockerfile path** (si no usas config file): `deploy/railway/dockerfiles/backend.Dockerfile`
- **Custom Build / Start Command**: vacíos

### josanz-web-app

- **Config file path**: `deploy/railway/config/josanz-web-app.railway.json`
- **Dockerfile path**: `deploy/railway/dockerfiles/josanz-web-app.Dockerfile`

### josanz-ui-storybook

- **Config file path**: `deploy/railway/config/josanz-ui-storybook.railway.json`
- **Dockerfile path**: `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile`

> **Importante:** No uses el `Dockerfile` de la raíz del repo (`npm ci`). Los Dockerfiles de `deploy/railway/dockerfiles/` usan **pnpm** y evitan conflictos Angular/Storybook.

## Paso 4 — Watch Paths (solo lo que toca a cada servicio)

En **Settings** → **Deploy** → **Watch Paths**, pega el contenido de cada archivo (una línea = un patrón):

- Backend: [watch-paths/backend.txt](./watch-paths/backend.txt)
- Front: [watch-paths/josanz-web-app.txt](./watch-paths/josanz-web-app.txt)
- Storybook: [watch-paths/josanz-ui-storybook.txt](./watch-paths/josanz-ui-storybook.txt)

Así un push a `dev` **solo redeploya** el servicio cuyos paths cambiaron. Si cambias `libs/browser/shared/josanz-ui`, se desplegarán **front + Storybook** (comparten la librería).

## Paso 5 — Variables de entorno

Plantillas en [env/](./env/):

- [backend.env.example](./env/backend.env.example) — `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc.
- [josanz-web-app.env.example](./env/josanz-web-app.env.example) — `BACKEND_PROXY_URL` para proxy `/api` en Nginx
- [josanz-ui-storybook.env.example](./env/josanz-ui-storybook.env.example) — normalmente solo `PORT` (automático)

### CORS (backend)

Tras el primer deploy, copia las URLs públicas de Railway y actualiza:

```env
CORS_ORIGIN=https://<josanz-web-app>.up.railway.app,https://<storybook>.up.railway.app
```

### Proxy API (front)

El front sirve estáticos y reenvía `/api/*` al backend:

```env
BACKEND_PROXY_URL=http://<nombre-servicio-backend>.railway.internal:3000
```

O la URL pública del backend si no usas red privada.

## Paso 6 — Migraciones Prisma (backend)

Railway no ejecuta migraciones solo. Tras el primer deploy del backend:

```bash
railway login
railway link
railway run --service backend --environment production -- \
  npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

(O desde CI/job manual cuando tengáis `DATABASE_URL` en Railway.)

## Paso 7 — Push a `dev`

1. Haz commit de estos archivos en la rama `dev`.
2. `git push origin dev`
3. Railway detecta el push y despliega **cada servicio** según Watch Paths.

### Opción B — GitHub Actions (mismo push)

El workflow [.github/workflows/deploy-railway.yml](../../.github/workflows/deploy-railway.yml) también despliega en push a `dev` si tienes secretos:

| Secreto GitHub | Servicio |
|----------------|----------|
| `RAILWAY_TOKEN` | Todos |
| `RAILWAY_PROJECT_ID` | Todos |
| `RAILWAY_SERVICE_BACKEND` | backend |
| `RAILWAY_SERVICE_JOSANZ_WEB_APP` | josanz-web-app |
| `RAILWAY_SERVICE_JOSANZ_UI_STORYBOOK` | Storybook |

Puedes usar **solo Railway Git**, **solo Actions**, o ambos (evita duplicar deploys si no lo necesitas).

## Probar builds en local

```bash
pnpm run docker:build:railway:backend
pnpm run docker:build:railway:josanz-web-app
pnpm run docker:build:railway:josanz-ui-storybook
```

## Error `npm ci` / `ERESOLVE` (Angular 21 vs Storybook)

Si el log de build muestra `RUN npm ci` y conflictos entre `@angular/compiler-cli@21` y `@storybook/angular@8`, Railway **no** está usando el Dockerfile de pnpm.

**Arreglo en Railway → servicio `josanz-web-app` → Settings → Build:**

| Campo | Valor correcto |
|-------|----------------|
| Builder | **Dockerfile** (no Railpack / Nixpacks) |
| Dockerfile path | `deploy/railway/dockerfiles/josanz-web-app.Dockerfile` |
| Config file path | `deploy/railway/config/josanz-web-app.railway.json` |
| Custom Build Command | *(vacío)* |

Tras guardar, **Redeploy**. El log debe mostrar `pnpm install --frozen-lockfile`, no `npm ci`.

> El `Dockerfile` de la raíz del repo también usa pnpm (fallback), pero backend y Storybook **deben** tener su propio config file path; no uses el de la raíz para todos los servicios.

## Checklist rápido

- [ ] 3 servicios creados en un proyecto Railway
- [ ] Los 3 apuntan a rama `dev`, root vacío
- [ ] Cada uno tiene su `config/*.railway.json` o Dockerfile path correcto
- [ ] Watch Paths pegados desde `watch-paths/`
- [ ] `DATABASE_URL` + migraciones en backend
- [ ] `CORS_ORIGIN` con URLs reales del front y Storybook
- [ ] `BACKEND_PROXY_URL` en josanz-web-app
- [ ] Push a `dev` y revisar logs de build en Railway

## Ramas legacy

Siguen funcionando ramas dedicadas si las usabas antes:

- `test-deploy` → solo `josanz-web-app` (Actions)
- `storybook-deploy` → solo Storybook (Actions)
- `backend-deploy` → solo backend (Actions)

Para el flujo unificado de desarrollo, usa **`dev`** con los 3 servicios.
