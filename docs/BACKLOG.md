# Backlog general — Josanz ERP

Documento vivo con **lo que falta o conviene hacer** a nivel producto, operaciones y calidad técnica. No sustituye los planes por fase; enlázalos para contexto.

| Documento | Uso |
|-----------|-----|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Estado por módulo y mejoras UX continuas |
| [IMPLEMENTATION_PLAN_PHASE4.md](./IMPLEMENTATION_PLAN_PHASE4.md) | Detalle de Fase 4 (gran parte ya implementada) |
| [USER_GUIDE.md](./USER_GUIDE.md) | Uso, E2E, migraciones |
| [PLAN_UI_UX_THEMING_BROWSER.md](./PLAN_UI_UX_THEMING_BROWSER.md) | Rediseño `libs/browser`, theming profundo (forma + color) y acciones |
| [LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md](./LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md) | Libro blanco: arquitectura hexagonal, Nx, escalabilidad, plugins |
| [ARQUITECTURA_PRESENTACION_EMPRESA.md](./ARQUITECTURA_PRESENTACION_EMPRESA.md) | Presentación dirección: valor, riesgos y mitigaciones (tono ejecutivo) |
| [POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md](./POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md) | Por qué Angular frente a React/Vue en un ERP; ventajas y matices |
| [RUNBOOK.md](./RUNBOOK.md) | Despliegue: migraciones, seed, health, CORS, rate limits, retención |
| [INTEGRATIONS_WEBHOOKS.md](./INTEGRATIONS_WEBHOOKS.md) | Contrato de webhooks (cabeceras, idempotencia recomendada, ICS) |
| [adr/001-webhooks-async-and-secrets.md](./adr/001-webhooks-async-and-secrets.md) | ADR: cola asíncrona y secretos cifrados |

---

## 1. Operaciones y entorno (hacer primero en cada máquina/CI)

- [ ] **Aplicar migraciones Prisma** tras `git pull`, incluida `20260406120000_phase4_erp_domain_webhooks` (`pnpm run db:migrate` o flujo del equipo).
- [ ] **Resolver drift** si la BD local divergió del historial de migraciones (Prisma suele avisar con `migrate dev`); alinear o baseline según política del equipo.
- [ ] **Ejecutar seed** cuando haga falta usuario demo (`admin@josanz.com` / `Admin123!`, tenant `josanz`) y datos `erp_receipts`.
- [x] **Variables de entorno**: `apps/backend/env.example` documenta `DATABASE_URL`, `CORS_ORIGIN`, rate limits, retención y nota de cifrado de webhooks.
- [x] **CI/CD (sin tests)**: `.github/workflows/nx-affected-ci.yml` ejecuta `lint` y `build` afectados con `pnpm`. **Pendiente fase posterior**: Postgres en servicio, migraciones y E2E (ver §7).

---

## 2. Seguridad y multitenancy

- [x] **Validar tenant en BD**: `TenantGuard` ya valida no solo la presencia sino la existencia real y estado `isActive` del UUID en la tabla `tenants`.
- [x] **Secretos de webhooks**: hoy se persisten para poder firmar HMAC; se ha implementado **cifrado en reposo (AES-256-GCM)**; no devolver `secret` en `GET /api/integrations/webhooks` en producción (solo al registrar).
- [ ] **JWT de forma consistente**: varios controladores sin `JwtAuthGuard` por comodidad demo; definir política por entorno (dev vs prod).
- [x] **CORS y orígenes** vía `CORS_ORIGIN` (un origen o varios separados por coma).
- [x] **Rate limiting** opcional en `/api/health` y `/api/auth/login` (`RATE_LIMIT_*_PER_MINUTE`, `0` = desactivado).

---

## 3. Dominio y datos (producto)

- [x] **Recibos ↔ facturación**: `invoiceId` en `erp_receipts` enlazado con modelo `Invoice` real (UUID).
- [x] **Moneda y totales**: campo `currency` añadido a recibos (soporta multi-moneda).
- [x] **Servicios (`/api/services`)**: sustituido mock por catálogo Prisma alineado con `Product` / categorías tipo servicio.
- [ ] **Proyectos**: enlaces profundos y datos reales con eventos/clientes (según `IMPLEMENTATION_PLAN.md`).
- [x] **Módulo técnicos**: perfiles extendidos (bio, avatar) y tabla de disponibilidad (`technician_availability`) en esquema.
- [ ] **Configuración**: roles avanzados, plantillas, preferencias globales persistidas.
- [x] **Retención de eventos de dominio**: cron semanal + `DOMAIN_EVENTS_RETENTION_DAYS` (≤0 no purga); ver `RUNBOOK.md`.

---

## 4. Integraciones y webhooks

- [x] **Cola / reintentos**: modelo `IntegrationWebhookQueueItem` añadido para entrega asíncrona robusta.
- [ ] **Test de integración** con servidor HTTP mock que verifique cabecera `X-Josanz-Signature` (más allá del unit test de firma).
- [x] **Contrato de idempotencia**: documentado para consumidores (`INTEGRATIONS_WEBHOOKS.md`); deduplicación en BD del lado Josanz queda como mejora futura si se exige.
- [x] **Calendario ICS**: `GET .../calendar/feed.ics` genera ICS desde filas `Event` del tenant (hasta 500).

---

## 5. Reportes y analytics

- [x] **UI conectada a export servidor**: botones Excel (API) / PDF (API) en el generador de informes (`POST /api/reports/export/xlsx` y `/pdf`).
- [x] **Validación de payload export**: límites en DTOs (`class-validator`); ampliar datos reales/Prisma y documentación OpenAPI según prioridad.
- [x] **PDF rico**: export servidor con cabecera de marca, secciones y tabla (`pdf-lib`); el cliente de informes envía `subtitle`, `sections` y `table` además de `lines` (sin motor HTML para no añadir Chromium).
- [x] **Dashboard**: gráficos de barras (facturación por cliente y por proyecto vía eventos) desde `GET /api/analytics/dashboard-summary` (`charts` en el DTO); refresco periódico (~45s) y entrada en el centro de notificaciones en cada actualización (alternativa práctica a SSE con JWT en cabecera).

---

## 6. Frontend / UX

Plan detallado de implementación: **[PLAN_UI_UX_THEMING_BROWSER.md](./PLAN_UI_UX_THEMING_BROWSER.md)**.

- [x] **Feedback sistemático**: `ToastService` + `josanz-toast-stack` en el layout; informes usan toasts en éxito/error (sustituye `alert` en exportes y generación).
- [x] **Búsqueda global y filtros**: paleta (⌘K) añade atajos «Búsqueda global» hacia `/clients?q=`, `/projects?q=`, `/events?search=`; proyectos con filtro de estado; clientes/eventos leen query al entrar.
- [x] **Virtual scroll**: `@angular/cdk/scrolling` en `ui-josanz-table` cuando `virtualScroll` y >24 filas; activado en clientes, proyectos y facturación si aplica.
- [x] **Presupuestos de bundle**: límites de producción alineados al bundle real + CDK (~720kB inicial warning, 16kB warning por estilo de componente); seguir optimizando CSS in-component en `PLAN_UI_UX_THEMING_BROWSER.md` si se quiere bajar de nuevo.
- [x] **`AuthService` / tenant**: rutas relativas `/api/auth` e interceptor con `x-tenant-id` en URLs que incluyen `/api/`; `technician-api` usa `/api/technicians`.

---

## 7. Testing y calidad (fase posterior — no bloquea el backlog operativo)

- [ ] **E2E en CI** con Postgres de servicio y migraciones automáticas.
- [ ] **Cobertura unitaria** en servicios críticos (repositorios, `AnalyticsService`, reglas de dominio de recibos).
- [ ] **Contratos API**: tests de contrato o snapshot OpenAPI frente a respuestas reales.
- [ ] **Playwright**: proyectos Firefox/WebKit en CI solo si el tiempo de pipeline lo permite; o marcar como opcionales.

---

## 8. Documentación y DX

- [x] **Tabla Fase 3** en `IMPLEMENTATION_PLAN.md` alineada con Prisma, ICS real, retención y export servidor.
- [x] **ADR** [001](./adr/001-webhooks-async-and-secrets.md) (cola + cifrado de secretos).
- [x] **Runbook** [RUNBOOK.md](./RUNBOOK.md) (migraciones, seed, health, Swagger, CORS, rate limits).

---

## 9. Ideas de “Fase 5+” (no comprometidas)

- Multi-región / réplicas de lectura.
- Motor BI / informes programados.
- Verifactu y otros dominios: revisar alineación con normativa vigente en cada release.
- App móvil o PWA offline (solo si hay requisito de negocio).

---

## Cómo usar este backlog

1. En planning, mover ítems a issues con **prioridad** y **dueño**.
2. Cuando se complete un bloque grande, actualizar `IMPLEMENTATION_PLAN.md` / `IMPLEMENTATION_PLAN_PHASE4.md` y tachar aquí o referenciar el PR.
3. Revisar trimestralmente si las secciones 9 u “ideas” siguen siendo relevantes.
