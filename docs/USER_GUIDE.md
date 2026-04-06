# Guía de usuario — Josanz ERP (resumen)

Esta guía resume flujos habituales y enlaces técnicos. El producto es un monorepo Nx con frontend Angular y API NestJS.

## Acceso y entorno

- **Frontend**: por defecto `http://localhost:4200`. La ruta `/` redirige al **Dashboard**.
- **API**: proxy del frontend hacia el backend; muchas rutas requieren cabecera **`x-tenant-id`** con un UUID de inquilino válido (el interceptor de tenant la envía si está configurada la sesión).
- **Documentación OpenAPI (Swagger)**: con el backend en marcha, suele estar en **`/api/docs`** (según `main.ts` del backend).
- **Salud del API (Fase 4)**: `GET /api/health` sin cabecera de tenant (ruta pública).
- **Migraciones (Fase 4)**: tras actualizar el código, aplica migraciones Prisma (p. ej. `pnpm run db:migrate`) para tablas `erp_receipts`, `domain_events`, `integration_webhooks` y entregas.

## Módulos principales

| Área | Qué hacer |
|------|-----------|
| **Dashboard** | KPIs y resumen; los indicadores pueden cargarse desde el endpoint de analytics si la API responde. |
| **Presupuestos** | Detalle de líneas, PDF imprimible, envío y aceptación. En el detalle verás el **catálogo de servicios** enlazado con la ruta Servicios. |
| **Servicios** | Catálogo por tipo y precio base; datos desde `GET /api/services`. |
| **Reportes** | Generación por categorías; exportación en cliente (JSON/CSV/PDF) y, en servidor (Fase 4), `POST /api/reports/export/xlsx` y `POST /api/reports/export/pdf`. |
| **Recibos** | Listado y **marcar pagado** contra la API; datos en **PostgreSQL** (`erp_receipts`) tras migración y seed. |
| **Auditoría** | Línea de tiempo mezclando datos locales y **eventos de dominio** persistidos (`GET /api/domain-events?limit=&skip=`). |
| **Integraciones** | Calendario **ICS**; **webhooks** registrados en BD; entrega HTTP con cabecera `X-Josanz-Signature: sha256=<hex>` sobre el cuerpo JSON. |

## Documentación de código (Compodoc)

Para generar documentación Angular del app shell:

```bash
pnpm run docs:frontend
```

Salida por defecto en `documentation/compodoc` (carpeta ignorada por git).

## Pruebas E2E

La configuración de Playwright arranca **backend** (`nx run backend:serve`) y **frontend** (`nx run frontend:serve`). El backend necesita **`DATABASE_URL`** y migraciones aplicadas; el seed crea el usuario **`admin@josanz.com`** / **`Admin123!`** (tenant slug `josanz` en login).

- Humo UI (sin API): `apps/frontend-e2e/src/phase3-smoke.spec.ts`
- Fase 4 (login + recibos + evento de dominio): `apps/frontend-e2e/src/phase4-auth.spec.ts`

```bash
pnpm exec playwright test --config=apps/frontend-e2e/playwright.config.ts --project=chromium
```

Variable opcional **`API_ORIGIN`** (por defecto `http://127.0.0.1:3000`) para peticiones `page.request` en los tests autenticados.

Con servidores ya en marcha, `reuseExistingServer: true` evita duplicar procesos.
