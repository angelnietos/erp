# Railway: Guía completa de despliegue

## Índice

- [Preparación](#preparación)
- [Configuración de servicios](#configuración-de-servicios)
- [Despliegue de Keycloak](#despliegue-de-keycloak)
- [Despliegue de josanz-web-app (frontend)](#despliegue-de-josanz-web-app-frontend)
- [Despliegue de backend](#despliegue-de-backend)
- [Despliegue de Storybook](#despliegue-de-storybook)
- [Variables de entorno](#variables-de-entorno)
- [Troubleshooting](#troubleshooting)

## Preparación

1. **Crear servicios en Railway** (si no existen):
   - En Railway → New Project → Add Service → Deploy from Repo
   - Configura cada servicio con su Dockerfile correspondiente

2. **Secretos en GitHub** (Settings → Secrets and variables → Actions):
   - `RAILWAY_TOKEN` - Token de Railway (User Settings → Tokens)
   - `RAILWAY_PROJECT_ID` - ID del proyecto (copiar desde Railway)
   - `RAILWAY_SERVICE_KEYCLOAK` - ID del servicio keycloak
   - `RAILWAY_SERVICE_JOSANZ_WEB_APP` - ID del servicio josanz-web-app
   - `RAILWAY_SERVICE_BACKEND` - ID del servicio backend
   - `RAILWAY_SERVICE_JOSANZ_UI_STORYBOOK` - ID del servicio storybook

## Configuración de servicios

### Servicios disponibles y sus Dockerfiles

| Servicio | Dockerfile | Rama deploy | Default Environment |
|----------|------------|-------------|---------------------|
| `keycloak` | `deploy/railway/dockerfiles/keycloak.Dockerfile` | `dev`, `main` | staging |
| `josanz-web-app` | `deploy/railway/dockerfiles/josanz-web-app.Dockerfile` | `dev`, `main` | staging |
| `backend` | `deploy/railway/dockerfiles/backend.Dockerfile` | `dev`, `main` | staging |
| `josanz-ui-storybook` | `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile` | `storybook-deploy` | production/staging |
| `frontend` | `deploy/railway/dockerfiles/frontend.Dockerfile` | - | - |
| `saas-platform` | `deploy/railway/dockerfiles/saas-platform.Dockerfile` | - | - |
| `verifactu-api` | `deploy/railway/dockerfiles/verifactu-api.Dockerfile` | - | - |
| `verifactu-worker` | `deploy/railway/dockerfiles/verifactu-worker.Dockerfile` | - | - |
| `document-generator` | `deploy/railway/dockerfiles/document-generator.Dockerfile` | - | - |

## Despliegue de Keycloak

### 1. Crear servicio en Railway
1. Railway → New Service → Deploy from Dockerfile
2. Dockerfile path: `deploy/railway/dockerfiles/keycloak.Dockerfile`
3. Branch: `main` o `dev`

### 2. Conectar PostgreSQL
1. Railway → Add Service → PostgreSQL
2. El nombre del servicio debe ser `postgres` (predeterminado)

### 3. Variables de entorno (Settings → Variables)

| Variable | Valor de ejemplo | Descripción |
|----------|------------------|-------------|
| `KC_DB_URL` | `${{postgres.PRIVATE_HOST}}:${{postgres.PRIVATE_PORT}}/keycloak` | URL de conexión auto-generado |
| `KC_DB_USERNAME` | `${{postgres.PRIVATE_USER}` | Usuario PostgreSQL |
| `KC_DB_PASSWORD` | `${{postgres.PRIVATE_PASSWORD}` | Password PostgreSQL |
| `KEYCLOAK_ADMIN` | `admin` | Admin user |
| `KEYCLOAK_ADMIN_PASSWORD` | `CAMBIAR_EN_PRODUCCION` | Admin password |
| `KC_HOSTNAME` | `${{railway.public_url}` | URL pública del servicio |
| `KC_PROXY` | `edge` | Necesario para proxy inverso |
| `KC_HOSTNAME_STRICT` | `false` | Permite hostnames dinámicos |

### 4. Redirecciones OAuth (opcional)
Actualizar `docker/keycloak/realms/josanz-web-app-realm.json` con los dominios de Railway:

```json
"webOrigins": [
  "https://${{josanz-web-app.RAILWAY_PUBLIC_DOMAIN}}",
  "https://${{backend.RAILWAY_PUBLIC_DOMAIN}}"
],
"redirectUris": [
  "https://${{josanz-web-app.RAILWAY_PUBLIC_DOMAIN}}/*"
]
```

## Despliegue de josanz-web-app (frontend)

### 1. Crear servicio en Railway
1. Railway → New Service → Deploy from Dockerfile
2. Dockerfile path: `deploy/railway/dockerfiles/josanz-web-app.Dockerfile`
3. Branch: `main` o `dev`

### 2. Variables de entorno

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `KEYCLOAK_URL` | `${{keycloak.RAILWAY_PUBLIC_DOMAIN}` | URL pública de Keycloak |
| `KEYCLOAK_REALM` | `josanz-web-app-realm` | Realm configurado |
| `KEYCLOAK_CLIENT_ID` | `josanz-figma-spa` | Client ID público |
| `KEYCLOAK_ENABLED` | `true` | Habilita Keycloak |
| `BACKEND_PROXY_URL` | `${{backend.RAILWAY_PRIVATE_DOMAIN}:3000` | API del backend (opcional) |

### 3. Cómo funciona el env.js
El Dockerfile genera dinámicamente `/usr/share/nginx/html/env.js` en el arranque usando `envsubst`. Este archivo contiene:

```javascript
window.__ENV__ = {
  KEYCLOAK_URL: 'https://...',
  KEYCLOAK_REALM: 'josanz-web-app-realm',
  KEYCLOAK_CLIENT_ID: 'josanz-figma-spa',
  KEYCLOAK_ENABLED: 'true'
};
```

La app Angular lee estas variables en `app.config.ts` mediante `getKeycloakConfig()`.

## Despliegue de backend

### 1. Variables requeridas

Revisar `apps/backend/.env` y adaptar para Railway. Variables típicas:

| Variable | Valor desde Railway |
|----------|---------------------|
| `DATABASE_URL` | `${{postgres.PRIVATE_URL}` o construir desde partes |
| `JWT_SECRET` | Generar un secreto de 32+ caracteres |
| `CORS_ORIGIN` | `https://${{josanz-web-app.RAILWAY_PUBLIC_DOMAIN}` |

### 2. Puerto
El backend usa `PORT` (no `3000` fijo). Railway lo inyecta automáticamente.

## Despliegue de Storybook

### Configuración CI
1. Branch: `storybook-deploy` (con guión)
2. En Railway → servicio Storybook → Settings → Source
3. **Wait for CI checks**: Configurar para esperar `Storybook CI`

### Secrets
- `CHROMATIC_PROJECT_TOKEN` (opcional, para visual regression)

### Deploy manual
```bash
gh workflow run "Deploy — Railway" \
  -f environment=production \
  -f app=josanz-ui-storybook
```

## Variables de entorno del workflow

El workflow `.github/workflows/deploy-railway.yml` escribe dinámicamente `railway.json`:

```json
{
  "build": {
    "dockerfilePath": "deploy/railway/dockerfiles/{nombre}.Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Troubleshooting

### "CI check suite failed"
- Desactivar "Wait for CI checks before deploying" en Railway (opción A)
- O configurar filtros de checks específicos (opción B)

### Build falla con npm ci
Railway está usando Dockerfile incorrecto. Verificar en servicio → Settings → Build → Dockerfile path.

### Keycloak no inicia
- Verificar `KC_DB_URL` apunta a PostgreSQL correcto
- Revisar logs: `docker logs` o Railway → Deployments → View Logs
- Asegurar la base de datos está creada antes del primer arranque

### Frontend no se conecta a Keycloak
- Verificar `KEYCLOAK_URL` tiene `https://` y puerto correcto
- Revisar que el realm y clientId coinciden con `josanz-web-app-realm.json`
- Ver Network tab: el `/env.js` debe cargar con valores correctos