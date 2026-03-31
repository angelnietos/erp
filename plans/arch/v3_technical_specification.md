# 🛠️ Josanz ERP Tech-Spec V3: Modular Monolith & SaaS Infrastructure

## 1. Topología del Monorepo (Nx Workspace)
El sistema utiliza un **Monorepo gestionado por Nx**, optimizado para el despliegue de múltiples aplicaciones (*Apps*) que consumen una base compartida de librerías (*Libs*).

### 1.1 Estructura de Directorios
```bash
apps/
  ├── frontend-erp/       # Single Page Application (SPA) principal
  ├── backend-api/        # API Gateway y Core funcional (NestJS)
  └── [tenant]-custom/    # Aplicaciones personalizadas para clientes específicos
libs/
  ├── shared/             # Utilidades, UI-Kit y Data-Access global
  ├── identity/           # Autenticación, RBAC y Branding Engine
  ├── inventory/          # Dominio de Inventario (Plugin)
  ├── budgets/            # Dominio de Presupuestos (Plugin)
  └── [feature]/          # Nuevos productos verticales
```

---

## 2. Arquitectura Frontend (Angular High-Fidelity)

### 2.1 Descomposición de Librerías (Niveles)
Cada dominio funcional se divide en 4 capas para asegurar el desacoplamiento total:
1.  **`feature-*`**: Componentes "Smart" con lógica de rutas, Lazy Loading y conexión al estado.
2.  **`ui-*`**: Componentes "Dumb" (Preséntacionales) que reciben `@Input` y emiten `@Output`. Prohibido inyectar servicios aquí.
3.  **`data-access-*`**: Gestión de estado mediante **Angular Signals** y servicios HTTP. Implementa el patrón *Facade* para exponer solo lo necesario a las features.
4.  **`utils-*`**: Funciones puras, validadores y constantes.

### 2.2 Branding & Animation Engine (Object Pooling)
Para garantizar 60FPS en las animaciones de fondo (`AnimatedBackgroundComponent`):
- **Memoria Estática:** Se inicializan pools de objetos (`particles[]`, `lumens[]`) al arrancar el componente para evitar el *Garbage Collection Stutter*.
- **Canvas Rendering Cycle:** El `requestAnimationFrame` procesa únicamente los motores de dibujo activos según el `bgStyle` inyectado por el `ThemeService`.

---

## 3. Arquitectura Backend (NestJS Hexagonal)

El backend sigue un patrón de **Modular Monolith** con aislamiento estricto por dominios, preparándolo para una futura migración a microservicios si fuera necesario.

### 3.1 Capas de Dominio (Hexagonal)
1.  **Capa de Dominio:** Interfaces puras, modelos Prisma y lógica de negocio agnóstica al framework.
2.  **Capa de Aplicación:** Casos de uso y servicios NestJS. Gestionan la orquestación pero no los detalles de persistencia.
3.  **Capa de Infraestructura:** Implementaciones de adaptadores (Prisma, Repositorios, Clientes de API externa).

### 3.2 Aislamiento Multi-Tenant (Security First)
Implementamos el aislamiento mediante **`nestjs-cls` (Continuation Local Storage)**:
- **Interceptor de Tenant:** Captura el `tenant_id` del JWT/Header.
- **Prisma Extension:** Todas las consultas a DB son interceptadas automáticamente por un middleware que aplica un filtro `WHERE tenantId = :current_tenant_id`, garantizando que un cliente jamás acceda a datos de otro por error de programación.

---

## 4. Sistema de Plugins y Extensibilidad SaaS

### 4.1 Inyección de Funcionalidad Vertical
El Josanz ERP permite la creación de **Productos Verticales** mediante librerías Nx que se inyectan en el `AppModule` principal:
- **Plugins de Pago:** Funcionalidades avanzadas (ej. `AdvancedReportingModule`) se cargan dinámicamente.
- **Service Decoration:** Se pueden extender servicios base mediante el patrón *Decorator* sin modificar el core.

### 4.2 Comunicación Inter-Módulos (Transactional Outbox)
Para evitar el acoplamiento fuerte entre módulos (ej. que Presupuestos dependa de Facturación):
1.  El módulo emisor guarda un evento en la tabla `Outbox` dentro de la **misma transacción atómica** de negocio.
2.  Un proceso de fondo (*Worker*) emite el evento mediante un **EventEmitter** interno o un bus de mensajes (Redis/Kafka).
3.  El módulo receptor escucha y reacciona de forma asíncrona.

---

## 5. Estrategia de Despliegue y CI/CD
- **Nx Affected:** El pipeline solo compila y testea las librerías modificadas en cada PR, reduciendo los tiempos de build en un 60-80%.
- **Docker Multi-Stage:** Generación de imágenes ligeras optimizadas para producción.

---

> [!NOTE]
> **Technical Conclusion:** Esta arquitectura V3 prioriza la **Composibilidad**. Cada pieza del sistema es un bloque de construcción intercambiable, permitiendo que Josanz ERP escale de manera eficiente como un SaaS Multi-País y Multi-Industria.
