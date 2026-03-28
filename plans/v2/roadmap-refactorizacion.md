# 🚀 Roadmap de Refactorización V2: Transición a Plataforma Multi-Tenant (Plugins)

Este documento es una **guía paso a paso (Checklist)** para transformar el código base actual en un sistema 100% modular, Multi-Tenant y asilado mediante inyección de dependencias. 

Usaremos este plan para ir ejecutando y validando las mejoras "una por una".

---

## 🛠️ FASE 1: Cimientación del Dominio y BBDD (Multi-Tenant Core)
El objetivo es aislar la base de datos y la seguridad sin tocar la estructura actual de carpetas todavía.

- [ ] **1.1. Actualización del Prisma Schema:**
  - Crear modelo `Tenant` (con configuración de estilos y marca de agua JSON).
  - Añadir columna obligatoria `tenantId` a todos los modelos centrales (`User`, `Client`, `Budget`, `DeliveryNote`, `Invoice`, etc.).
  - Configurar las migraciones de Prisma.
- [ ] **1.2. Aislamiento por Contexto en NestJS (Backend):**
  - Implementar un interceptor/middleware global usando `nestjs-cls` (AsyncLocalStorage).
  - Extraer dinámicamente el `tenantId` del JWT o Subdominio (Header) e inyectarlo en el contexto de ejecución.
  - Modificar el Repositorio Base (o PrismaService) para que *automáticamente* haga `where: { tenantId }` en cada query, asegurando 0% riesgo de filtración sin esfuerzo.
- [ ] **1.3. Aislamiento Frontend (Angular):**
  - Configurar `HttpInterceptor` para mandar cabeceras dinámicas de `X-Tenant-Id`.
  - Crear un servicio estricto `AuthTenantService` que mantenga en contexto en qué "Tenant" estamos logueados.

---

## 📦 FASE 2: Estratificación de Nx (De Monolito a "Plugins")
Separar los actuales `libs/` en una estructura predecible de *App Shells* y *Librerías Plugin*.

- [ ] **2.1. Limpieza del App Shell (Backend & Frontend):**
  - Vaciar `apps/backend/src`. Solo debe quedar el `main.ts` y un `AppModule` vacío.
  - Vaciar `apps/frontend/src`. Solo debe quedar `app.routes.ts` (Lazy loads puros).
- [ ] **2.2. Estandarización de `shared-infrastructure`:**
  - Depurar los módulos compartidos (Events, Email, Storage, Prisma). Convertirlos en el "Kernel" global a prueba de errores.
- [ ] **2.3. Refactor Funcional 1: Identity / Usuarios:**
  - Aislar `domain/`, `backend/`, y `frontend/` (`api`, `data-access`, `feature`, `shell`).
  - Asegurar que NO llama directamente a `clients` u otro dominio.
- [ ] **2.4. Refactor Funcional 2: Clients (CRM):**
  - Transformarlo en Plugin inyectable.
- [ ] **2.5. Refactor Funcional 3: Inventory & Rentals:**
  - Desacoplar las dependencias cruzadas. Inventario provee la disponibilidad, Rentals lo consume.
- [ ] **2.6. Refactor Funcional 4: Budgets (Presupuestos):**
  - Extraer toda la lógica estática y reemplazar por `Injectables`.
- [ ] **2.7. Refactor Funcional 5: Delivery & Billing (Facturación):**
  - Aislar los eventos (Verifactu) mediante Outbox adaptando el código existente.

---

## 🧩 FASE 3: Flexibilidad vía Componentes Inyectables (DI y OCP)
Eliminar variables de configuración quemadas en código (hardcoded) para que los Plugins puedan ser personalizados por Cliente.

- [ ] **3.1. Angular Injection Tokens:**
  - Identificar configuraciones rígidas en tablas (columnas) o componentes y abstraer a `InjectionTokens` (ej. `THEME_COLORS`, `BUDGET_PDF_TEMPLATE`).
- [ ] **3.2. Facades Dinámicos en Frontend:**
  - Asegurar que la UI de cada Feature usa un Facade (Abstracción). Proveer el Facade defecto de la librería base para que un Cliente pueda inyectar y sobreescribir métodos si lo necesita.
- [ ] **3.3. Servicios Sobrescribibles en NestJS:**
  - Usar patrones abstractos. `export abstract class InvoiceCalculator` y proveerlo en el Module. Cada tenant podrá inyectar su variación en la compilación de su API.

---

## 🏗️ FASE 4: Ensamblaje de Nuevos CRMs (Tenants)
Convertir el monorepo en un "Creador de ERPs".

- [ ] **4.1. Instanciación Josanz ERP (Tenant Orgánico):**
  - Renombrar las `apps` a `apps/josanz-frontend` y `apps/josanz-api`.
  - Conectar e importar todos sus plugins requeridos en el `AppModule` y `routes`.
- [ ] **4.2. Instanciación Cliente Pruebas (Demo Tenant):**
  - Crear desde cero un `apps/demo-frontend` y `apps/demo-api` importando SOLAMENTE Clientes, Facturación y Presupuestos (prescindiendo de la lógica de Almacén físico y Entregas).
  - Validar y testear visualmente la separación.
- [ ] **4.3. Scripts de Generación Nx (Opcional):**
  - Crear un Generador (Nx Workspace Plugin) parametrizado: `npx nx workspace-generator tenant mi-crm` que prepare instantáneamente el App Shell y el tipado.

---

## 🚀 FASE 5: Despliegue Estático y Multiverso CI/CD
Optimizar DevOps para alojar clientes baratos, fiables y modulares.

- [ ] **5.1. Dockerfiles Inteligentes (Backend):**
  - Unificar un Dockerfile que reciba como Argumento `appName`. Permite usar 1 mismo repo pero compilar el Backend del Cliente que necesites.
- [ ] **5.2. Empaquetado Frontend con Assets Dinámicos:**
  - Generar builds estáticos optimizados (`dist/apps/cliente-X`). Inyectar variables de entorno en runtime para logotipos, imágenes y URLs de backend.
- [ ] **5.3. Pipeline Recreativo (Github Actions/Gitlab CI):**
  - Automatizar con "Nx Affected" para que los pipelines no tarden horas evaluando Tenants cuyo código base no fue impactado en el commit.

---

*Cualquier desarrollo a partir de ahora debe encajar y tachar las partes de esta lista. ¿Por cuál subtarea deseas empezar? Recomendación absoluta empezar por **1.1 y 1.2** para asegurar los pilares de base de datos.*
