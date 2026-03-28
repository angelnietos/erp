# 🏛️ Technical Architecture Blueprint V2 (Josanz ERP SaaS)

## 0. Visión General: Ecosistema Modular Multi-Tenant (Marca Blanca)
La arquitectura deja de estar acoplada a "Josanz Audiovisuales" como consumidor monolítico (Single-Tenant) y evoluciona hacia un **Ecosistema de Plataforma-como-Servicio (PaaS)**. El objetivo es estructurar el código base en Nx para compilar aplicaciones ERP personalizadas para infinitos clientes, extendiendo librerías funcionales (Plugins) y aislando los datos y flujos operativos de cada uno.

### 🔑 Pilares de la V2
- **Modularidad Radical (App Shells):** Aplicaciones vacías que se rellenan importando librearías funcionales.
- **Inversión de Dependencias (DI):** Angular y NestJS permiten sustituir componentes visuales, cálculos matemáticos o conectores externos sin modificar la librería core.
- **Aislamiento Multi-Tenant Estricto:** `tenant_id` obligatorio incrustado dinámicamente en el contexto de memoria (AsyncLocalStorage) para evitar filtración de registros entre empresas.

---

## 1. Diseño de Arquitectura (Backend) - "Plug and Play API"

El backend transicional se basa en el patrón de **Módulos Dinámicos de NestJS** y Arquitectura Hexagonal.

### 1.1 Inyección de Contexto (Tenancy Middleware)
Para asegurar que un cliente no vea facturas de otro, implementamos **`nestjs-cls` (Continuation Local Storage)**. 
Un interceptor captura el `x-tenant-id` (desde la cabecera HTTP o el payload del JWT) y lo inyecta en el contexto asíncrono.
El `PrismaService` es sobrescrito con el middleware interno `$use` (o Prisma Extensions) de forma que cualquier operación `findMany`, `update`, o `create` incrusta matemáticamente el `{ tenantId }` sin que el programador tenga que teclearlo en los Controladores.

### 1.2 Módulos Funcionales Aislados
Se elimina la carpeta `apps/backend/src/app` como contenedor de lógica. Las aplicaciones backend (`apps/clienteA-api`) solo contienen un `AppModule` que ensambla Plugins.

```typescript
@Module({
  imports: [
    CoreModule.forRoot(), // Prisma, Config, Identity
    BudgetBackendModule.forRoot({
      taxStrategy: SpainTaxStrategy // Inversión de dependencia: lógica fiscal española
    }),
    InventoryBackendModule, // Plugin de inventario estándar
  ]
})
```

---

## 2. Diseño de Arquitectura (Frontend) - "UI Composability"

El frontend migra a un paradigma "Micro-Frontend Semántico" basado en Monorepo y **Angular Standalone Components**.

### 2.1 Patrón Facade (Manejo de Estado)
Los "Smart Components" (`budget-list.component.ts`) no inyectan el `HttpClient`, ni gestionan suscripciones de RxJS complejas. Se usa el patrón **Facade con Angular Signals**.
La lógica reside en librerías `data-access` (ej. `BudgetFacade`), dejando los componentes limpios y focalizados exclusivamente en el renderizado y en reaccionar al estado (`this.facade.budgets()`).

### 2.2 Tokens de Configuración (InjectionTokens)
¿Qué ocurre si el *Cliente B* no maneja equipos seriados en su Inventario? En lugar de hacer `*ngIf="cliente === 'B'"`, la librería `inventory/feature` define un `INVENTORY_FEATURE_CONFIG` genérico. El *AppShell* del Cliente B inyecta su propia configuración, omitiendo las columnas que no requiere.
Esto cumple el Principio Abierto-Cerrado (OCP): La librería base está cerrada a modificaciones `if/else`, pero está abierta a extensión por inyección.

---

## 3. Topología Nx y Límites Arquitectónicos (Boundary Rules)

Para evitar la deuda técnica ("Spaghetti Code"), implementamos reglas estrictas de importación usando **ESLint (`@nx/enforce-module-boundaries`)**:

1. **`domain`** (Solo Interfaces/DTOs/Tipos puros): Ninguna lógica acoplada a frameworks. Importable por todos.
2. **`backend`** (Módulos NestJS): Depende de `domain` y bases de datos. Jamás importa de otro `backend` directamente. Si necesita hablar con `Inventory`, lo hace a través de Eventos de Dominio (Outbox/Kafka/Redis) o una librería `shared-api`.
3. **`frontend/data-access`** (Estado Angular): Se comunica con la URL de la API mediante servicios.
4. **`frontend/feature`** (Componentes List/Detail): Componentes puros. Importan de `data-access`.
5. **`shell`** (Rutas y Ensamblaje): Punto de entrada Lazy-Loaded importado por las apps finales.

---

## 4. Estrategia de Eventos Transaccionales (Patrón Outbox)
Para el cumplimiento normativo (ej. Verifactu AEAT) y la salud técnica del monolito modular, las integraciones con sistemas externos o entre módulos distintos no suceden sincrónicamente.
- Cuando `BillingController` firma una factura, no hace un `HTTP POST` a Verifactu que podría hacer fallar la emisión.
- Cambia la Factura a `EMITIDA` dentro de una **Transacción SQL**, y en la misma transacción inserta un evento en una tabla `OutboxEvents`.
- Un *Background Worker* lee el evento de forma independiente, contacta con la AEAT y maneja los reintentos automáticos sin penalizar la respuesta HTTP del usuario.

Este diseño permite que `Cliente A` tenga activado el `Worker Verifactu` mientras que `Cliente B` (que está en otro país) simplemente descarte el módulo de integración o conecte su propio worker.
