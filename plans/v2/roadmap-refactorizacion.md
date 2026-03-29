# 🚨 Máster Roadmap V2: Refactorización y Escalado (El Checklist Definitivo)

Esta es la carta de navegación secuencial y matemática para transformar el ecosistema en el ERP SaaS Multi-Tenant perfecto. **Tacha cada subtarea a medida que los comites de Git se fusionan.**

---

## 🧱 FASE 1: La Fortaleza Transaccional (Multi-Tenant & Aislamiento Backend)
La base de datos y la recolección HTTP deben impedir cruzamiento de datos de forma sistemática y pasiva.

- [x] **1.1 Mutación Estructural Prisma Core:** Modificar `schema.prisma` agregando la relación `@relation()` hacia el gran modelo `Tenant` en todos los modelos puros (`User`, `Client`, `Product`, `Budget`, `DeliveryNote`).
- [x] **1.2 Generación Múltiple Exclusiva:** Actualizar directivas de unicidad para proteger emails (`@@unique([tenantId, email])`). Reflejar cambios compilando `$ npx prisma generate`.
- [x] **1.3 ClsHooked Context Backend:** Instalar y aplicar `nestjs-cls`. Construir el `TenantMiddleware` global en `AppModule` que lee `x-tenant-id` en cada petición e incrusta el tenant en el Thread de memoria.
- [x] **1.4 Evolución Prisma Extensions:** Migración de `$use` (Middleware obsoleto) a la API moderna de Prisma 7 (`$extends`). Implementado aislamiento automático de Tenant mediante un **Extension Proxy** que inyecta `tenantId` en todos los modelos puros de forma transparente.
- [x] **1.5 Restricción de Contexto HTTP (Controllers):** Validar y forzar error 401 Unauthorized usando un Guard global `TenantGuard` portador de metadatos `@PublicTenant()` para exclusiones (ej. Login).

> **ESTADO DE FASE 1:** Ejecutada 100% y Blindada HTTP/BBDD ✅ (Pendiente la sincronización física de BBDD local por parte del Humano `npm run db:reset`).

---

## 💻 FASE 2: Frontend Extensible (De Monolito a Ángular Plugins)
Cada ventana deja de ser rígidamente programada para convertirse en interfaces que aceptan plantillas (IOC).

- [x] **2.1 Tokenización Módulo Clients:** Refactoring Component, Extracción Auth a InjectionTokens y Creación de Facade usando Signals.
- [x] **2.2 Tokenización Módulo Budget:** Extracción Lógica y Facades.
- [x] **2.3 Tokenización Módulo Delivery:** Reconfiguración Total y Fixer de la firma Typescript `DeliveryListClass`.
- [x] **2.4 Estandarizar Módulo Inventory:** Extracción idéntica del componente `inventory-list`, generación de `INVENTORY_FEATURE_CONFIG` genérico y su SignalStore en la librería de acceso de datos (`data-access`).
- [x] **2.5 Estandarizar Módulo Billing:** Aislar configuraciones fiscales, crear de la Fachada y blindar la asincronía sin RXJS en el smart component front.

> **ESTADO DE FASE 2:** 100% Completada 🟢.

---

## 🪚 FASE 3: Anatomía de Librerías (Extirpación del Backend NestJS)
El peor anti-patrón actual es el `apps/backend/src/app` masivo. Debemos desguazar el monolito transladándolo hacia dominios puros NestJS en `libs/`.

- [x] **3.1 Generación Múltiple Nest Libs:** 
  Las librerías backend de plugin ya estaban generadas por Nx.
- [x] **3.2 Migración Topológica (Controladores y Servicios):**
  Desplazamiento exitoso. Los controladores `.controller.ts` y servicios fueron purgados de `apps/backend` hacia el `src/lib/` de cada una de sus nuevas librerías backend de plugin.
- [x] **3.3 Acoplamiento Dinámico en Plugins:**
  *(Avanzado: Completado en todos los 8 módulos trasladados).*
  Dentro de cada librería backend, se escribió la inyección formal de OCP usando `static forRoot(): DynamicModule` con `providers` y configuraciones dinámicas.
- [x] **3.4 Limpieza del Kernel:** 
  El `AppModule` ahora inyecta puramente Módulos-Plugin listos para arrancar con un array limpio (usando las namespaces de `@josanz-erp/*`).
- [x] **3.5 Purgación Global TSC/Lint:** 
  Resolución total de errores de compilación y linting post-refactor (tsconfig inheritance, empty interfaces fix, decorator signatures). El backend es ahora 100% compilable y modular.

> **ESTADO DE FASE 3:** 100% Completada y Compilable 🟢.

---

## 🚂 FASE 4: Arquitectura del Despliegue Configurable (App Shells en Masivo)
Con el código modularizado, ahora Nx se destina a compilar en masa.

- [ ] **4.1 Creación de App Shells Custom:** Instanciar con comandos NX la aplicación `clienteX-frontend` vacía configurando su `app.routes.ts` para ingerir plugins lazy-loaded de las Librerías Frontend creadas en la Fase 2 pasándoles Tokens personalizados.
- [ ] **4.2 Outbox Patter para Servicios Críticos:** 
  Aislar integraciones frágiles. Ejemplo: Migrar todo el envío automático de XML de Verifactu desde el Controller síncrono, a Inserción Transaccional en BBDD + Microservicio Worker que gasta los eventos generados (Resilience OCP).
- [ ] **4.3 Dockerización de Alto Margen:** Parametrizar Dockerfile multietapa genérico de Node.js donde la variable de entorno determine qué "App" Nx va a compilarse estáticamente, ahorrando tener N repositorios o archivos docker separados.
- [ ] **4.4 Configuración Actions (Nx Affected):** Poner en marcha Github/Gitlab CI Pipelines usando el analizador AST de Nx affected para que si tocamos `libs/budget/frontend`, Nx reconstruya automáticamente y pase las pruebas unitarias SOLAMENTE al `frontend` de los Clientes que hayan incluido el módulo de Presupuestos.

> **ESTADO DE FASE 4:** Pendiente ⬛.
