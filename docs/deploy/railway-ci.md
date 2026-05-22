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