# Plan de implementación — Josanz ERP

Este documento describe el **estado real** del producto y lo que **sigue pendiente** (mejoras continuas). Las secciones históricas al final conservan el detalle por módulo.

**Backlog consolidado (pendientes generales, ops, seguridad, Fase 5+):** [BACKLOG.md](./BACKLOG.md).

**Arquitectura y escalabilidad (visión de sistema):** [LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md](./LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md).

**Elección de framework frontend:** [POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md](./POR_QUE_ANGULAR_VS_OTROS_FRAMEWORKS.md).

**Presentación a la organización (valor y riesgos):** [ARQUITECTURA_PRESENTACION_EMPRESA.md](./ARQUITECTURA_PRESENTACION_EMPRESA.md).

## Estado resumido

| Área | Estado | Notas |
|------|--------|--------|
| Módulos core (clientes, eventos, facturación, inventario, etc.) | En producción en código | Parte mock / demo según feature |
| Fase 3 (reportes, analytics, recibos, servicios↔presupuesto, eventos, integraciones, tests, docs) | **Entregada en código** | Ver tabla Fase 3 abajo |
| Fase 4 (Prisma recibos/eventos/webhooks, export API, E2E auth) | **Entregada en código** | Ver `docs/IMPLEMENTATION_PLAN_PHASE4.md` y migración `20260406120000_phase4_erp_domain_webhooks` |
| Tema / tokens CSS (`--primary`, `--brand`, etc.) | Alineado en `ThemeService` | Revisar features que aún usen tokens legacy |

## Fase 3 — Estado de entrega

| Ítem | Estado | Implementación |
|------|--------|------------------|
| Reportes PDF/Excel | Hecho (cliente) | JSON + CSV con BOM (`;`) + ventana imprimible (PDF vía navegador) en `reports.component.ts` |
| Dashboard / analytics API | Hecho | `GET /api/analytics/dashboard-summary` + `DashboardAnalyticsService` (caché `shareReplay`) |
| Recibos API y marcar pagado | Hecho | Módulo `receipts-backend` + UI; repositorio demo por tenant |
| Servicios ↔ presupuestos | Hecho | `GET /api/services` sin JWT de clase + panel en `budget-detail` + enlace a `/services` |
| Eventos de dominio / auditoría | Hecho (Prisma) | `DomainEventsService` + tabla `domain_events`; retención opcional vía `DOMAIN_EVENTS_RETENTION_DAYS` |
| Integraciones | Hecho (Prisma + cola) | Webhooks persistidos, firma HMAC, cola asíncrona; ICS desde eventos reales (`GET .../calendar/feed.ics`) |
| Testing E2E | Hecho (humo) | `apps/frontend-e2e/src/phase3-smoke.spec.ts` |
| Documentación | Hecho | Swagger en `/api/docs`; script `pnpm run docs:frontend` (Compodoc); `docs/USER_GUIDE.md` |
| Rendimiento / caché | Parcial | Caché KPIs y catálogo servicios (`shareReplay`); virtual scroll pendiente en tablas grandes |

## Mejoras UX/UI continuas

- Botones y enlaces: cada control debe **navegar**, **disparar API** o mostrar **feedback** (toast / estado), no quedar en silencio.
- Búsqueda global y filtros avanzados en listados grandes.
- Rendimiento: lazy loading ya en rutas; valorar virtual scroll en tablas y notificaciones en vivo en dashboard.

---

## Referencia por módulo (alcance funcional)

### Inicio / Dashboard

- Panel, métricas, actividad reciente, acciones rápidas.
- **Hecho**: API de estadísticas agregadas; notificaciones en vivo opcionales.

### Reportes

- Generador por categorías y listado de informes generados.
- **Hecho**: exportación JSON/CSV/PDF (impresión) + **export servidor** `POST /api/reports/export/xlsx|pdf` desde la UI de informes.

### Trazabilidad / Auditoría

- Timeline y filtros en UI.
- **Hecho**: eventos persistidos en Prisma (`domain_events`); job de retención configurable (ver `docs/RUNBOOK.md`).

### Servicios

- Catálogo por tipos (STREAMING, PRODUCCIÓN, LED, etc.).
- **Hecho**: visibilidad en detalle de presupuesto y catálogo en `/services`.

### Proyectos

- CRUD, estados, duplicación (según implementación actual en repo).
- **Parcial**: rutas `projects/:id` y `projects/new`; datos cruzados con eventos/clientes según evolución de API.

### Técnicos

- **Hecho (base)**: esquema Prisma (`technicians`, `technician_availability`) y API/UI de disponibilidad; ampliar según negocio.

### Recibos y pagos

- UI de listado y filtros.
- **Hecho**: API y acción marcar pagado; **pendiente**: conciliación profunda con facturación y tabla Prisma.

### Métricas y analytics

- **Hecho**: resumen agregado vía API; gráficos avanzados y rentabilidad por proyecto opcionales.

### Configuración

- Plugins y preferencias en UI.
- **Pendiente**: roles avanzados, plantillas, configuración global persistida.

### Integraciones y calidad

- **Hecho**: webhooks persistidos, cifrado de secretos, cola y firma; ICS con eventos de tenant. Contrato: `docs/INTEGRATIONS_WEBHOOKS.md`.

---

## Nota sobre versiones anteriores del documento

Versiones previas declaraban el proyecto **«100% completado»**. Eso se refería a **hitos de scaffolding y fases 1–2** del plan original, no a ausencia de trabajo futuro. **Fase 3 está cubierta en el código actual**; el pulido (persistencia, gráficos, CI) sigue siendo trabajo esperado.
