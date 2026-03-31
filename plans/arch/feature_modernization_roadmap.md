# 🚀 Josanz ERP: Feature Modernization Roadmap (V3)

Este documento define la estrategia para refinar el ERP **funcionalidad por funcionalidad**, elevando cada módulo al estándar "High-Fidelity" de la arquitectura V3 (Front + Back).

---

## 🎨 Estándares de Modernización (Master Specs)

Para cada feature, aplicaremos obligatoriamente:
1.  **Frontend (Luxe UI):**
    *   **Theme Synthesis:** Sincronización de acentos y glows con el `ThemeService` (Aurora, Nebula, Matrix).
    *   **Performance Toggles:** Respeto al `highPerformanceMode` del `PluginStore` para optimizar blur y sombras.
    *   **Reactive Stores:** Migración total a `signalStore` y `computed` signals para 0 latencia en UI.
2.  **Backend (Solid Domain):**
    *   **Multitenancy-First:** Aislamiento automático vía `nestjs-cls` y Prisma Middleware.
    *   **DDD Structure:** Refinado de capas (Application -> Domain -> Infrastructure).
    *   **Event-Driven:** Emisión de eventos de dominio a través de un bus central (`shared/events`).

---

## 🗺️ Fases de Ejecución

### 1. 📦 [FASE 1] INVENTARIO (Centro de Activos)
*   **Front:** Dashboard visual con KPIs dinámicos, filtros por categoría de alta fidelidad y modal de edición con validación reactiva.
*   **Back:** Lógica de stock crítico, histórico de movimientos de material y trazabilidad por Tenant.
*   **Status:** *INICIANDO* 🕒

### 2. 📝 [FASE 2] PRESUPUESTOS (Gestión Comercial)
*   **Front:** Generador de líneas de presupuesto inteligente, selector de material con stock real y exportación PDF con branding dinámico de Josanz.
*   **Back:** Sistema de estados (Borrador, Enviado, Aprobado), cálculo fiscal automático (IVA, Retenciones) y firma digital.
*   **Status:** *PENDIENTE* ⏳

### 3. 🚗 [FASE 3] FLOTA & LOGÍSTICA (Vertical Plugin)
*   **Front:** Mapa visual de vehículos, gestión de conductores y consumos.
*   **Back:** Integración asíncrona de geolocalización y mantenimiento preventivo.
*   **Status:** *PENDIENTE* ⏳

### 4. 💰 [FASE 4] FACTURACIÓN & VERIFACTU (Cumplimiento)
*   **Front:** Panel de integridad fiscal, listado de facturas emitidas y estado de sincronización AEAT.
*   **Back:** Encadenamiento de facturas (Hash-Chaining), firma electrónica XAdES y comunicación con `verifactu-service`.
*   **Status:** *PENDIENTE* ⏳

---

## 🛠️ Próximo Paso Inmediato
Comenzaremos con la **Refactorización Lux de InventoryListComponent** para que el dashboard de inventario sea una pieza de arte visual sincronizada con los temas Aurora/Nebula.

> [!TIP]
> ¿Deseas que empecemos directamente con el **Frontend de Inventario** o prefieres cerrar primero el **Backend de Budgets**?
