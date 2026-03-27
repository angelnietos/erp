# Plan Unificado de Implementación - ERP Josanz

## Resumen de Documentos Analizados

| Documento | Enfoque | Estado Actual |
|-----------|---------|----------------|
| [`arquitectura-modularidad-mejoras.md`](arquitectura-modularidad-mejoras.md) | Mejoras estructurales de modularidad | ✅ Parcialmente implementado (shared/data-access, shared/model) |
| [`ALIAS_IMPORT_MIGRATION_PLAN.md`](ALIAS_IMPORT_MIGRATION_PLAN.md) | Migración a alias @josanz-erp/* | 🔄 En progreso |
| [`arch.md`](arch.md) | Blueprint técnico (DDD, Hexagonal, ADR) | 📋 Documento guía |
| [`funcional.md`](funcional.md) | Requisitos funcionales | 📋 Documento guía |

---

## Visión de Arquitectura Unificada

### CapasArquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
│              (apps/frontend - Host Application)             │
├─────────────────────────────────────────────────────────────┤
│                     NestJS Backend                           │
│              (apps/backend - ERP Principal)                │
├─────────────────────────────────────────────────────────────┤
│               Dominios (libs/*/core)                        │
│   Identity │ Clients │ Budget │ Inventory │ Rentals │       │
│   Delivery │ Fleet │ Billing │ Verifactu                      │
├─────────────────────────────────────────────────────────────┤
│                Infraestructura Compartida                   │
│    shared/data-access │ shared/model │ shared/utils        │
└─────────────────────────────────────────────────────────────┘
```

### Dominios y Flujo de Negocio

Según [`arch.md`](arch.md:390-400):

```
FLOW 1: DOCUMENTACIÓN FINANCIERA
[Client] ---> [Budget] ---> [DeliveryNote] ---> [Invoice (Verifactu)]

FLOW 2: TRAZABILIDAD MATERIAL
[Product Catalog] ---> [Inventory (Physical Stock)] ---> [Rental Scheduler]

FLOW 3: LOGÍSTICA
[Vehicle] ---> [Driver] ---> [Delivery]
```

---

## Fases de Implementación

### Fase 1: Completar Infraestructura Shared (PRIORIDAD ALTA)

**Objetivo:** Finalizar las libs compartidas necesarias para el MVP.

#### 1.1 `libs/shared/data-access` ✅ YA CREADO
- [x] PrismaService
- [x] PrismaModule  
- [x] OutboxService
- [x] OutboxModule

#### 1.2 `libs/shared/model` ✅ YA CREADO
- [x] EntityId
- [x] AggregateRoot
- [x] Entity base class
- [x] Value Objects (Money, Email, DateRange)
- [x] Domain Errors

#### 1.3 `libs/shared/utils` (POR CREAR)
```
libs/shared/utils/
├── src/
│   ├── crypto/
│   │   ├── uuid.ts
│   │   └── hash.ts
│   ├── date/
│   │   ├── date-utils.ts
│   │   └── date-formatter.ts
│   ├── string/
│   │   └── string-utils.ts
│   └── validation/
│       └── validators.ts
```

#### 1.4 `libs/shared/events` (POR CREAR)
```
libs/shared/events/
├── src/
│   ├── interfaces/
│   │   ├── domain-event.interface.ts
│   │   └── event-handler.interface.ts
│   └── services/
│       ├── event-bus.service.ts
│       └── event-store.service.ts
```

#### 1.5 `libs/shared/config` (POR CREAR)
```
libs/shared/config/
├── src/
│   ├── environments/
│   │   └── environment.ts
│   └── validators/
│       └── env.validator.ts
```

---

### Fase 2: Completar Librerías de Dominio

#### 2.1 Identity ✅ PARCIAL
- [x] `libs/identity/core` - entities, ports
- [x] `libs/identity/data-access` - services, store
- [x] `libs/identity/feature` - componentes UI
- [x] `libs/identity/shell` - rutas
- [ ] COMPLETAR: agregar AuthService en core, PasswordHashService

#### 2.2 Clients ✅ PARCIAL
- [x] `libs/clients/core` - ports, services
- [x] `libs/clients/data-access` - services
- [ ] COMPLETAR: agregar más métodos de repositorio

#### 2.3 Budget ✅ PARCIAL
- [x] `libs/budget/core` - entities, ports
- [x] `libs/budget/data-access` - services
- [x] `libs/budget/feature` - componentes UI (list, create)
- [ ] COMPLETAR: implementar versión completa

#### 2.4 Inventory ✅ PARCIAL
- [x] `libs/inventory/core` - entities, ports
- [x] `libs/inventory/feature` - componentes UI
- [ ] COMPLETAR: implementar repository y data-access

#### 2.5 Rentals ✅ PARCIAL
- [x] `libs/rentals/api` - DTOs
- [x] `libs/rentals/core` - existente
- [x] `libs/rentals/feature` - componentes UI
- [ ] COMPLETAR: implementar lógica de reservas

#### 2.6 Delivery ⚠️ INCOMPLETO
- [x] `libs/delivery/api` - empty
- [ ] CREAR: entities, ports, services
- [ ] IMPLEMENTAR: flujo delivery (albaranes)

#### 2.7 Fleet ⚠️ INCOMPLETO
- [x] `libs/fleet/api` - empty
- [ ] CREAR: entities, ports, services
- [ ] IMPLEMENTAR: gestión de vehículos

#### 2.8 Billing ✅ PARCIAL
- [x] `libs/billing/api` - DTOs
- [x] `libs/billing/feature` - empty
- [ ] COMPLETAR: integrar con verifactu

#### 2.9 Verifactu ⚠️ TIENE LEGADO
- [x] `libs/verifactu/core` - servicios, ports
- [x] `libs/verifactu/adapters` - implementaciones
- [x] `libs/verifactu/api` - DTOs
- [x] `libs/verifactu/feature` - dashboard
- [ ] MIGRAR: código de legacy/ a módulos actuales

---

### Fase 3: Migración de Imports a Alias

Según [`ALIAS_IMPORT_MIGRATION_PLAN.md`](ALIAS_IMPORT_MIGRATION_PLAN.md):

#### 3.1 Completar tsconfig.base.json
Verificar que todos los proyectos tengan alias definidos.

#### 3.2 Reemplazar Imports
```bash
# Auditar imports relativos problemáticos
rg "from ['\"]\\.{2}/\\.{2}" apps libs

# Auditar deep imports
rg "@josanz-erp/.*/src/" apps libs
```

#### 3.3 Agregar Reglas de Enforcement
- [ ] Mantener `@nx/enforce-module-boundaries`
- [ ] Añadir `no-restricted-imports`
- [ ] Definir tags en `project.json`

---

### Fase 4: Implementación de DDD

Según [`arch.md`](arch.md:293-410), implementar arquitectura hexagonal:

#### 4.1 Estructura por Dominio
```
libs/{domain}/core/src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── errors/
│   └── events/
├── application/
│   ├── use-cases/
│   ├── dtos/
│   └── ports/
└── index.ts
```

#### 4.2 Puertos y Adaptadores
- [ ] Implementar Repository Ports en core
- [ ] Implementar Prisma Repositories en data-access
- [ ] Implementar HTTP Controllers en apps

#### 4.3 Eventos de Dominio
- [ ] Integrar Outbox con eventos de dominio
- [ ] Implementar flujo Budget → Delivery → Invoice

---

### Fase 5: Verifactu (Legal)

Según [`arch.md`](arch.md:357-366):

#### 5.1 Adapter Verifactu
- [ ] Integración completa con AEAT
- [ ] Generación de QR
- [ ] Encadenamiento de hashes
- [ ] Sistema de reintentos

#### 5.2 Limpiar Legacy
- [ ] Revisar [`MIGRATION_STATUS.md`](libs/verifactu/legacy/MIGRATION_STATUS.md)
- [ ] Migrar código remaining
- [ ] Eliminar directorio legacy

---

### Fase 6: Testing y Calidad

#### 6.1 Tests Requeridos
- [ ] Unit tests por dominio (core)
- [ ] Integration tests (data-access)
- [ ] E2E tests (apps)

#### 6.2 Storybook
- [ ] Configurar Storybook
- [ ] Crear historias para ui-kit

---

## Commands de Verificación

```bash
# Verificar estructura Nx
npx nx graph

# Build completo
npx nx run-many -t build --all

# Lint completo
npx nx run-many -t lint --all

# Tests
npx nx run-many -t test --all

# Verificar imports problemáticos
rg "from ['\"]\\.{2}/\\.{2}" apps libs
```

---

## Criterios de Éxito

1. ✅ Todas las libs tienen `index.ts` público
2. ✅ Todos los imports cross-project usan alias `@josanz-erp/*`
3. ✅ No hay código duplicado entre dominios
4. ✅ Build/lint/test pasan sin errores
5. ✅ Código legacy migrado o eliminado

---

*Plan unificado creado: 2026-03-27*
*Combina: arquitectura-modularidad-mejoras.md + ALIAS_IMPORT_MIGRATION_PLAN.md + arch.md + funcional.md*
