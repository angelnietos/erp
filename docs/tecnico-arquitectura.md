# Josanz ERP — Documento técnico (arquitectura y desarrollo)


## 1. Visión del sistema

Monorepo **Nx** que agrupa aplicaciones y librerías compartidas para un ERP multi-módulo: clientes, inventario, presupuestos, flota, alquileres, albaranes de entrega, facturación e integración **Verifactu** (cumplimiento fiscal español).

El diseño apunta a **componer el producto** como conjunto de **dominios verticales** (cada uno con UI, acceso a datos y API) que se **activan o desactivan** como “plugins” de producto, sobre un **núcleo multi-tenant** común.

## 2. Stack principal

| Capa | Tecnología |
|------|------------|
| Frontend | Angular (standalone), librerías de features por dominio |
| API principal | NestJS (apps/backend) |
| Datos | Prisma ORM, PostgreSQL (implícito vía schema) |
| Verifactu | API/worker dedicados, librerías `verifactu-core`, `verifactu-adapters` |
| Calidad | ESLint, Jest, Playwright (e2e) |

## 3. Features y shells: arquitectura por dominio

Cada área funcional sigue un patrón repetible en `libs/<dominio>/`:

| Librería | Rol |
|----------|-----|
| **`feature`** | Componentes de pantalla, formularios, detalle; depende de `data-access` y contratos compartidos. |
| **`shell`** | Rutas hijas y lazy loading del dominio (`loadChildren` desde la app). |
| **`data-access`** | Servicios HTTP, facades, estado de cliente (p. ej. NgRx Signals). |
| **`api`** | Tipos y contratos alineados con la API REST. |
| **`core` / `backend`** | Reglas de dominio y capa Nest cuando el módulo tiene persistencia propia. |

La **aplicación shell** (`apps/frontend`) solo **ensambla**: importa rutas de cada `*-shell` y aplica guards. Ejemplo real: `app.routes.ts` carga `@josanz-erp/delivery-shell`, `@josanz-erp/billing-shell`, etc., cada uno con `loadChildren` lazy.

**Ventaja:** un nuevo vertical (p. ej. CRM, proyectos, tickets) se añade como **nuevo conjunto de libs** sin reescribir los existentes; el grafo Nx y los `tags` (`type:feature`, `type:shell`, …) limitan dependencias ilegales.

### 3.1 Nx “plugins” (herramienta) vs plugins de producto

- **Plugins de Nx** (`@nx/eslint`, `@nx/webpack`, …): automatizan tareas y el grafo de proyectos. Son **infra de desarrollo**, no funcionalidad de negocio.
- **Plugins de producto** (término usado aquí): **módulos opcionales** que el usuario o el tenant puede tener habilitados (ver §4).

## 4. Plugins de producto: composición y escala

Hoy el frontend ya modela **módulos activables** con identificadores estables (`dashboard`, `clients`, `budgets`, `delivery`, …):

- **`pluginGuard('clients')`** (y análogos) en rutas protegidas.
- **`PluginStore`** (`libs/shared/data-access`): lista `enabledPlugins`; métodos `setPlugins`, `togglePlugin`, etc.

Esto permite, sin cambiar la estructura de carpetas:

1. **Por plan comercial:** tras el login, la API devuelve la lista de plugins contratados → `setPlugins(...)` y el menú + rutas quedan alineados.
2. **Por tenant:** mismas reglas; el backend debe **rechazar** llamadas a módulos no contratados (el guard solo mejora UX; la seguridad real es servidor).
3. **Carga perezosa:** dominios no usados no entran en el bundle inicial hasta que la ruta se visita (si está permitida).

**Evolución recomendada:** tabla o configuración por tenant en backend (`tenant_modules`, límites, versiones) y **paridad** entre lo que devuelve la API y lo que aplica `PluginStore`.

## 5. Muchos negocios: individual, colectivo y grupos

| Modelo | Descripción técnica orientativa |
|--------|----------------------------------|
| **Negocio individual** | Un `tenantId` = una empresa; aislamiento estricto por fila (`tenantId` en Prisma). |
| **Varias marcas / filiales** | Varios tenants con usuario que cambia contexto, o **jerarquía** futura (`parentTenantId`, reporting consolidado) sin mezclar datos operativos. |
| **Colectivo / red** | Mismo producto, muchos tenants pequeños; administración central puede tener rol “platform” para soporte (auditoría, sin acceso a datos salvo políticas explícitas). |
| **Grupo que comparte catálogo** | Opción de **catálogo maestro** replicado o referenciado (productos, tarifas) con tablas `shared_*` o servicio de referencia; hoy se puede acercar con seeds y APIs de importación. |

La arquitectura actual (libs por dominio + multi-tenant por filas) **escala a muchos tenants** añadiendo índices por `tenantId`, caché y workers; el límite suele ser **modelo de datos y permisos**, no el monorepo.

## 6. Hacia un CRM global “para cualquier cliente”

Un **CRM** en este marco no es un proyecto aparte: es **otro dominio** en el monorepo, por ejemplo:

- `libs/crm/core` — entidades (cuenta, contacto, oportunidad, actividad), invariantes.
- `libs/crm/api` — DTOs y OpenAPI alineados.
- `libs/crm/data-access` — cliente HTTP y estado.
- `libs/crm/feature` — listados, pipeline, ficha de cuenta.
- `libs/crm/shell` — rutas `/crm/...`.
- Registro en `app.routes.ts` + `pluginGuard('crm')`.

**“Global para cualquier cliente”** significa:

- **Mismo código** y mismas pantallas para todos los tenants; la **variación** es configuración (campos obligatorios, pipelines, integraciones), no forks del repo.
- **Verticalización** vía metadatos: tipos de actividad, motivos de pérdida, etapas del embudo por sector (eventos, industrial, servicios).
- **Integración con módulos existentes:** presupuestos y facturas enlazados a **oportunidades** o **cuentas** CRM; clientes actuales como vista maestra o sincronización bidireccional según diseño.

## 7. Propagar funcionalidades de un tenant a otro

Varios mecanismos complementarios:

| Mecanismo | Qué resuelve |
|-----------|----------------|
| **Despliegue único (SaaS)** | Cada release del monorepo **actualiza a todos** los clientes; no hay “copiar código” entre instalaciones. |
| **Feature flags** | Activar una feature en beta solo en tenants elegidos (LaunchDarkly, Unleash, o tabla propia). |
| **Plantillas / blueprints** | Exportar JSON de configuración (pipelines CRM, tipos de albarán, listas de precios) e **importar** en otro tenant; sin duplicar código. |
| **Paquetes de datos** | Seeds o migraciones de datos dirigidas por “plantilla sector X”. |
| **Extensiones de terceros** | API pública + webhooks; el núcleo permanece estable. |

**Propagación entre entornos** (dev → staging → prod) sigue Git + CI/CD; **propagación entre clientes** es sobretodo **datos y flags**, no ramas distintas del mismo producto.

## 8. Multi-tenant (detalle operativo)

- El tenant se propaga vía cabeceras (p. ej. `x-tenant-id`) y contexto de ejecución (CLS) en backend.
- Solo se considera válido un identificador de tenant con formato UUID; entradas inválidas no deben contaminar el contexto (middleware + saneo en cliente).
- Login y resolución por **slug** cuando el valor almacenado en el cliente no es un UUID válido.

## 9. Módulo de albaranes (delivery)

- **Persistencia**: campo `signature_blob_url` en Prisma (nombre histórico): almacena **URL pública**, **data URL** (`data:image/...`) o texto de conformidad según el flujo.
- **API**: firma vía `PUT .../delivery-notes/:id/sign` con cuerpo `{ signature }`.
- **Frontend**: `DeliveryDetailComponent` usa `parseSignatureDisplayValue` (`@josanz-erp/shared-utils`) para normalizar URL / data URL / base64 sin prefijo antes de asignar `[src]` al `<img>`.

## 10. Utilidades compartidas y bundle Angular

- **`@josanz-erp/shared-utils`**: utilidades seguras para el navegador (fechas, strings, impresión/PDF ligero, parsing de firma, UUID vía `crypto.randomUUID()`).
- **`@josanz-erp/shared-utils/node`**: entrada opcional para código **solo Node** (p. ej. hashes con módulo `crypto` de Node). No debe importarse desde el frontend.

Razón: el compilador de Angular sigue la cadena de imports del barrel; reexportar módulos Node en el índice principal rompe el build del cliente.

## 11. Verifactu

- Desacoplamiento entre dominio (`verifactu-core`), adaptadores de infraestructura y apps.
- **Worker**: proceso asíncrono; conviene fijar puerto dedicado (p. ej. variables `VERIFACTU_WORKER_PORT` / `PORT`) para no colisionar con el frontend (4200) u otras APIs (3000).
- **Dashboard**: detalle de factura debe resolver PK real de factura frente a id de log Verifactu según la API expuesta (facade `resolveInvoicePk` u equivalente).
- En entornos con problemas de **plugin workers de Nx**, scripts con `NX_DAEMON=false` y `NX_PLUGIN_NO_TIMEOUTS=true` reducen bloqueos locales.

## 12. PDF e impresión en cliente

Generación liviana mediante HTML + ventana de impresión (`openPrintableDocument`, `escapeHtml` en `shared-utils`), usada en albarán y presupuesto; no sustituye a un motor PDF servidor para documentos legales complejos.

## 13. Prácticas recomendadas

- Nuevas integraciones **solo navegador**: bajo `libs/shared/utils/src/lib/browser/` y export en el índice principal; código Node en `node.ts` o paquetes backend.
- Seeds y datos de demo: no usar URLs de imagen inventadas en campos que el UI trata como `img src`; preferir **data URL** válida o almacenamiento real (blob/S3).
- Contratos HTTP: alinear DTOs entre `*-api`, `*-data-access` y respuestas Nest.
- Nuevo dominio = nuevo **shell + feature + data-access + api** (y backend si aplica), un id de **plugin** estable y guard en rutas.

## 14. Referencias de rutas útiles

- Rutas y guards: `apps/frontend/src/app/app.routes.ts`
- Store de plugins: `libs/shared/data-access/src/lib/store/plugin.store.ts`
- Esquema Prisma: `apps/backend/prisma/schema.prisma`
- Paths TypeScript: `tsconfig.base.json`
- Detalle albarán: `libs/delivery/feature/.../delivery-detail.component.ts`
- Servicio delivery backend: `libs/delivery/backend/.../delivery.service.ts`
