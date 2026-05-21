# Despliegue en Railway

Esta carpeta contiene la configuración para desplegar los servicios del monorepo en Railway sin depender de `--build-arg` en CI. Cada servicio Railway debe apuntar al Dockerfile específico de su app.

## Servicios

| App Nx | Dockerfile Railway | Notas |
|--------|--------------------|-------|
| `backend` | `deploy/railway/dockerfiles/backend.Dockerfile` | API principal, usa `PORT` de Railway |
| `verifactu-api` | `deploy/railway/dockerfiles/verifactu-api.Dockerfile` | Mapea `PORT` a `VERIFACTU_PORT` |
| `verifactu-worker` | `deploy/railway/dockerfiles/verifactu-worker.Dockerfile` | Mapea `PORT` a `VERIFACTU_WORKER_PORT` |
| `frontend` | `deploy/railway/dockerfiles/frontend.Dockerfile` | Nginx SPA con proxy `/api`; configurar `BACKEND_PROXY_URL` |
| `josanz-web-app` | `deploy/railway/dockerfiles/josanz-web-app.Dockerfile` | Nginx SPA, usa `PORT` de Railway |
| `saas-platform` | `deploy/railway/dockerfiles/saas-platform.Dockerfile` | Nginx SPA, usa `PORT` de Railway |
| `document-generator` | `deploy/railway/dockerfiles/document-generator.Dockerfile` | Nginx SPA, usa `PORT` de Railway |

## Configuración en Railway

1. Crea un proyecto Railway y un servicio por cada app que quieras publicar.
2. En cada servicio, usa el repo GitHub como source y configura:
   - Root directory: raíz del repositorio.
   - Builder: Dockerfile.
   - Dockerfile path: el path de la tabla anterior.
3. Añade las variables de entorno de cada app en Railway.
4. Si despliegas `frontend`, define `BACKEND_PROXY_URL` con la URL interna o pública del servicio `backend`.
5. Para servicios backend con Prisma, usa la `DATABASE_URL` de la base de datos Railway y ejecuta migraciones antes de promover el entorno.

## GitHub Actions

El workflow `.github/workflows/deploy-railway.yml` despliega manualmente con Railway CLI.

También se ejecuta automáticamente al hacer `push` a la rama `test-deploy`. En ese caso despliega `backend` y `josanz-web-app` contra el entorno Railway `staging`. El servicio `backend` empaqueta la parte Node y las librerías de `libs/node` que usa la app. Si faltan secretos en un push automático, el deploy se omite con warning para no dejar la rama roja durante la configuración inicial. El despliegue manual sigue permitiendo elegir cualquier servicio y entorno, y falla si falta configuración.

Secretos necesarios:

| Secreto | Uso |
|---------|-----|
| `RAILWAY_TOKEN` | Token de Railway con permisos de deploy |
| `RAILWAY_PROJECT_ID` | ID del proyecto Railway |
| `RAILWAY_SERVICE_BACKEND` | ID o nombre exacto del servicio `backend` |
| `RAILWAY_SERVICE_VERIFACTU_API` | ID o nombre exacto del servicio `verifactu-api` |
| `RAILWAY_SERVICE_VERIFACTU_WORKER` | ID o nombre exacto del servicio `verifactu-worker` |
| `RAILWAY_SERVICE_FRONTEND` | ID o nombre exacto del servicio `frontend` |
| `RAILWAY_SERVICE_JOSANZ_WEB_APP` | ID o nombre exacto del servicio `josanz-web-app` |
| `RAILWAY_SERVICE_SAAS_PLATFORM` | ID o nombre exacto del servicio `saas-platform` |
| `RAILWAY_SERVICE_DOCUMENT_GENERATOR` | ID o nombre exacto del servicio `document-generator` |

Solo necesitas crear el secreto del servicio que vayas a desplegar. Si eliges `all`, deben existir todos los secretos de los servicios incluidos.

## Migraciones Prisma

Railway no ejecuta migraciones automáticamente desde esta configuración. Para el backend principal:

```bash
railway run --service backend --environment production -- npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

Ejecuta este comando desde una máquina con Railway CLI autenticada, o añade un job específico cuando el flujo de base de datos esté cerrado.
