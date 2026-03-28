# 📐 Plan Arquitectónico: CRM Multi-Tenant, Modular y Extensible (Cimientos Nx)

## 🎯 Objetivo
Transformar el ecosistema ERP en una verdadera "Plataforma Marca Blanca". La arquitectura debe permitir compilar e implementar CRMs a medida para múltiples clientes reutilizando un núcleo común. 

El modelo a seguir es el de **Ecosistema de Plugins**: Las funcionalidades (backend y frontend) deben ser paquetes (librerías) independientes, extensibles y configurables, permitiendo ensamblar diferentes versiones de la aplicación (distintos tenants/clientes) inyectando comportamientos y estéticas específicos sin tocar el código "Core".

---

## 🧱 Arquitectura de Plugins: Composición Total

El Monorepo de Nx abandonará la idea de una única app gigante para pasar a albergar múltiples "App Shells" ensambladas a partir de librerías.

### 1. Topología de Apps y Librerías

`apps/` **(Ensambladores / Shells por cliente)**
- `crm-core-api/` *(La API Base o Standalone)*
- `clienteA-api/` *(API específica ensamblada para el Cliente A)*
- `clienteA-frontend/` *(App Angular ensamblada para el Cliente A)*

`libs/` **(El ecosistema reutilizable)**
- `shared/` *(Core tecnológico: Auth genérica, UI-Kit, Prisma Schema, CQRS)*
- `<feature>/` *(Las features convertidas en Plugins, ej. fleet, budget, inventory)*
  - `domain/` *(Modelos, interfaces, abstracciones puras)*
  - `backend/` *(Módulo NestJS autocontenido)*
  - `frontend/`
    - `api/` *(Adapter HTTP del frontend)*
    - `data-access/` *(Estado con Signals/NgRx)*
    - `feature/` *(Componentes UI Smart)*
    - `shell/` *(Rutas lazy-loaded)*

---

## 🔌 El Backend como Plataforma Extensible (NestJS)

Cada dominio expone un **Módulo Independiente** que no conoce a los demás a menos que inyecte sus puertos explícitamente.

**1. Composición por Cliente:**
El `AppModule` de cada cliente solo importa lo que pagó o necesita.
```typescript
// apps/clienteA-api/src/app/app.module.ts
@Module({
  imports: [
    CoreInfrastructureModule, 
    BudgetBackendModule,
    // FleetModule NO se importa porque no lo contrataron
  ]
})
export class ClienteAAppModule {}
```

**2. Extensibilidad vía Dependency Injection:**
Si el "Cliente A" tiene una regla especial para calcular impuestos, no se añaden `if (cliente === 'A')` en el código base. Se sobrescribe el proveedor.
```typescript
@Module({
  imports: [BudgetBackendModule],
  providers: [
    {
      provide: BudgetCalculatorService, // El servicio base del Plugin
      useClass: ClienteATaxCalculatorService // La versión extendida
    }
  ]
})
```

---

## 🎨 El Frontend como Plataforma Extensible (Angular)

El frontend sigue exactamente el mismo patrón. Una aplicación cliente es solo un chasis (Shell) vacío con un archivo `app.routes.ts` y una inyección de configuraciones.

**1. Composición por Enrutamiento Estricto:**
La app compone el menú y las rutas dinámicamente según los plugins instalados.
```typescript
// apps/clienteA-frontend/src/app/app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'presupuestos',
    loadChildren: () => import('@josanz-erp/budget-shell').then(m => m.budgetRoutes),
  }
];
```

**2. Sobrescribir Componentes, Estilos y Lógica (DI y Tokens):**
Los plugins base exponen de antemano todo aquello susceptible a cambio a través de `InjectionTokens`.
- **Configuraciones de Pantalla:** Activar o desactivar columnas en una tabla de un plugin.
- **Lógica Específica:** Remplazar el `Facade` del plugin por uno propio en el `app.config.ts` del Front.
- **Componentes Dinámicos:** Si la UI varía demasiado, usar `<ng-container *ngComponentOutlet="...">` configurable por InjectionToken.

Ejemplo:
```typescript
// Configuración para el Cliente A en frontend
providers: [
  { provide: THEME_CONFIG, useValue: { primaryColor: '#ff0000', rounded: true } },
  { provide: BudgetFacade, useClass: CustomClienteABudgetFacade }
]
```

---

## 🧠 Principios Arquitectónicos CRÍTICOS

1. **Clean Architecture + CQRS:** 
   El backend y el data-access del frontend DEBEN comunicarse a través de contratos estrictos (DTOs) localizados en la capa `domain`. Ningún módulo interactúa con la base de datos de otro módulo directamente (Bounded Contexts).
2. **Open-Closed Principle (OCP):**
   Los plugins de features están **Cerrados a modificación directa** para casos de uso específicos de un solo cliente, pero **Abiertos a extensión** vía herencia e Inyección de Dependencias.
3. **Ignorancia del Contexto Global:**
   El módulo `delivery` no sabe si está ejecutándose en `clienteA` o `clienteB`. Todo contexto particular debe ser inyectado (Variables de entorno, JWT tenant_id, Injection Tokens).

---

## 🚀 Pasos para la Transición (Roadmap)

### Fase 1: Reestructuración de Módulos (Plugins Base)
1. Finalizar la migración de las carpetas de `libs/<feature>` actuales a la arquitectura de plugin estándar: separando de forma estricta los `backend`, `core` y subdividiendo el frontend en `api`, `data-access`, `feature`, y `shell`.
2. Exponer todos los Módulos de NestJS y rutas Lazy-Load de Angular "Vanilla" en los `index.ts` públicos.

### Fase 2: Configuración Inyectable (DI & Tokens)
1. Identificar reglas de negocio o de UI que tienen potencial de variar entre clientes.
2. Extraer parámetros y lógicas hardcodeadas a módulos `forRoot({ config })` en NestJS y a `InjectionTokens` en Angular.

### Fase 3: Creación del Primer Tenant (Client-App)
1. Crear `apps/clienteA-api` y `apps/clienteA-frontend`.
2. Ensamblar e importar únicamente un subconjunto de plugins requeridos (ej. Identity + Clients + Budget).
3. Escribir un Provider/Facade "Custom" exclusivo en la app del Tenant para probar la sobrescritura de lógica sin alterar la librería base.

### Fase 4: Escalado y Despliegue Configurable
1. Crear librerías específicas que agrupen extensiones de un cliente (ej. `libs/clients-overrides/clienteA/budget-plugin`).
2. Preparar los pipelines (CI/CD) para compilar y desplegar de forma independiente los artefactos compilados (`dist/apps/clienteA-frontend`) por cada tenant.