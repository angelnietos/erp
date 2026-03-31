# 🏛️ Technical Architecture Blueprint V3: The Audiovisual SaaS Hub

## 0. Visión V3: El ERP como "Experiencia de Alta Fidelidad"
La evolución de la V3 trasciende la operativa funcional para centrarse en la **Diferenciación Estética y la Modularidad Vertical**. Josanz ERP ya no es solo una herramienta de gestión; es un **Hub Audiovisual** donde la interfaz reacciona dinámicamente a la identidad de marca (Branding) y donde cada funcionalidad nueva se despliega como un **Plug-and-Play SaaS Asset**.

### 🔑 Pilares de la V3
- **Premium Branding Engine:** Sistema de 10 motores de animación (Aurora, Matrix, Nebula, etc.) desacoplados del core y monetizables como "Visual Packs".
- **Vertical Feature Plugins:** Capacidad de empaquetar lógica sectorial (ej. Gestión de Plató, Logística de Equipamiento) en librerías Nx independientes que se activan bajo demanda ("Vertical Slopes").
- **Performance-First Design:** Uso intensivo de **Object Pooling** y optimización de Canvas para mantener 60FPS constantes en entornos corporativos de alta carga.
- **Multi-Tenant UI Composition:** El layout se compone dinámicamente basándose en el Perfil de Suscripción del Tenant, inyectando estilos y funcionalidades en runtime.

---

## 1. Arquitectura de Plugins: "Vertical Features as a Product"

En la V3, una "Feature" no es solo una carpeta; es un **Producto Vertical** que puede ser empaquetado, vendido y desplegado de forma aislada.

### 1.1 Estructura de un Plugin de Nx
Cada funcionalidad vertical (ej. Gestión de Presupuestos Avanzados, Analítica de Producción) sigue el patrón de **Librería Nx Aislada**:

```
libs/
 └── features-production-analytics/
      ├── data-access/  <-- NgRx Signal Store, API Services
      ├── ui/           <-- Componentes visuales atómicos (UI Kit)
      └── feature/      <-- Smart Components y RUTAS de pago
```

### 1.2 Activación Dinámica (Feature Toggling)
El `AuthStore` y el `ThemeService` actúan como orquestadores. Al iniciar sesión, el sistema detecta los "Assets" contratados:
1. El backend devuelve la lista de `permissions` y `features_enabled`.
2. El `App-Shell` utiliza **Guards de Angular** para habilitar o deshabilitar las rutas de los plugins cargados por `Lazy Loading`.
3. Si el usuario no tiene el "Pack Audiovisual", el selector de temas se oculta o se limita al "Classic".

---

## 2. Motor de Branding de Alta Fidelidad (Audiovisual Identity)

Hemos implementado un **Experience Engine** modular en `libs/identity/feature` y `libs/shared/ui-shell` que sirve como caso de estudio de cómo monetizar el estilo.

### 2.1 El Registro Centralizado de Temas (`ThemeConfigInternal`)
El sistema soporta 10 entornos visuales distintos sin duplicar código, gracias a un registro de configuraciones que inyecta parámetros en los motores de dibujo:
- **Motores de Renderizado:** Aurora (física de ondas), Matrix (flujo de caracteres), Nebula (nubes de partículas), Grid (perspectiva), Spot (escaneo radial), y Bokeh (desenfoque).
- **Consolidación de Efectos:** Los elementos como `Sparkles`, `LumenParticles` y `Rings` son compartidos y optimizados mediante **Object Pools** pre-inicializados para evitar el "Garbage Collection" durante la navegación.

### 2.2 Sincronización Global CRM
La V3 extiende esta identidad al interior del ERP (`CrmBackgroundComponent`). El fondo del CRM ya no es estático; muta según el estilo global contratado/seleccionado, creando un lenguaje visual coherente desde el Login hasta el Dashboard.

---

## 3. Escalabilidad y Rendimiento (Engineering Standards)

Para que un SaaS sea rentable, no solo debe ser bonito; debe ser **Performante y Mantenible**.

### 3.1 Object Pooling (Memoria Controlada)
Para las animaciones avanzadas, prohibimos la creación de objetos `new Object()` en el loop de animación.
- Los pools de partículas se crean una sola vez en `initAllElements()`.
- Se reutilizan estados de memoria inactivos (`active: false`) para nuevos efectos visuales.
- Esto asegura que el ERP pueda correr en portátiles de oficina sin sobrecalentar la CPU.

### 3.2 Los 3 Límites del Monorepo Nx (Boundary Enforcement)
Mantenemos la integridad estructural mediante reglas estrictas de `@nx/enforce-module-boundaries`:
1. **Unidireccionalidad:** Las librerías de `feature` importan de `data-access`, nunca al revés.
2. **Abstracción de UI:** Las features no usan CSS "ad-hoc"; consumen tokens del **UI Kit (ui-josanz)** para que un cambio en la marca de un cliente se propague a todos los plugins instantáneamente.
3. **Lazy-By-Default:** Ningún plugin se carga en el `main.bundle`. Todo lo que no sea "Core Identity" es un chunk separado que se sirve solo si el usuario paga por él.

---

## 4. Monetización y Crecimiento SaaS (Value-Add Vertical)

La arquitectura V3 está diseñada para facilitar la venta de:
- **Upgrades de Estilo:** Venta de "Visual Skins" (ej. El tema Matrix o el tema Nebula) como complementos estéticos para empresas de perfil tech.
- **Product Verticals:** El usuario base compra "Facturación", pero puede añadir "Gestión de Activos" o "Planificación de Plató" como plugins adicionales.
- **API-as-a-Product:** Gracias a la arquitectura hexagonal, el core del ERP puede exponerse como una API para que terceros construyan sus propias interfaces (Headless ERP).

---

> [!IMPORTANT]
> **V3 Architect's Note:** El éxito de esta arquitectura reside en tratar cada línea de código visual con el mismo rigor que la lógica de negocio fiscal. Un ERP que emociona visualmente y funciona modularmente es un producto que retiene al cliente y permite escalabilidad económica infinita.
