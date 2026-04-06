# Plan de implementación — Josanz ERP

Este documento describe el **estado real** del producto y lo que **sigue pendiente** (Fase 3 y mejoras continuas). Las secciones históricas al final conservan el detalle por módulo.

## Estado resumido

| Área | Estado | Notas |
|------|--------|--------|
| Módulos core (clientes, eventos, facturación, inventario, etc.) | En producción en código | Parte mock / demo según feature |
| Proyectos, servicios, reportes, auditoría, recibos | Estructura + UI | Integración backend y exportaciones reales pendientes donde indique cada feature |
| Dashboard | UI + datos demo | KPIs desde API agregada pendiente |
| Tema / tokens CSS (`--primary`, `--brand`, etc.) | Alineado en `ThemeService` | Revisar features que aún usen tokens legacy |

## Fase 3 — Próximos pasos (prioridad)

1. **Reportes**: exportación real (PDF/Excel) desde API o generación cliente con datos del backend.
2. **Dashboard / Analytics**: endpoint de estadísticas y sustituir métricas demo.
3. **Recibos**: persistencia y API; acciones “marcar pagado” contra backend.
4. **Servicios ↔ Presupuestos**: integración en flujo de presupuesto (el plan original lo marcaba pendiente).
5. **Event sourcing / auditoría fuerte**: persistencia de eventos de dominio (más allá del listado UI).
6. **Integraciones**: calendario, webhooks, API pública documentada.
7. **Testing**: E2E (Playwright), subir cobertura unitaria en features críticas.
8. **Documentación**: OpenAPI/Swagger publicado, Compodoc o equivalente, guías de usuario.

## Mejoras UX/UI continuas

- Botones y enlaces: cada control debe **navegar**, **disparar API** o mostrar **feedback** (toast / estado), no quedar en silencio.
- Búsqueda global y filtros avanzados en listados grandes.
- Rendimiento: lazy loading ya en rutas; valorar caching de KPIs y virtual scroll en tablas.

---

## Referencia por módulo (alcance funcional)

### Inicio / Dashboard

- Panel, métricas, actividad reciente, acciones rápidas.
- **Pendiente**: API de estadísticas; notificaciones en vivo opcionales.

### Reportes

- Generador por categorías y listado de informes generados.
- **Pendiente**: exportación PDF/Excel real; datos desde backend.

### Trazabilidad / Auditoría

- Timeline y filtros en UI.
- **Pendiente**: event sourcing completo y retención de logs en servidor.

### Servicios

- Catálogo por tipos (STREAMING, PRODUCCIÓN, LED, etc.).
- **Pendiente**: asignación a presupuestos y disponibilidad.

### Proyectos

- CRUD, estados, duplicación (según implementación actual en repo).
- **Pendiente**: enlaces profundos con eventos/clientes si faltan datos reales.

### Técnicos

- **Pendiente**: módulo dedicado (perfiles, tarifas, calendario) si aplica al negocio.

### Recibos y pagos

- UI de listado y filtros.
- **Pendiente**: API y conciliación con facturación.

### Métricas y analytics

- **Pendiente**: gráficos y rentabilidad por proyecto/cliente con datos reales.

### Configuración

- Plugins y preferencias en UI.
- **Pendiente**: roles avanzados, plantillas, configuración global persistida.

### Integraciones y calidad

- Ver Fase 3 arriba (webhooks, tests, docs).

---

## Nota sobre versiones anteriores del documento

Versiones previas declaraban el proyecto **«100% completado»**. Eso se refería a **hitos de scaffolding y fases 1–2** del plan original, no a ausencia de trabajo futuro. Este archivo se actualiza para evitar ambigüedad: **Fase 3 y pulido son trabajo esperado**.
