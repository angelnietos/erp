# Despliegue en Railway

Esta carpeta contiene la configuración para desplegar los servicios del monorepo en Railway sin depender de `--build-arg` en CI. Cada servicio Railway debe apuntar al Dockerfile específico de su app.

## Rama `dev` — backend + front + Storybook

Guía paso a paso (3 servicios, misma rama, Watch Paths): **[DEV-3-SERVICES.md](./DEV-3-SERVICES.md)**

Config as code por servicio:

| Servicio            | Archivo                                                  |
| ------------------- | -------------------------------------------------------- |
| backend             | `deploy/railway/config/backend.railway.json`             |
| josanz-web-app      | `deploy/railway/config/josanz-web-app.railway.json`      |
| josanz-ui-storybook | `deploy/railway/config/josanz-ui-storybook.railway.json` |

Watch Paths (copiar en Railway): `deploy/railway/watch-paths/*.txt`

## Servicios

| App Nx                | Dockerfile Railway                                          | Notas                                                      |
| --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `backend`             | `deploy/railway/dockerfiles/backend.Dockerfile`             | API principal, usa `PORT` de Railway                       |
| `verifactu-api`       | `deploy/railway/dockerfiles/verifactu-api.Dockerfile`       | Mapea `PORT` a `VERIFACTU_PORT`                            |
| `verifactu-worker`    | `deploy/railway/dockerfiles/verifactu-worker.Dockerfile`    | Mapea `PORT` a `VERIFACTU_WORKER_PORT`                     |
| `frontend`            | `deploy/railway/dockerfiles/frontend.Dockerfile`            | Nginx SPA con proxy `/api`; configurar `BACKEND_PROXY_URL` |
| `josanz-web-app`      | `deploy/railway/dockerfiles/josanz-web-app.Dockerfile`      | Nginx SPA, usa `PORT` de Railway                           |
| `josanz-ui-storybook` | `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile` | Storybook estático de `libs/browser/shared/josanz-ui`      |
| `saas-platform`       | `deploy/railway/dockerfiles/saas-platform.Dockerfile`       | Nginx SPA, usa `PORT` de Railway                           |
| `document-generator`  | `deploy/railway/dockerfiles/document-generator.Dockerfile`  | Nginx SPA, usa `PORT` de Railway                           |

## Configuración en Railway

1. Crea un proyecto Railway y un servicio por cada app que quieras publicar.
2. En cada servicio, usa el repo GitHub como source y configura:
   - Root directory: raíz del repositorio.
   - Builder: Dockerfile.
   - Dockerfile path: el path de la tabla anterior.
3. Añade las variables de entorno de cada app en Railway.
4. Si despliegas `frontend`, define `BACKEND_PROXY_URL` con la URL interna o pública del servicio `backend`.
5. Para servicios backend con Prisma, usa la `DATABASE_URL` de la base de datos Railway y ejecuta migraciones antes de promover el entorno.

Para el stack **`dev`** (backend + `josanz-web-app` + Storybook), sigue **[DEV-3-SERVICES.md](./DEV-3-SERVICES.md)**.

Para publicar solo `josanz-web-app`, puedes dejar Railway así:

- Source: repo de GitHub.
- Branch: `test-deploy`.
- Builder: Dockerfile o config-as-code desde `railway.json`.
- Custom Build Command: vacío.
- Custom Start Command: vacío.
- Variables del servicio: ninguna obligatoria para el front estático. Railway inyecta `PORT` automáticamente y el Dockerfile lo usa en Nginx.

Para publicar el Storybook de `josanz-ui`, usa la rama `storybook-deploy`:

- Source: repo de GitHub.
- Branch: `storybook-deploy`.
- **Commit `railway.json` en la rama** apuntando a `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile`.
  Sin este archivo, Railway usa el `Dockerfile` de la raíz (`npm ci`) y falla con `ERESOLVE` (Angular 21 vs Storybook 8).
- En el servicio Railway, Builder: **Dockerfile** (no Railpack/Nixpacks).
- Dockerfile path (si no usas `railway.json`): `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile`.
- Custom Build Command: vacío.
- Custom Start Command: vacío.
- Variables del servicio: ninguna obligatoria. Railway inyecta `PORT` automáticamente.

## GitHub Actions

El workflow `.github/workflows/deploy-railway.yml` despliega manualmente con Railway CLI.

Si Railway muestra **“CI check suite failed”** y el deploy queda en **Skipped** aunque GitHub Actions esté en verde, revisa [docs/deploy/railway-ci.md](../../docs/deploy/railway-ci.md) (opción **Wait for CI** en el servicio).

También se ejecuta automáticamente al hacer `push` a la rama configurada. En `test-deploy` despliega `josanz-web-app`; en `storybook-deploy` despliega `josanz-ui-storybook`. Si faltan secretos en un push automático, el deploy se omite con warning para no dejar la rama roja durante la configuración inicial. El despliegue manual sigue permitiendo elegir cualquier servicio y entorno, y falla si falta configuración.

El `railway.json` de la raíz solo define política de reinicio. **Cada servicio** debe usar su config en `deploy/railway/config/<servicio>.railway.json` (o el Dockerfile path de la tabla). Así Railway deja de usar Railpack + `npm ci` del `Dockerfile` legacy de la raíz.

Los Dockerfiles copian `scripts/` y `apps/backend/prisma/` antes de `pnpm install`, porque el `postinstall` del monorepo ejecuta Prisma y scripts de enlace.

Secretos necesarios:

| Secreto                               | Uso                                                   |
| ------------------------------------- | ----------------------------------------------------- |
| `RAILWAY_TOKEN`                       | Token de Railway con permisos de deploy               |
| `RAILWAY_PROJECT_ID`                  | ID del proyecto Railway                               |
| `RAILWAY_SERVICE_BACKEND`             | ID o nombre exacto del servicio `backend`             |
| `RAILWAY_SERVICE_VERIFACTU_API`       | ID o nombre exacto del servicio `verifactu-api`       |
| `RAILWAY_SERVICE_VERIFACTU_WORKER`    | ID o nombre exacto del servicio `verifactu-worker`    |
| `RAILWAY_SERVICE_FRONTEND`            | ID o nombre exacto del servicio `frontend`            |
| `RAILWAY_SERVICE_JOSANZ_WEB_APP`      | ID o nombre exacto del servicio `josanz-web-app`      |
| `RAILWAY_SERVICE_JOSANZ_UI_STORYBOOK` | ID o nombre exacto del servicio `josanz-ui-storybook` |
| `RAILWAY_SERVICE_SAAS_PLATFORM`       | ID o nombre exacto del servicio `saas-platform`       |
| `RAILWAY_SERVICE_DOCUMENT_GENERATOR`  | ID o nombre exacto del servicio `document-generator`  |

Para desplegar solo el front de Josanz en push, necesitas `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID` y `RAILWAY_SERVICE_JOSANZ_WEB_APP`. Si eliges `all` manualmente, deben existir todos los secretos de los servicios incluidos.

## Migraciones Prisma

Railway no ejecuta migraciones automáticamente desde esta configuración. Para el backend principal:

```bash
railway run --service backend --environment production -- npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

Ejecuta este comando desde una máquina con Railway CLI autenticada, o añade un job específico cuando el flujo de base de datos esté cerrado.
