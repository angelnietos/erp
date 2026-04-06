# Backlog general — Josanz ERP

Documento vivo con **lo que falta o conviene hacer** a nivel producto, operaciones y calidad técnica. No sustituye los planes por fase; enlázalos para contexto.

| Documento | Uso |
|-----------|-----|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Estado por módulo y mejoras UX continuas |
| [IMPLEMENTATION_PLAN_PHASE4.md](./IMPLEMENTATION_PLAN_PHASE4.md) | Detalle de Fase 4 (gran parte ya implementada) |
| [USER_GUIDE.md](./USER_GUIDE.md) | Uso, E2E, migraciones |
| [PLAN_UI_UX_THEMING_BROWSER.md](./PLAN_UI_UX_THEMING_BROWSER.md) | Rediseño `libs/browser`, theming profundo (forma + color) y acciones |
| [LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md](./LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md) | Libro blanco: arquitectura hexagonal, Nx, escalabilidad, plugins |
| [POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md](./POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md) | Por qué Angular frente a React/Vue en un ERP; ventajas y matices |

---

## 1. Operaciones y entorno (hacer primero en cada máquina/CI)

- [ ] **Aplicar migraciones Prisma** tras `git pull`, incluida `20260406120000_phase4_erp_domain_webhooks` (`pnpm run db:migrate` o flujo del equipo).
- [ ] **Resolver drift** si la BD local divergió del historial de migraciones (Prisma suele avisar con `migrate dev`); alinear o baseline según política del equipo.
- [ ] **Ejecutar seed** cuando haga falta usuario demo (`admin@josanz.com` / `Admin123!`, tenant `josanz`) y datos `erp_receipts`.
- [ ] **Variables de entorno**: documentar o ampliar `.env.example` del backend (p. ej. `DATABASE_URL`, `CORS_ORIGIN`, credenciales E2E si aplica).
- [ ] **CI/CD**: pipeline que levante Postgres, migre, ejecute tests y E2E (Chromium como mínimo); hoy los E2E Fase 4 asumen backend + BD disponibles.

---

## 2. Seguridad y multitenancy

- [ ] **Validar tenant en BD**: `TenantGuard` comprueba presencia de `x-tenant-id`, no que el UUID exista en `tenants` (suplantación / typos).
- [ ] **Secretos de webhooks**: hoy se persisten para poder firmar HMAC; valorar **cifrado en reposo** o almacén de secretos; no devolver `secret` en `GET /api/integrations/webhooks` en producción (solo al registrar).
- [ ] **JWT de forma consistente**: varios controladores sin `JwtAuthGuard` por comodidad demo; definir política por entorno (dev vs prod).
- [ ] **CORS y orígenes** en producción vía `CORS_ORIGIN` (no solo `localhost:4200`).
- [ ] **Rate limiting** en rutas públicas (`/api/health`, login) si hay exposición a Internet.

---

## 3. Dominio y datos (producto)

- [ ] **Recibos ↔ facturación**: `invoiceId` en `erp_receipts` es referencia lógica; enlazar con modelo `Invoice` real (UUID), reglas de conciliación y estados alineados.
- [ ] **Moneda y totales**: campo `currency` en recibos si multi-moneda; hoy el dominio asume importes numéricos sin divisa en tabla.
- [ ] **Servicios (`/api/services`)**: sustituir mock por catálogo Prisma alineado con `Product` / categorías tipo servicio.
- [ ] **Proyectos**: enlaces profundos y datos reales con eventos/clientes (según `IMPLEMENTATION_PLAN.md`).
- [ ] **Módulo técnicos**: perfiles, tarifas, calendario (si aplica negocio).
- [ ] **Configuración**: roles avanzados, plantillas, preferencias globales persistidas.
- [ ] **Retención de eventos de dominio**: job o política para archivar/purgar `domain_events` (TTL documentado en ops).

---

## 4. Integraciones y webhooks

- [ ] **Cola / reintentos**: la entrega es `setImmediate` + `fetch` con timeout; valorar cola (BullMQ, SQS, etc.) y reintentos exponenciales.
- [ ] **Test de integración** con servidor HTTP mock que verifique cabecera `X-Josanz-Signature` (más allá del unit test de firma).
- [ ] **Webhook idempotencia** y deduplicación por `X-Josanz-Event-Id` en consumidores (documentar contrato).
- [ ] **Calendario ICS**: contenido basado en eventos reales del tenant (no solo placeholder).

---

## 5. Reportes y analytics

- [ ] **UI conectada a export servidor**: usar `POST /api/reports/export/xlsx` y `/export/pdf` desde el generador de informes además de export cliente.
- [ ] **Informes desde datos reales**: filtros ejecutados contra API/Prisma con límites y paginación; validación de payload (tamaño máximo, 413/422 en OpenAPI).
- [ ] **PDF rico**: plantillas HTML → PDF o diseño con `pdf-lib` más allá de texto plano.
- [ ] **Dashboard**: gráficos, rentabilidad por proyecto/cliente, notificaciones en vivo (SSE/WebSocket) si hay prioridad.

---

## 6. Frontend / UX

Plan detallado de implementación: **[PLAN_UI_UX_THEMING_BROWSER.md](./PLAN_UI_UX_THEMING_BROWSER.md)**.

- [ ] **Feedback sistemático**: toasts o estados de carga/error en acciones que hoy fallan en silencio (regla en `IMPLEMENTATION_PLAN.md`).
- [ ] **Búsqueda global y filtros** en listados grandes.
- [ ] **Virtual scroll** en tablas pesadas.
- [ ] **Presupuestos de bundle**: el build del frontend avisa de budgets superados (inicial y estilos de algunos componentes); reducir CSS in-component o subir límites con justificación.
- [ ] **`AuthService`**: sustituir URL fija `http://localhost:3000/api/auth` por `environment.apiOrigin` (o equivalente) para staging/prod.

---

## 7. Testing y calidad

- [ ] **E2E en CI** con Postgres de servicio y migraciones automáticas.
- [ ] **Cobertura unitaria** en servicios críticos (repositorios, `AnalyticsService`, reglas de dominio de recibos).
- [ ] **Contratos API**: tests de contrato o snapshot OpenAPI frente a respuestas reales.
- [ ] **Playwright**: proyectos Firefox/WebKit en CI solo si el tiempo de pipeline lo permite; o marcar como opcionales.

---

## 8. Documentación y DX

- [ ] **Actualizar tabla Fase 3** en `IMPLEMENTATION_PLAN.md` (algunas filas siguen hablando de “memoria” pese a Fase 4 en Prisma) para evitar contradicciones.
- [ ] **ADR** para decisiones grandes (webhooks síncronos vs cola, cifrado de secretos).
- [ ] **Runbook** de despliegue: migraciones, seed, healthcheck `GET /api/health`, Swagger `/api/docs`.

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
