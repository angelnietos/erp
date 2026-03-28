# Technical Architecture Blueprint V2
## Plataforma ERP: Ecosistema Modular Multi-Tenant y Composabilidad

---

## 0. Alcance del Sistema (Visión "Marca Blanca")
La arquitectura deja de estar acoplada a "Josanz Audiovisuales" como único consumidor (Single-Tenant) y se transforma en un **Ecosistema de Plugins (SaaS/SaaS Privado)**. El objetivo es estructurar el código base para poder crear y compilar CRMs para múltiples clientes o verticales extendiendo librerías funcionales (core) y sobreescribiéndolas paramétricamente, aislando datos y lógicas operativas entre ellos.

### Resumen Ejecutivo V2
- **Estructura Base:** Monorepo (Nx) orientado a un paradigma de Plataforma-como-Servicio, basado en "App Shells" y "Librerías de Plugins" (para Backend y Frontend).
- **Extensibilidad Radical:** Dependencia por Inyección (Angular & NestJS) permitiendo sustituir fachadas, validadores o controladores completos según la aplicación-cliente.
- **Tenencia y Datos:** Modelo de BBDD Multi-Tenant estricto (uso de `tenant_id` obligatorio mediante RLS - Row Level Security, o middleware de Prisma en todas las capas del ORM).

---

## 1. Validación y Riesgos Críticos V2

- **🟢 1.1 Multi-tenant 100% Definido:**
  El sistema será capaz de hospedar múltiples empresas aisladas en un mismo entorno de Base de Datos. Todas las tablas centrales (`users`, `clients`, `budgets`, etc.) requieren aislar sus lecturas/escrituras estrictamente por `tenant_id` en el JWT del contexto HTTP y RLS en BBDD para cero filtraciones de seguridad.
- **🟢 1.2 Módulos Inyectables:**
  Se define que ninguna funcionalidad es de propósito universal ("Todo el mundo usa Vehículos"). Todos son Plugins importables/no importables desde el `AppShell`.
- **🟢 1.3 Personalización por Cliente (Hooks de Lógica):**
  Descartar las sentencias del tipo `if (tenant === 'josanz') { }`. Todo flujo debe tener "Interfaces Abiertas" (`VerificadorGastosBase`) del cual hereda el `JosanzVerificadorGastos` que es inyectado en el `providers: []` de la App.

---

## 2. Estrategia Modular y Tecnológica (Nx App Shells)

La topología principal usa Nx para garantizar separación matemática:
- **`apps/<tenant>-frontend`** (Angular Host): Carece de lógica de negocio o componentes. Contiene rutas (`loadChildren`), Proveedores inyectados (`InjectionTokens`) para sobreescribir dependencias (Tokens visuales o fachadas).
- **`apps/<tenant>-api`** (NestJS Host): Carece de Controllers o Services pesados. Solo ensambla módulos inyectando los `providers` extendidos u opciones vía método forRoot (`MyPluginModule.forRoot({ options })`).

### ADR-002 V2 — Frontend Modular (Angular + Injection Tokens)
Se usará NgRx Signal Store como núcleo de estado de las *Libraries* distribuidas (Data Access).
Los clientes podrán tener UI modificada no editando el HTML base, sino pasando configuraciones o Plantillas (`*ngComponentOutlet`) que remplazan el diseño.

### ADR-003 V2 — Backend Extensible (NestJS Pluggable API)
El backend delega a los módulos (`libs/plugin-inventory/backend`) todo el peso. Si el Tenant C tiene un ERP simplificado y no quiere control de Flotas, el `AppModule` simplemente evitará incluir `FleetModule` en `imports: []`. Si por el contrario lo requiere, pero con lógicas especiales, inyectará un proveedor sobreescrito.

---

## 3. Modelo de Datos V2: Estructura Multi-Empresa

Se adapta el esquema `Prisma` con las siguientes estrategias vitales:
- **Aislamiento Multi-Tenant (Middleware):** Todo dominio (menos catálogos globales si aplica) añade relación con el `Tenant`. Cada consulta de Prisma DEBE inyectar como base restrictiva automática `where: { tenant_id }` desde el contexto del Request (ClsHooked/AsyncLocalStorage) para no fiar la seguridad al desarrollador en cada línea.

```prisma
// Esquema de núcleo V2
model Tenant {
  id      String    @id @default(uuid())
  code    String    @unique // ej. 'josanz', 'cliente_b'
  users   User[]
  budgets Budget[]
  // Settings y Themes configurables por Empresa en runtime
  theme   Json?
}

model User {
  id        String  @id @default(uuid())
  tenant_id String
  tenant    Tenant  @relation(fields: [tenant_id], references: [id])
}

model Budget {
  id        String  @id @default(uuid())
  tenant_id String
  // ...
}
```

---

## 4. Evolución del Continuous Integration & Deployment (SaaS)

El paradigma "Nx Affected" y los Pipelines se ajustan a V2:
1. Al modificar un **Plugin Base** (`libs/budget`), Nx detecta y compila TODAS las `apps/<tenant>` afectadas corriendo sus test E2E de forma aislada.
2. Posibilidad de hacer "Feature Toggling" (activación por banderas) directamente dentro del plugin por `tenant_id` si el cambio no justifica sobreescribir la inyección.
3. El CD (Continuous Deployment) se orquestará para empaquetar Docker Images únicas por `Tenant API` (o un API compartida si la escala prefiere un despliegue masivo en el mismo POD), y carpetas de estáticos únicas `dist/apps/clienteX-frontend` para servir mediante CDN individualizada.

---

## 5. Principio de OCP (Open-Closed Principle) Radical

Para que el modelo "Plantilla CRM Multi-cliente" sobreviva:
- **Cierre del Dominio Base:** El dominio de `Alquiler` no soporta modificaciones ad-hoc por "Cliente".
- **Apertura Estructural (DI):** Proveer inyectables (`@Injectable`) de Fábricas y Estrategias (`PriceStrategy`). La librería base proporciona un `StandardPriceStrategy`. El Tenant puede declarar su `CustomPriceStrategy` y sobreescribir la clase Standard en la fase de resolución de dependencias de Angular o NestJS.
- **Outbox Extensible:** Los eventos se persisten como "Domain Events". Si `Cliente Josanz` necesita conectar su ERP con Salesforce en la creación de Presupuestos, `BudgetModule` dispara el evento `BudgetCreated`. El tenant aloja su propio `SalesforceSyncerWorker` que escucha y responde de manera desacoplada.

## Resumen del Viaje (Hoja de Ruta de Transición)
1. **Paso 0:** Refactor Inmediato a Multi-Tenant (RLS Prisma, InjectionTokens estandarizados, Lazy Load limpio).
2. **Paso 1:** Reubicar features en carpetas `libs/plugins/` indicando un paradigma funcional exportable.
3. **Paso 2:** Píldora MVP construyendo `apps/josanz-api` demostrando que el núcleo corre sin lógica *hardcoded*.
4. **Paso 3:** Escalado para la construcción en masa de CRMs de nicho.
