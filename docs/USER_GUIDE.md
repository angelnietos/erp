# Guía de usuario — Josanz ERP (resumen)

Esta guía resume flujos habituales y enlaces técnicos. El producto es un monorepo Nx con frontend Angular y API NestJS.

## Acceso y entorno

- **Frontend**: por defecto `http://localhost:4200`. La ruta `/` redirige al **Dashboard**.
- **API**: proxy del frontend hacia el backend; muchas rutas requieren cabecera **`x-tenant-id`** con un UUID de inquilino válido (el interceptor de tenant la envía si está configurada la sesión).
- **Documentación OpenAPI (Swagger)**: con el backend en marcha, suele estar en **`/api/docs`** (según `main.ts` del backend).

## Módulos principales

| Área | Qué hacer |
|------|-----------|
| **Dashboard** | KPIs y resumen; los indicadores pueden cargarse desde el endpoint de analytics si la API responde. |
| **Presupuestos** | Detalle de líneas, PDF imprimible, envío y aceptación. En el detalle verás el **catálogo de servicios** enlazado con la ruta Servicios. |
| **Servicios** | Catálogo por tipo y precio base; datos desde `GET /api/services`. |
| **Reportes** | Generación por categorías; exportación **JSON**, **CSV (Excel)** y ventana **PDF** (impresión del navegador). |
| **Recibos** | Listado y **marcar pagado** contra la API (`PATCH` de pago). |
| **Auditoría** | Línea de tiempo mezclando datos locales y **eventos de dominio** del backend (`/api/domain-events`). |
| **Integraciones** | Calendario **ICS** y registro de **webhooks** (según despliegue de Fase 3). |

## Documentación de código (Compodoc)

Para generar documentación Angular del app shell:

```bash
pnpm run docs:frontend
```

Salida por defecto en `documentation/compodoc` (carpeta ignorada por git).

## Pruebas E2E

Humo básico (dashboard, reportes, redirección):

```bash
pnpm exec nx run frontend-e2e:e2e
```

Asegúrate de que el servidor de desarrollo del frontend esté disponible o deja que Playwright lo arranque según `playwright.config.ts`.
