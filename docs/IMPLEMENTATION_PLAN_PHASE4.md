# Plan de implementación — Fase 4 (persistencia, integraciones reales, E2E profundo)

Este documento define el trabajo **posterior a la Fase 3** descrita en `IMPLEMENTATION_PLAN.md`. Objetivo: pasar de **demo en memoria** a **datos persistidos en PostgreSQL (Prisma)**, endurecer **integraciones** y cubrir flujos críticos con **E2E autenticados** y **tenant** explícito.

---

## 1. Contexto y alcance

| Área hoy (Fase 3) | Objetivo Fase 4 |
|-------------------|-----------------|
| `DomainEventsService` en memoria (anillo ~2k) | Tabla Prisma + repositorio + mismos endpoints o versionados |
| Recibos con seed in-memory por tenant | Modelo `Receipt` + CRUD/pago contra BD |
| Webhooks registrados en memoria | Tabla + opcional firma HMAC + cola/reintentos |
| Reportes: JSON/CSV/PDF vía cliente | Opcional: generación **servidor** (Excel con librería, PDF con plantilla o servicio) |
| E2E: humo sin login | Fixtures de **login** + **`x-tenant-id`** coherentes con `TenantGuard` |

**Fuera de alcance inicial de Fase 4** (pueden ir a Fase 5): multi-región, SSE/WebSockets para auditoría en vivo, motor de informes BI completo.

---

## 2. Epic A — Esquema Prisma: `DomainEvent`

### A.1 Modelo sugerido

Campos mínimos razonables:

- `id` (UUID, PK)
- `tenantId` (String/UUID, index compuesto con `createdAt`)
- `type` (String) — nombre del evento de dominio
- `payload` (Json) — cuerpo serializable
- `aggregateType` / `aggregateId` (opcional, para proyecciones)
- `createdAt` (DateTime, default `now()`)
- `createdByUserId` (opcional, String nullable)

### A.2 Tareas

1. Añadir modelo en `apps/backend/prisma/schema.prisma`.
2. `pnpm run db:migrate` (o flujo equivalente del repo) con nombre explícito, p. ej. `add_domain_events`.
3. Sustituir o envolver `DomainEventsService` (`apps/backend/src/phase3/`) para **escribir/leer Prisma**; mantener API REST actual (`GET/POST /api/domain-events`) o documentar breaking change en Swagger.
4. Paginación en `GET` (`cursor` o `skip/take`) y límite de página por defecto (p. ej. 50).
5. Política de retención (TTL job o documentar “manual” en ops).

### A.3 Criterios de aceptación

- Tras reiniciar el backend, los eventos **persisten**.
- La UI de auditoría sigue mostrando datos reales del endpoint (o mezcla seed + API si se mantiene compatibilidad).
- Tests unitarios del repositorio o e2e API mínimos contra BD de test.

---

## 3. Epic B — Esquema Prisma: `Receipt`

### B.1 Modelo sugerido

Alinear con el dominio actual del lib `receipts-backend` (list DTO, `markPaid`):

- `id`, `tenantId`, `amount`, `currency`, `status`, `dueDate`, `paidAt` (nullable), `description`/`reference`, `createdAt`, `updatedAt`
- Índices: `(tenantId, status)`, `(tenantId, dueDate)`

### B.2 Tareas

1. Modelo + migración.
2. Implementar `PrismaReceiptsRepository` (o extender el existente) **sin** mapa in-memory; eliminar o relegar `ensureSeed` a **seed de desarrollo** (`prisma/seed.ts`), no en request path.
3. Endpoints existentes (`GET` listado, `PATCH` pago) deben usar BD.
4. Swagger: DTOs y ejemplos actualizados.

### B.3 Criterios de aceptación

- Dos tenants distintos no ven recibos del otro (verificación por `tenantId`).
- Marcar pagado actualiza `paidAt` y `status` de forma idempotente donde aplique.

---

## 4. Epic C — Webhooks persistidos

### C.1 Modelo sugerido

- `id`, `tenantId`, `url`, `secret` (hash o cifrado en reposo — decidir), `eventTypes` (Json array o tabla de suscripción), `isActive`, `createdAt`, `updatedAt`
- Tabla opcional `WebhookDelivery` para intentos, código HTTP, cuerpo de error, reintento

### C.2 Tareas

1. CRUD API sobre BD (reemplazar store en memoria en `IntegrationsController` / servicio dedicado).
2. Emisión: al persistir un `DomainEvent` relevante, encolar entrega (sincrónica MVP o cola Redis/Nest queue en iteración 2).
3. Firma HMAC del cuerpo con `secret` (documentar cabecera, p. ej. `X-Josanz-Signature`).

### C.3 Criterios de aceptación

- Reinicio del servidor **no borra** suscripciones.
- Al menos un test que simule POST al webhook (mock HTTP server o test container).

---

## 5. Epic D — Exportaciones PDF / Excel en servidor (opcional pero planificada)

### D.1 Excel

- Endpoint p. ej. `POST /api/reports/export` o por tipo de informe.
- Librería tipo `exceljs` o similar; stream de respuesta `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

### D.2 PDF

- Opciones: **HTML → PDF** (Puppeteer en worker), **plantillas** (Handlebars + pdf-lib), o servicio externo.
- Definir si el PDF es síncrono (timeouts) o **job + descarga** cuando el informe sea pesado.

### D.3 Criterios de aceptación

- Mismo conjunto de filtros que el informe en UI; archivo descargable con nombre estable.
- Límites de tamaño y errores 413/422 documentados en OpenAPI.

---

## 6. Epic E — E2E Playwright: login + tenant

### E.1 Problema

`TenantGuard` exige `x-tenant-id` válido; el interceptor del frontend depende de sesión/configuración. Los humos actuales no cubren rutas protegidas ni API real.

### E.2 Tareas

1. **Fixture de autenticación**: usuario de prueba en BD seed o endpoint de login en entorno `e2e` (documentar variables `E2E_*` en `.env.example`).
2. **Tenant fijo de test**: UUID conocido creado en seed; el fixture de login debe dejar el mismo tenant que usa el backend de test.
3. Extender `playwright.config.ts` si hace falta **arranque del backend** con base de datos de test (docker compose profile `e2e`) o usar `BASE_URL` + API mockeada con `page.route` solo donde no sea posible BD real.
4. Nuevos specs sugeridos:
   - Login → navegación a `/receipts` → comprobar filas o estado vacío coherente.
   - Login → `POST` evento de dominio → recarga auditoría y aparece fila.
   - Opcional: llamada directa a `GET /api/services` con cabeceras vía `request.newContext({ extraHTTPHeaders })`.

### E.3 Criterios de aceptación

- CI puede ejecutar al menos **un** flujo E2E autenticado de forma estable (Chromium primero; Firefox/WebKit si el tiempo lo permite).
- Documentación en `docs/USER_GUIDE.md` o sección “E2E” con variables de entorno necesarias.

---

## 7. Orden de implementación recomendado

1. **Receipt + migración** (impacto visible en negocio, superficie acotada).
2. **DomainEvent + migración** (desbloquea auditoría real y futuros webhooks).
3. **E2E auth + tenant** (evita regresiones en lo anterior).
4. **Webhooks en BD** + entregas MVP.
5. **Export servidor** PDF/XLSX cuando haya prioridad de producto.

---

## 8. Riesgos y notas

- **Migraciones en equipos**: coordinar `schema.prisma` único y convención de nombres de migraciones.
- **Secretos de webhooks**: no guardar en claro en repos; usar variables de entorno o cifrado de aplicación.
- **JWT vs rutas públicas**: revisar qué endpoints deben quedar sin JWT pero siempre con `tenantId` tras endurecer seguridad.

---

## 9. Checklist rápido al cerrar Fase 4

- [x] Migración `20260406120000_phase4_erp_domain_webhooks` y modelos en `schema.prisma`.
- [x] Recibos vía `PrismaReceiptsRepository` → tabla `erp_receipts`; seed demo en `prisma/seed.ts`.
- [x] Eventos de dominio y webhooks en Prisma; entrega con `X-Josanz-Signature` (HMAC-SHA256 del cuerpo).
- [x] Exportes servidor: `POST /api/reports/export/xlsx` y `/export/pdf` (`exceljs`, `pdf-lib`).
- [x] `GET /api/health` público; E2E `phase4-auth.spec.ts` + doble `webServer` en Playwright.
- [x] Test unitario firma webhook (`webhook-dispatcher.service.spec.ts`).

**Pendiente operativo**: aplicar migraciones y seed en cada entorno (`pnpm run db:migrate`, seed según convención del repo).
