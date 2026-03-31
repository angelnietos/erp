# 🛠️ Josanz ERP Tech-Spec V3: Real-World Architecture & SaaS Foundation

Este documento describe la arquitectura **actualmente implementada** en el ecosistema Josanz ERP, reflejando fielmente la estructura de directorios y la modularidad del workspace Nx.

---

## 1. Topología del Workspace: "Modular Monolith with Micro-Services"

El proyecto se gestiona como un Monorepo de Nx con una hibridación de **Monolito Modular** para el core y **Microservicios Especializados** para tareas críticas de cumplimiento.

### 1.1 Directorio `apps/` (Runtime Targets)
- **`frontend`**: Aplicación Angular principal (CRM).
- **`backend`**: Núcleo API basado en NestJS que orquesta los dominios de la empresa.
- **`verifactu-api` & `verifactu-worker`**: Microservicios desacoplados para la integración con la AEAT. El `worker` procesa la cola de eventos asíncronos para evitar latencia en la UI.
- **`frontend-e2e`**: Suite de pruebas Cypress para validación de flujos instrumentales.

### 1.2 Directorio `libs/` (Functional Building Blocks)
Las librerías se organizan por **Dominio de Negocio** y, dentro de cada una, por **Responsabilidad Técnica**:

| Dominio | Capas Implementadas (`libs/[domain]/*`) |
| :--- | :--- |
| **`identity`** | `feature`, `data-access`, `backend`, `shell`, `core`, `api` |
| **`inventory`** | `feature`, `data-access`, `backend`, `ui`, `core`, `api` |
| **`budget`** | `feature`, `data-access`, `backend`, `core` |
| **`billing`** | Contiene la lógica transaccional de facturación y firma. |
| **`verifactu`** | Librería compartida para el cumplimiento normativo fiscal. |

---

## 2. El Ciclo de Vida de los Plugins (Vertical SaaS)

La modularidad de Josanz ERP permite que dominios como `rentals`, `fleet` o `delivery` actúen como plugins lógicos.

### 2.1 Descomposición Multi-Capa (Frontend)
- **`feature`**: Smart Components (ej. `InventoryListComponent`) integrados con Signals.
- **`data-access`**: Implementación de Store/Signals y servicios `HttpClient` especializados.
- **`shell`**: Punto de entrada que agrupa rutas perezosas (Lazy-Loading) del dominio.
- **`shared/ui-kit`**: Sistema de diseño atómico (Storybook). Componentes de marca (Alertas, Inputs, Botones) que aseguran coherencia visual en todos los plugins.

### 2.2 Descomposición Domain-Driven (Backend)
- **`backend`**: Controladores, servicios y proveedores de persistencia (Repositories) encapsulados por dominio.
- **`core`**: Lógica de negocio pura e interfaces agnósticas (POJOs/Interfaces).
- **`api`**: DTOs y tipos exportados para que el `frontend` o otros servicios puedan hablar con el dominio de forma segura.

---

## 3. Infraestructura y Comunicación (Cross-Cutting)

### 3.1 `shared-infrastructure` & `shared/cqrs`
El sistema utiliza un bus de eventos y patrones CQRS para desacoplar módulos backend. 
- Cuando un **Presupuesto** (`budget`) se aprueba, emite un evento que el dominio de **Facturación** (`billing`) captura para generar el documento, sin que `Budget` conozca de la existencia de `Billing`.

### 3.2 `shared/ui-shell` (CRM Experience)
Contiene los componentes de infra-estructura visual del ERP:
- **`crm-background`**: El motor de animaciones de alta fidelidad sincronizado con el `ThemeService`.
- **`navbar` / `sidebar`**: Navegación dinámica basada en los estados del `AuthStore`.

---

## 4. Estándares Técnicos Implementados
1.  **State Management**: Uso nativo de **Angular Signals** y `signalStore` (NgRx) para reactividad de alto rendimiento.
2.  **Persistence**: Prisma ORM con esquemas modulares para evitar el acoplamiento directo entre tablas de distintos dominios.
3.  **Tenancy**: Inyección automática de `tenant_id` mediante contextos asíncronos en NestJS (`nestjs-cls`).

---

## 5. Estrategias de Monetización y Escalado Vertical
La modularidad técnica habilita directamente las siguientes líneas de negocio:
1.  **SaaS Tiers**: Activación selectiva de librerías `feature` (ej: el módulo `fleet` solo se activa en planes "Premium").
2.  **Branding Packs**: Inyección dinámica de configuraciones en `AnimatedBackgroundComponent` para vender experiencias visuales personalizadas.
3.  **Verticalization**: Reutilización de librerías `core` y `data-access` para crear versiones sectoriales del ERP en tiempo récord.

---

## 6. Storybook & Testing de Aislamiento
El desarrollo de UI se realiza en **Storybook** para:
- **Testeo de Regresión Visual**: Asegurar que cambios en componentes compartidos no rompan interfaces dependientes.
- **Mocking de Datos**: Simular comportamientos de la API sin necesidad de levantar servicios Backend.
- **Entorno de Laboratorio**: Desarrollo de componentes atómicos en aislamiento total de la lógica de negocio.

---

## 7. Infraestructura AI-Ready
Diseño preparado para la integración de una IA generativa de código interna:
- **Determinismo Estructural**: La estructura fija de carpetas permite que la IA localice y genere código coherente (Feature -> Data-Access -> Core).
- **Consumo de UI-Kit**: La IA puede "componer" pantallas nuevas usando exclusivamente el catálogo de Storybook, manteniendo la identidad visual intacta.
- **Modularidad Total**: Facilita que la IA cree "Plugins" enteros que se auto-registran en el sistema mediante inyección de dependencias.

---

> [!IMPORTANT]
> **Real-World Enforcement:** La estructura actual permite que el equipo de desarrollo cree una nueva funcionalidad vertical simplemente ejecutando `nx g @nx/angular:library libs/new-feature/feature`, manteniendo el aislamiento total y la capacidad de monetizar esa librería como un asset independiente del SaaS.
