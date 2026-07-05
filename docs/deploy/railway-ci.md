# Railway: deploy automático y “CI check suite failed”

## Qué está pasando

- **GitHub Actions** puede estar en verde (workflow `Deploy — Railway` correcto).
- **Railway** muestra **“CI check suite failed”** y el deploy queda en **Skipped** cuando el servicio tiene activado **Wait for CI checks before deploying**.

Railway no ejecuta tu build: espera a que los checks de GitHub del commit estén en estado final y, si alguno falla o sigue pendiente, **no despliega**.

## Arreglo recomendado (servicio Storybook en Railway)

En el servicio **`josanz-ui-storybook`** (o el que uses para Storybook):

1. Abre **Railway** → proyecto → servicio Storybook.
2. **Settings** → **Source** (o **GitHub**).
3. En **Wait for CI checks before deploying**:
   - **Opción A (rápida para desarrollo): desactiva el toggle y guarda. El deploy volverá a dispararse al push sin esperar checks.
   - **Opción B (recomendada en producción): configura **qué checks** debe esperar:
     - Añade filtro por check exitoso: **`Storybook CI`**
     - Añade filtro por workflow exitoso: **`Deploy — Railway`** (opcional, si quieres doble validación)
4. Guarda y vuelve a hacer push a `storybook-deploy`.

## Checks que debe ver Railway

| Check en GitHub | Cuándo corre | Notas |
|----------------|--------------|-------|
| **Storybook CI** | Push/PR a `storybook-deploy` o `storybook_deploy` | Workflow dedicado en este repo |
| **Deploy — Railway** | Push a ramas configuradas en `.github/workflows/deploy-railway.yml` | Solo si el job de deploy corre |
| **Storybook Visual Regression (Chromatic)** | Push a `storybook-deploy` | Requiere `CHROMATIC_PROJECT_TOKEN` en GitHub secrets |

Si **Chromatic** no está configurado (`CHROMATIC_PROJECT_TOKEN` vacío), el workflow termina en verde con un aviso (no instala dependencias ni usa caché de pnpm). Antes fallaba en *Post Setup Node* al saltarse `pnpm install` con `cache: pnpm` activo; eso hacía que Railway viera **CI check suite failed**.

## Ramas y nombres

- Conecta el servicio Railway a la rama **`storybook-deploy`** (con guión), que es la que usa el workflow de deploy.
- Evita mezclar `storybook_deploy` (guión bajo) en la conexión de Railway si no está en los watch paths del servicio.

## Build falla con `npm ci` / `ERESOLVE` (Angular 21 vs Storybook)

Railway está usando el **`Dockerfile` de la raíz** en lugar del de Storybook.

En la rama `storybook-deploy`, commitea `railway.json`:

```json
{
  "build": {
    "dockerfilePath": "deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile"
  }
}
```

O en Railway → servicio → **Settings** → **Build** → Dockerfile path: `deploy/railway/dockerfiles/josanz-ui-storybook.Dockerfile`.

El Dockerfile correcto usa **pnpm** (`pnpm install --frozen-lockfile`), no `npm ci`.

## Deploy manual sin esperar CI

En GitHub → **Actions** → **Deploy — Railway** → **Run workflow**:
- Elige rama `storybook-deploy`
- App: `josanz-ui-storybook`
- Environment: `production` o `staging`

## Secretos necesarios en GitHub (repo)

- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_SERVICE_JOSANZ_UI_STORYBOOK`
- `CHROMATIC_PROJECT_TOKEN` (solo si usas Chromatic en CI)

## Variables de entorno para Keycloak en Railway

### Servicio `keycloak`

Variables que debes configurar en Railway → servicio **keycloak** → **Settings** → **Variables**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `KC_DB_URL` | `jdbc:postgresql://${{postgres.PRIVATE_HOST}}:${{postgres.PRIVATE_PORT}/keycloak` | Conexión a PostgreSQL (auto-generado por Railway) |
| `KC_DB_USERNAME` | `${{postgres.PRIVATE_USER}` | Usuario de PostgreSQL (auto-generado) |
| `KC_DB_PASSWORD` | `${{postgres.PRIVATE_PASSWORD}` | Password de PostgreSQL (auto-generado) |
| `KEYCLOAK_ADMIN` | `admin` | Usuario admin de Keycloak |
| `KEYCLOAK_ADMIN_PASSWORD` | `CAMBIAR_EN_PRODUCCION` | Password admin de Keycloak |
| `KC_HOSTNAME` | `${{railway.public_url}}` o dominio público | URL pública para redirecciones OAuth |
| `KC_PROXY` | `edge` | Necesario para funcionar tras proxy inverso |
| `KC_HOSTNAME_STRICT` | `false` | Permite hostnames dinámicos |

### Servicio `josanz-web-app`

Variables que debes configurar en Railway → servicio **josanz-web-app** → **Settings** → **Variables**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `KEYCLOAK_URL` | `${{keycloak.RAILWAY_PUBLIC_DOMAIN}}` o `https://nombre.up.railway.app` | URL pública del servicio keycloak |
| `KEYCLOAK_URL` | `http://${{keycloak.RAILWAY_PRIVATE_DOMAIN}}:8080` | URL privada para comunicación interna (Nginx proxy `/auth/` hacia keycloak) |
| `KEYCLOAK_REALM` | `josanz-web-app-realm` | Realm configurado en keycloak |
| `KEYCLOAK_CLIENT_ID` | `josanz-figma-spa` | Client ID público configurado |
| `KEYCLOAK_ENABLED` | `true` | Habilita Keycloak auth |
| `BACKEND_PROXY_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:3000` | (Opcional) API backend si tienes servicio backend conectado |

### Configuración de Nginx para Keycloak

El `frontend.conf.template` proxy `/api/` al backend. Para Keycloak, agrega un `location /auth/` en tu configuración de Nginx si el frontend necesita conectar directamente, o usa la URL pública en `KEYCLOAK_URL`.