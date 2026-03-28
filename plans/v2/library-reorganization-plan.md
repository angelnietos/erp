# 🧩 Plan de Reorganización de Librerías y Bounded Contexts

Este documento rige la distribución matemática de las carpetas dentro del Monorepo Nx. El cumplimiento de esta estructura es obligatorio para evitar el acoplamiento y asegurar que cualquier Junior pueda crear nuevos módulos de forma intuitiva.

---

## 1. Topología del Monorepo Nx (Estructura de Carpetas)

El paradigma principal es dividir "Aplicaciones" (Shells) de "Librerías" (Plugins).

### 🖥️ `apps/` (Ensambladores / App Shells)
Solo contienen configuración de despliegue, inyección de tokens globales y enrutadores proxy.
```text
apps/
 ├── backend/               # AppShell Global API (Monolito aglutinador)
 │    ├── src/main.ts
 │    └── src/app.module.ts # Vacío de lógica: Solo importa Plugins (ClsModule, BudgetBackendModule...)
 │
 ├── frontend/              # AppShell Global Angular
 │    ├── src/main.ts
 │    └── src/app.routes.ts # Carga Lazy-Loads de librerías shell
 │
 └── clienteX-frontend/     # (Futuro) AppShell generada para Cliente Específico
```

### 📚 `libs/` (Ecosistema de Módulos Reutilizables)

Cada dominio de negocio o Bounded Context es una carpeta raíz que se subdivide en responsabilidades físicas estrictas.

---

## 2. Anatomía de un Dominio de Negocio (Ejemplo: `inventory`)

Un dominio correcto tiene exactamente estas 5 sublibrerías:

```text
libs/inventory/
 ├── domain/                 # 🟩 (Typescript Puro)
 │    └── src/
 │         ├── interfaces/ (IProduct, IInventoryItem)
 │         ├── dtos/       (CreateProduct.dto)
 │         └── index.ts    # Todos los módulos consumen esto para conocer los tipos
 │
 ├── backend/                # 🟦 (NestJS)
 │    └── src/
 │         ├── controllers/
 │         ├── services/
 │         ├── inventory-backend.module.ts
 │         └── index.ts
 │
 ├── data-access/            # 🟧 (Angular Estado y Servicios)
 │    └── src/
 │         ├── services/   (InventoryApiService via HttpClient)
 │         ├── facades/    (InventoryFacade con Signals)
 │         └── index.ts    # Expone TODO a la capa feature
 │
 ├── feature/                # 🟥 (Angular Smart Components)
 │    └── src/
 │         ├── product-list/ (Smart Component con INVENTORY_FEATURE_CONFIG)
 │         ├── product-detail/
 │         └── index.ts    # Expone las Rutas Internas de Feature
 │
 └── shell/                  # 🟨 (Angular Lazy Loading Router)
      └── src/
           └── inventory.routes.ts # Provee los componentes de Feature
```

---

## 3. Capa Transversal: `shared` e `infrastructure`

El código que no pertenece a ningún dominio y se consume transversalmente vive en la carpeta Shared.

```text
libs/
 ├── shared/
 │    ├── data-access/         # 🟧 PrismaService central, AuthGenérico JWT
 │    └── ui-kit/              # 🟥 Componentes Tontos (Botones, Tablas, Modales, Navbars)
 │
 └── shared-infrastructure/    # 🟦 Filtros Globales de Excepciones NestJS, Middlewares (TenantMiddleware), Outbox Publishers genéricos.
```

---

## 4. Leyes Inquebrantables de Dependencia (Module Boundaries)

Configuradas mediante `@nx/enforce-module-boundaries` en el linter `eslint.config.js`:

1. ✅ **`backend` puede importar de `domain` y `shared/data-access` (Prisma).**
2. ❌ **`backend` NUNCA puede importar `frontend` o `ui-kit`.**
3. ❌ **`feature` NUNCA puede inyectar directamente a la Base de Datos ni Prisma.** Importa **ÚNICAMENTE** de `data-access` (y por supuesto `domain` y `ui-kit`).
4. ✅ **`shell` (Librería de Routings) DEBE cargar dinámicamente (`loadChildren`) las features.**
5. ❌ **Un Dominio NUNCA importa otro Dominio.** Un controlador de `delivery/backend` jamás debe inyectar `BudgetService` importándolo de `budget/backend`. Debe comunicarse a través de contratos expuestos en la BD compartida (Prisma Schema Unificado) o comunicarse de forma asíncrona mediante mensajes de Eventos (Domain Events).

Esta organización convierte el código *Spaghetti* en un puzzle Lego perfecto.