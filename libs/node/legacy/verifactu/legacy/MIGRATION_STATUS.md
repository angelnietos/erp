# Verifactu Legacy Migration Status

Estado de migración del código histórico de:

- `C:\Users\amuni\Desktop\josanz-proyect\verifactu`

hacia el monorepo:

- `C:\Users\amuni\Desktop\josanz-proyect\josanz-erp`

## Qué se ha migrado ya

Se copió el código legacy completo a:

- `libs/verifactu/legacy/src`

Objetivo: conservar funcionalidad histórica dentro del monorepo para migración incremental.

## Qué está activo actualmente

La ruta activa de ejecución es:

- `apps/verifactu-api`
- `libs/verifactu/core`
- `libs/verifactu/adapters`

El ERP consume Verifactu mediante adapter HTTP (sin acoplar lógica fiscal dentro de `apps/backend`).

## Qué NO está activo todavía (legacy)

El código de `libs/verifactu/legacy/src` contiene dependencias y wiring antiguos (`@nestjs/mongoose`, `soap`, repositorios legacy) y no se usa como runtime principal en este punto.

## Plan de extracción desde legacy

1. `aeat/aeat-soap.service.ts` -> adapter real de AEAT en `libs/verifactu/adapters`.
2. `xml/*`, `hash/*`, `qr/*` -> mover utilidades a `libs/verifactu/core`.
3. `queue/*` -> worker/retry formal con cola en adapters.
4. `customers/*`, `series/*` -> convertir a módulos de tenant/config del producto.
5. `record-query/*`, `compliance/*` -> endpoints v1 en `apps/verifactu-api`.

## Decisión de arquitectura

- Legacy queda como base de referencia dentro del monorepo.
- Desarrollo nuevo y despliegue van sobre `verifactu-api` + `libs/verifactu/*`.

