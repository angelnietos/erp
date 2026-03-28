# 📜 Plan Específico: Configuración Diabólica del Resto de Frontend y Extracción del Backend

Este documento técnico rige la refactorización quirúrgica (Fase 2 del Roadmap) que extrae las "tripas" del `backend` hacia `libs` y estandariza las features frontend que faltan.

---

## 🔨 ETAPA 1: Estandarización Total de Módulos Frontend (Inventory & Billing)

El objetivo es tener un frontend en Angular que no contiene ninguna lógica rígida en sus componentes, usando `Facades` que ocultan asincronía y centralizan el Estado Recreativo.

### Tarea A: Módulo `Inventory`
1. **Crear Inyectables:** Añadir `INVENTORY_FEATURE_CONFIG` en `libs/inventory/feature/src/lib/inventory-feature.config.ts`.
2. **Centralizar Estado:** Diseñar `InventoryFacade` en `data-access` utilizando Signals para manejar arrays de `Product[]` o `InventoryRecord[]` liberando al servicio HTTP.
3. **Limpiar Smart Component:** Refactorizar `inventory-list.component.ts`. Quitar las llamadas RxJS encadenadas e inyectar configuraciones: `class InventoryList { config = inject(INVENTORY_FEATURE_CONFIG); facade = inject(InventoryFacade); ... }`.

### Tarea B: Módulo `Billing` (Facturación)
1. **Configuraciones Críticas:** Crear `BILLING_FEATURE_CONFIG` definiendo opciones como `enableVerifactu: boolean`, `defaultTaxes: string[]`. 
2. **Facade Complejo:** `BillingFacade` debe gobernar la maquinaria asíncrona (descargas de PDFs de facturas, cambio de estados fiscales con banderas de "saving" puras sin ensuciar la UI).
3. **Clean UI:** Renombrar e importar el UI-Kit genérico de Josanz para tablas, sin lógica matemática insertada en el template HTML.

---

## 🪓 ETAPA 2: El Vaciado del Backend Monolítico (Extirpación)

Actualmente la carpeta `apps/backend/src/app` asume todo el rol de servidor y lógica de negocio, lo cual impide compilar el núcleo del servidor para clientes que "no pagaron" o "no usan" módulos concretos (como Flota). Debemos hacer de `apps/backend` un caparazón vacío.

### Acción 1: Construcción de Módulos Dinámicos (Plugins Backend)
Para cada dominio:
1. Generar la librería de servidor si no existe: `nx g @nx/nest:library backend-budget --directory=libs/budget/backend`.
2. Mover todos los DTOs, Servicios (`service.ts`), y Controladores (`controller.ts`) físicamente hacia la nueva librería.
3. Extender el `@Module` usando el estándar `DynamicModule`:

```typescript
// libs/budget/backend/src/lib/budget-backend.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { BudgetController } from './controllers/budget.controller';
import { BudgetService } from './services/budget.service';

export interface BudgetConfig { enableApprovalFlow: boolean; }

@Module({})
export class BudgetBackendModule {
  static forRoot(options?: BudgetConfig): DynamicModule {
    return {
      module: BudgetBackendModule,
      controllers: [BudgetController],
      providers: [
        BudgetService,
        { provide: 'BUDGET_CONFIG', useValue: options || { enableApprovalFlow: false } }
      ],
      exports: [BudgetService] // SOLO exportar si la directriz de Boundaries lo aprueba
    };
  }
}
```

### Acción 2: Purga e Inyección en el `AppModule` Shell
La antigua guarida donde vivían todos los endpoints (`apps/backend/src/app/app.module.ts`) ahora se convertirá en un simple ensamblador de Plugins.

```typescript
// apps/backend/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls'; // <- Aisla el Multi-Tenant (Ya aplicado)
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { InventoryBackendModule } from '@josanz-erp/inventory-backend';

@Module({
  imports: [
    // Tecnologías Core
    ClsModule.forRoot({ global: true, middleware: { mount: true, setup: (cls, req) => cls.set('tenantId', req.headers['x-tenant-id']) } }),
    PrismaModule, 
    
    // Plugins Funcionales "Marca Blanca" activados
    IdentityBackendModule,
    ClientsBackendModule.forRoot(),
    BudgetBackendModule.forRoot({ enableApprovalFlow: true }),
    InventoryBackendModule.forRoot(),
    DeliveryBackendModule.forRoot(),
  ],
})
export class AppModule {}
```

### Resultado Definitivo
Cualquier cambio a la lógica de Presupuestos solo afectará a `libs/budget`. Si Nx necesita redesplegar un Tenant C que usa otra API paralela, no compilará `DeliveryBackendModule` aumentando la velocidad CI/CD drásticamente, cerrando el anillo del OCP (Open-Closed Principle).
