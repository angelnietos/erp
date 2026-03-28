# 📜 Plan de Refactorización V2: Módulos Frontend Restantes y Desacoplamiento de Backend

Este documento detalla los pasos exactos para completar la transformación de los módulos restantes del Frontend (`Inventory` y `Billing`) y, más importante, cómo vaciar el Backend monolítico (`apps/backend`) trasladando su lógica a "Plugins de NestJS" independientes.

---

## 🏗️ 1. Módulos Frontend Restantes (Inventory y Billing)
Basado en lo que ya hemos hecho en `Clients`, `Budget` y `Delivery`, debemos aplicar exactamente el mismo patrón "Plugin V2" a estos dos módulos:

### 1.1. Inventario / Flota (`libs/inventory/feature` y `libs/inventory/data-access`)
- **Paso A (Token):** Crear `inventory-feature.config.ts`. Definir interface para inyectar columnas (ej. ocultar columnas de "Nº Serie" si el cliente no alquila equipo seriado) y activar/desactivar botones de "Nueva Reserva".
- **Paso B (Facade):** Crear `inventory.facade.ts` basado en Signals (o NgRx SignalStore si se requiere estado complejo) para aislar las llamadas HTTP del servicio `InventoryService`.
- **Paso C (Smart Component):** Refactorizar `inventory-list.component.ts`. Quitar llamadas RxJS complejas. Usar `this.facade.inventoryItems` e inyectar el token de configuración (`INVENTORY_FEATURE_CONFIG`).
- **Paso D (Exportación):** Exponer el Facade y el Token en los `index.ts` públicos de cada librería.

### 1.2. Facturación e Impuestos (`libs/billing/feature`)
- **Paso A (Token):** Identificar la lógica inyectable. Por ejemplo: tipos de impuestos (`IVA`, `IGIC`), conexión con la API de Verifactu, etc.
- **Paso B (Facade):** Crear `billing.facade.ts` para manejar estados complejos de facturación (ej. facturas pendientes, facturas emitidas).
- **Paso C (UI):** Adaptar la interfaz basada en `ui-kit` y consumir el Token para botones de "Descargar PDF" o "Emitir a Verifactu".

---

## 🚀 2. "Vaciado" del Monolito Backend (NestJS Plugins)
Actualmente, el backend de la app central (`apps/backend/src/app`) contiene controladores, servicios transversales y reglas de negocio pesadas. **Debemos vaciarlo.** La App debe ser solo una carcasa o "Shell".

### 2.1. Creación de Librerías Backend
Para cada dominio, crear una librería backend puramente inyectable de NestJS (Si no existen, generarlas con Nx: `nx g @nx/nest:library backend-budget`).

- `libs/budget/backend`
- `libs/clients/backend`
- `libs/delivery/backend`
- `libs/inventory/backend`

### 2.2. Aislamiento de Controladores y Servicios
Mover los archivos físicamente:
1. Mover `budget.controller.ts` y `budget.service.ts` desde `apps/backend/src/app/budgets/` hacia `libs/budget/backend/src/lib/`.
2. Encapsularlos en un `BudgetModule` limpio y exportable.
3. Repetir el proceso para todos los dominios. **IMPORTANTE:** Ningún servicio de dominio A debe importar directamente a un servicio de dominio B si no es a través de módulos acoplados o eventos.

### 2.3. Control de Inyección (Módulos Dinámicos)
- Refactorizar el módulo para aceptar configuración, usando el patrón `forRoot`.
  
```typescript
@Module({})
export class BudgetBackendModule {
  static forRoot(options: BudgetModuleOptions): DynamicModule {
    return {
      module: BudgetBackendModule,
      providers: [
        BudgetService,
        {
          provide: 'BUDGET_CALCULATOR',
          useClass: options.customCalculator || StandardBudgetCalculator,
        }
      ],
      controllers: [BudgetController]
    };
  }
}
```

### 2.4. Limpieza Final del Chasis (`apps/backend`)
El archivo `app.module.ts` en `apps/backend` perderá todos sus `controllers` y `providers` customizados. Deberá verse exclusivamente como un "Ensamblador de Plugins":

```typescript
@Module({
  imports: [
    ClsModule.forRoot({ /* Configurado en el paso anterior */ }),
    PrismaModule, 
    AuthModule,
    
    // Plugins Funcionales "Marca Blanca" activados para este Tenant de Backend
    ClientsBackendModule,
    BudgetBackendModule.forRoot({ /* Config. del Tenant Base */ }),
    DeliveryBackendModule,
    InventoryBackendModule,
  ],
})
export class AppModule {}
```

---

## 🎯 Resultado EsperadoTras Esta Fase
Si ejecutas este plan, tendrás la garantía de que:
1. **Frontend 100% Desacoplado:** Todos los módulos cargan mediante Tokens. Construir la UI para el *Cliente X* es solo cuestión de cambiar el valor del Array del Token en su Shell app.
2. **Backend Orientado a Plugins:** Las reglas de negocio pesadas (facturación, cálculos de albaranes) viven en capas compartidas puras. El núcleo transaccional queda ultra-optimizado y el *AppShell* te permite habilitar o deshabilitar Módulos con solo comentar una línea de importación.

*(Este archivo debe quedar guardado en `plans/v2/` como tu brújula para los siguientes commits de reestructuración masiva).*
