# Plan de Mejoras - Arquitectura Modular ERP Josanz

## Estado Actual

La arquitectura actual sigue una estructura Nx monorepo con:

- **apps/**: Aplicaciones (backend, frontend, verifactu-api)
- **libs/**: Librerías modulares por dominio

### Estructura Actual de libs/

| Dominio | api | core | data-access | feature | shell | Estado |
|---------|-----|------|-------------|---------|-------|--------|
| auth | - | - | - | - | - | ⚡ jwt, api-key |
| billing | ✅ | ⚡ | - | ⚡ | - | Parcial |
| budget | - | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| clients | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| delivery | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| fleet | ⚡ | - | - | ⚡ | ⚡ | Incompleto |
| identity | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| inventory | - | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| rentals | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | Parcial |
| verifactu | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | Tiene legacy |

### libs/shared/ Existentes

- ✅ `shared/config` - Environment y validators
- ✅ `shared/cqrs` - Commands y Queries
- ✅ `shared/data-access` - Prisma y Outbox
- ✅ `shared/events` - Event Bus y Event Store
- ✅ `shared/integrations/email` - Puerto y adaptadores
- ✅ `shared/integrations/storage` - Puerto y adaptadores
- ✅ `shared/model` - EntityId, Aggregate, Value Objects
- ✅ `shared/ui-kit` - Componentes Angular
- ✅ `shared/utils` - Crypto, Date, String, Validation

---

## Problemas Identificados

### 1. Código Duplicado en APIS

- `apps/verifactu-api/src/modules/verifactu/` contiene lógica que debería estar en libs
- `apps/backend/src/modules/*/` tiene controllers y servicios que podrían estar en libs

### 2. Puertos de Repositorio Inconsistentes

Algunos dominios tienen puertos en `core`, otros no. Los repositorios Prisma están en diferentes ubicaciones.

### 3. Falta Normalización de Capas

No hay un patrón consistente de:
- `core/src/application/use-cases/`
- `core/src/application/dtos/`
- `core/src/domain/events/`

### 4. Integraciones No Reutilizadas

Las integraciones en `shared/integrations/` existen pero no se consumen en los módulos de backend.

### 5. Falta Completar Módulos

- **fleet**: Sin core, sin data-access
- **delivery**: Sin repository implementation
- **billing**: Sin repository implementation
- **verifactu**: Código legacy sin migrar

---

## Plan de Mejoras

### Fase 1: Normalizar Estructura de Dominios

#### 1.1 Estándar de Estructura por Dominio

Cada dominio en `libs/*/` debe seguir:

```
libs/{domain}/
├── api/                    # DTOs, enum types (compartido entre frontend/backend)
├── core/                   # Domain logic
│   └── src/
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── errors/
│       │   └── events/
│       ├── application/
│       │   ├── use-cases/
│       │   ├── dtos/
│       │   └── ports/
│       └── index.ts
├── data-access/            # Repository implementations
│   └── src/
│       ├── repositories/
│       ├── services/
│       └── index.ts
├── feature/                # Componentes Angular
├── shell/                  # Rutas y navegación
└── project.json
```

#### 1.2 Mover DTOs a libs/*/api

**Objetivo**: Reutilizar DTOs entre apps/backend y apps/verifactu-api

```
# DTOs que deben mudarse:
apps/verifactu-api/src/modules/verifactu/application/dtos/* → libs/verifactu/api/src/
apps/backend/src/modules/*/application/dtos/* → libs/*/api/src/
```

**Beneficio**: Un solo DTO para frontend y backend

---

### Fase 2: Consolidar APIs en libs

#### 2.1 Crear libs/verifactu/api con DTOs

Mover los DTOs de verifactu-api a la lib:

```
libs/verifactu/api/src/
├── dtos/
│   ├── create-customer.dto.ts
│   ├── create-series.dto.ts
│   ├── create-webhook-endpoint.dto.ts
│   └── enqueue-invoice.dto.ts
└── index.ts
```

#### 2.2 Mover Controllers a libs

Los controllers HTTP deberían estar en libs/*/api para máxima reutilización:

```
# Recomendación: Controller en lib (exportable a NestJS)
libs/verifactu/api/src/lib/controllers/verifactu.controller.ts
apps/verifactu-api/src/app/app.module.ts → importa el controller desde la lib
```

---

### Fase 3: Completar Puertos de Repositorio

#### 3.1 Inventario de Puertos

| Dominio | Puerto | Ubicación | Implementación Prisma |
|---------|--------|-----------|----------------------|
| identity | UserRepositoryPort | identity/core | identity/data-access ✅ |
| clients | ClientRepositoryPort | clients/core | clients/data-access ✅ |
| budget | BudgetRepositoryPort | budget/core | budget/data-access ✅ |
| inventory | InventoryRepositoryPort | inventory/core | inventory/data-access ✅ |
| delivery | DeliveryRepositoryPort | delivery/core | ❌ Faltante |
| fleet | FleetRepositoryPort | ❌ Faltante | ❌ Faltante |
| billing | BillingRepositoryPort | ❌ Faltante | ❌ Faltante |
| rentals | RentalRepositoryPort | rentals/core | ❌ Faltante |

#### 3.2 Crear Repository Faltantes

```bash
# Crear implementations Prisma faltantes:
libs/delivery/data-access/src/lib/repositories/prisma-delivery.repository.ts
libs/fleet/data-access/src/lib/repositories/prisma-fleet.repository.ts
libs/billing/data-access/src/lib/repositories/prisma-billing.repository.ts
libs/rentals/data-access/src/lib/repositories/prisma-rental.repository.ts
```

---

### Fase 4: Usar Integraciones Compartidas

#### 4.1 Conectar con Email

Los módulos que envíen emails deben usar `EmailPort` de `shared/integrations/email`:

```typescript
// Ejemplo en budget module
import { EmailPort, EMAIL_PORT } from '@josanz-erp/shared-integrations-email';

@Injectable()
export class BudgetNotificationService {
  constructor(@Inject(EMAIL_PORT) private readonly email: EmailPort) {}
  
  async notifyBudgetCreated(budget: Budget): Promise<void> {
    await this.email.send({
      to: budget.clientEmail,
      subject: 'Presupuesto creado',
      template: 'budget-created',
    });
  }
}
```

#### 4.2 Conectar con Storage

Para verifactu (archivos XML, PDFs):

```typescript
import { StoragePort, STORAGE_PORT } from '@josanz-erp/shared-integrations-storage';
```

---

### Fase 5: Completar Dominios Incompletos

#### 5.1 Fleet (Gestión de Vehículos)

```
libs/fleet/
├── api/
│   └── src/lib/dtos/  (vehicle.dto.ts, driver.dto.ts)
├── core/
│   └── src/lib/domain/
│       ├── entities/  (vehicle.entity.ts, driver.entity.ts)
│       └── ports/     (fleet.repository.port.ts)
├── data-access/
│   └── src/lib/repositories/
│       └── prisma-fleet.repository.ts
└── feature/  (vehicle-list, driver-list)
```

#### 5.2 Delivery (Albaranes)

Complementa el flujo Budget → Delivery → Invoice:

```
libs/delivery/
├── core/src/lib/domain/
│   ├── entities/  (delivery-note.entity.ts ✅ existente)
│   └── ports/    (delivery.repository.port.ts ✅ existente)
└── data-access/src/lib/repositories/
    └── prisma-delivery.repository.ts  (POR CREAR)
```

#### 5.3 Billing (Facturación)

```
libs/billing/
├── core/src/lib/domain/
│   ├── entities/  (invoice.entity.ts)
│   └── ports/    (billing.repository.port.ts)
└── data-access/src/lib/repositories/
    └── prisma-billing.repository.ts
```

---

### Fase 6: Migrar Código Legacy

#### 6.1 Verifactu Legacy

El código en `libs/verifactu/legacy/` debe migrarse a la estructura moderna:

```
# Archivos a migrar:
libs/verifactu/legacy/src/hash/          → libs/verifactu/core/src/lib/services/
libs/verifactu/legacy/src/qr/           → libs/verifactu/core/src/lib/services/
libs/verifactu/legacy/src/invoice/      → libs/verifactu/core/src/lib/application/
libs/verifactu/legacy/src/queue/        → libs/verifactu/core/src/lib/infrastructure/
```

#### 6.2 Limpiar apps/backend

Mover lógica de aplicación a libs y dejar en apps/backend solo:

- Configuración de módulos NestJS
- Controllers (opcionalmente importadas desde libs)
- Guards y interceptors globales

---

### Fase 7: Reutilizar CQRS

#### 7.1 Implementar Commands/Queries

Usar `shared/cqrs` para flujos de negocio:

```typescript
// libs/budget/core/src/lib/commands/create-budget.command.ts
import { Command } from '@josanz-erp/shared-cqrs';

export class CreateBudgetCommand extends Command<CreateBudgetResponse> {
  constructor(public readonly dto: CreateBudgetDto) {
    super();
  }
}
```

#### 7.2 Handlers en data-access

```typescript
// libs/budget/data-access/src/lib/handlers/create-budget.handler.ts
@CommandHandler(CreateBudgetCommand)
export class CreateBudgetHandler implements ICommandHandler<CreateBudgetCommand> {
  constructor(private readonly repository: BudgetRepositoryPort) {}
  
  async execute(command: CreateBudgetCommand): Promise<CreateBudgetResponse> {
    // lógica de creación
  }
}
```

---

## Prioridades de Implementación

| # | Tarea | Prioridad | Dependencias |
|---|-------|-----------|--------------|
| 1 | Normalizar puertos de repositorio en todos los dominios | Alta | None |
| 2 | Crear Prisma repositories faltantes (delivery, fleet, billing, rentals) | Alta | 1 |
| 3 | Mover DTOs a libs/*/api | Media | None |
| 4 | Conectar módulos con shared/integrations/email | Media | None |
| 5 | Completar Fleet core y data-access | Baja | 1 |
| 6 | Migrar verifactu legacy | Baja | 3 |
| 7 | Implementar CQRS en dominios | Baja | None |

---

## Comandos de Verificación

```bash
# Verificar estructura de libs
npx nx graph

# Verificar que todas las libs buildan
npx nx run-many -t build --all

# Verificar imports problemáticos
rg "from ['\"]\.\.\/.*\/" libs

# Verificar puertos de repositorio faltantes
rg "RepositoryPort" libs/*/core --files-without-match
```

---

## Beneficios Esperados

1. **Reutilización**: Una misma lib usada por múltiples apps
2. **Mantenibilidad**: Lógica de dominio aislada y testeable
3. **Consistencia**: Patrón uniforme en todos los dominios
4. **Escalabilidad**: Nuevos proyectos pueden importar libs directamente
5. **Testabilidad**: Unit tests en core, integration tests en data-access

---

*Plan creado: 2026-03-27*
*Basado en análisis de libs/*, apps/backend/*, apps/verifactu-api/*
