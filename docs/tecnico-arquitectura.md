# Josanz ERP — Documento técnico (arquitectura y desarrollo)

Audiencia: arquitectos de software, desarrolladores backend/frontend, DevOps.

## 1. Visión del sistema

Monorepo **Nx** que agrupa aplicaciones y librerías compartidas para un ERP multi-módulo: clientes, inventario, presupuestos, flota, alquileres, albaranes de entrega, facturación e integración **Verifactu** (cumplimiento fiscal español).

## 2. Stack principal

| Capa | Tecnología |
|------|------------|
| Frontend | Angular (standalone), librerías de features por dominio |
| API principal | NestJS (apps/backend) |
| Datos | Prisma ORM, PostgreSQL (implícito vía schema) |
| Verifactu | API/worker dedicados, librerías `verifactu-core`, `verifactu-adapters` |
| Calidad | ESLint, Jest, Playwright (e2e) |

## 3. Organización del código (Nx)

- **`apps/`**: `frontend` (SPA), `backend` (API Nest), `verifactu-api`, `verifactu-worker`, etc.
- **`libs/<dominio>/`**: típicamente `feature` (UI), `data-access`, `api` (contratos), `shell` (rutas), `backend` / `core` según el módulo.
- **`libs/shared/*`**: UI kit, shell, utilidades, configuración, CQRS, eventos, etc.
- **`libs/shared-infrastructure`**: aspectos transversales (p. ej. multi-tenant, validación de UUID en cabeceras).

Los límites de dependencias se orientan con **tags** Nx (`type:feature`, `type:backend`, `scope:shared`, …) definidos en `nx.json`.

## 4. Multi-tenant

- El tenant se propaga vía cabeceras (p. ej. `x-tenant-id`) y contexto de ejecución (CLS) en backend.
- Solo se considera válido un identificador de tenant con formato UUID; entradas inválidas no deben contaminar el contexto (middleware + saneo en cliente).
- Login y resolución por **slug** cuando el valor almacenado en el cliente no es un UUID válido.

## 5. Módulo de albaranes (delivery)

- **Persistencia**: campo `signature_blob_url` en Prisma (nombre histórico): almacena **URL pública**, **data URL** (`data:image/...`) o texto de conformidad según el flujo.
- **API**: firma vía `PUT .../delivery-notes/:id/sign` con cuerpo `{ signature }`.
- **Frontend**: `DeliveryDetailComponent` usa `parseSignatureDisplayValue` (`@josanz-erp/shared-utils`) para normalizar URL / data URL / base64 sin prefijo antes de asignar `[src]` al `<img>`.

## 6. Utilidades compartidas y bundle Angular

- **`@josanz-erp/shared-utils`**: exporta utilidades seguras para el navegador (fechas, strings, impresión/PDF ligero, parsing de firma, UUID vía `crypto.randomUUID()`).
- **`@josanz-erp/shared-utils/node`**: entrada opcional para código **solo Node** (p. ej. hashes con módulo `crypto` de Node). No debe importarse desde el frontend.

Razón: el compilador de Angular sigue la cadena de imports del barrel; reexportar módulos Node en el índice principal rompe el build del cliente.

## 7. Verifactu

- Desacoplamiento entre dominio (`verifactu-core`), adaptadores de infraestructura y apps.
- **Worker**: proceso asíncrono; conviene fijar puerto dedicado (p. ej. variables `VERIFACTU_WORKER_PORT` / `PORT`) para no colisionar con el frontend (4200) u otras APIs (3000).
- **Dashboard**: detalle de factura debe resolver PK real de factura frente a id de log Verifactu según la API expuesta (facade `resolveInvoicePk` u equivalente).
- En entornos con problemas de **plugin workers de Nx**, scripts con `NX_DAEMON=false` y `NX_PLUGIN_NO_TIMEOUTS=true` reducen bloqueos locales.

## 8. PDF e impresión en cliente

- Generación liviana mediante HTML + ventana de impresión (`openPrintableDocument`, `escapeHtml` en `shared-utils`), usada en albarán y presupuesto; no sustituye a un motor PDF servidor para documentos legales complejos.

## 9. Prácticas recomendadas

- Nuevas integraciones **solo navegador**: añadirlas bajo `libs/shared/utils/src/lib/browser/` y exportarlas desde el índice principal; código Node en `node.ts` o paquetes backend.
- Seeds y datos de demo: no usar URLs de imagen inventadas en campos que el UI trata como `img src`; preferir **data URL** válida o almacenamiento real (blob/S3).
- Contratos HTTP: alinear DTOs entre `*-api`, `*-data-access` y respuestas Nest para evitar 404 o modelos incompletos en detalle.

## 10. Referencias de rutas útiles

- Esquema Prisma: `apps/backend/prisma/schema.prisma`
- Paths TypeScript: `tsconfig.base.json`
- Detalle albarán: `libs/delivery/feature/.../delivery-detail.component.ts`
- Servicio delivery backend: `libs/delivery/backend/.../delivery.service.ts`
