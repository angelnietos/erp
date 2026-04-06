# Por qué Angular (y cuándo tendría sentido otra cosa) — Josanz ERP

**Versión del documento:** 1.0  
**Ámbito:** Justificación de la elección de **Angular** como framework del frontend en este monorepo (frente a React, Vue u otros), alineada con el tipo de producto (ERP multi-tenant, equipos, mantenimiento a largo plazo).

**Documentos relacionados**

| Documento | Relación |
|-----------|----------|
| [LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md](./LIBRO_BLANCO_ARQUITECTURA_ESCALABILIDAD.md) | Arquitectura global, capas `feature` / `ui-kit` / `shell` |
| [PLAN_UI_UX_THEMING_BROWSER.md](./PLAN_UI_UX_THEMING_BROWSER.md) | Theming y evolución de la capa browser |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Estado funcional por módulo |

---

## 1. Contexto de la decisión

Josanz ERP no es una landing ni un panel mínimo: es un **producto empresarial** con **muchos formularios**, **listados**, **flujos largos**, **autenticación**, **multi-tenant** y **evolución durante años**. En ese contexto, el framework del frontend debe aportar no solo velocidad el primer mes, sino **previsibilidad**, **escala de equipo** y **coste de mantenimiento** a medio plazo.

Angular se eligió como **marco completo y opinado**: trae decisiones ya tomadas (estructura, inyección de dependencias, routing, formularios, compilación, i18n) en lugar de obligar al equipo a ensamblar un “stack React” distinto en cada proyecto.

---

## 2. Comparativa breve (qué ofrece cada enfoque)

| Criterio | Angular | React (ecosistema típico) | Vue (ecosistema típico) |
|----------|---------|---------------------------|-------------------------|
| **Modelo mental** | Framework completo: app modular con convenciones | Biblioteca UI + librerías elegidas por el equipo | Framework progresivo, curva suele ser suave |
| **TypeScript** | Primer ciudadano desde el diseño del framework | Muy usado, pero sin modelo único oficial | Muy buen soporte TS en Vue 3 |
| **Estado / reactividad** | Signals, RxJS, zone.js (y opciones de hidratación/SSR según versión) | useState, stores externos (Redux, Zustand, etc.) | Reactivity API, Pinia, etc. |
| **Formularios complejos** | Reactive Forms / Validators integrados | React Hook Form, Formik, validación manual | Composables + librerías de formulario |
| **Routing** | Router oficial, lazy loading, guards | React Router u otros | Vue Router oficial |
| **Inyección de dependencias** | DI nativo (servicios singleton, testing) | Patrones con contexto / contenedores propios | provide/inject, composición |
| **CLI y tooling** | Angular CLI + integración Nx | Vite/CRA/Next + elecciones por proyecto | Vite + tooling del equipo |
| **Opinión del framework** | Alta (menos debates de arquitectura base) | Baja (más libertad, más decisiones recurrentes) | Media |

Ninguna fila “gana” en abstracto: **gana la que encaja con el producto y el equipo**. Para un ERP mantenido por varias personas durante años, la columna de Angular suele reducir **variabilidad** y **deuda de decisiones**.

---

## 3. Ventajas de Angular para Josanz ERP (y para equipos similares)

### 3.1. Productividad en aplicaciones “de gestión”

Los ERPs viven de **pantallas repetibles**: tablas, filtros, diálogos, asistentes, permisos por rol. Angular ofrece, sin salir del ecosistema oficial:

- **Formularios reactivos** con validación sincrónica y asíncrona, estados `touched`/`dirty`, y composición de controles.
- **Router** con **lazy loading** de módulos o rutas, alineado con el patrón **shell + features** que ya usáis en el monorepo.
- **Guards** e **interceptores HTTP** como piezas estándar para auth, tenant (`x-tenant-id`) y manejo de errores.

Menos tiempo debatiendo “qué librería usamos para X” y más tiempo en **dominio y UX**.

### 3.2. Arquitectura escalable por equipos

Angular premia **módulos o agrupaciones claras**, **servicios inyectables** y **límites entre capas**. Eso encaja con:

- **`libs/browser/shared/ui-kit`**: componentes presentacionales.
- **`libs/browser/feature/*`**: orquestación, estado, llamadas a `data-access`.
- **`libs/browser/shared/data-access`**: HTTP y estado compartido.

La **inyección de dependencias** facilita tests (sustituir `HttpClient` o servicios por dobles) y evita acoplar la UI a implementaciones concretas.

### 3.3. TypeScript de extremo a extremo

El código del dominio isomórfico y los DTOs compartidos (`libs/isomorphic/api`) ya son TypeScript. Angular mantiene **tipado fuerte en plantillas** (según configuración y versiones) y un modelo de componentes coherente, lo que reduce errores en refactorizaciones grandes típicas de un ERP.

### 3.4. Evolución del framework sin reescribir la filosofía

Angular ha incorporado **Signals** y un camino claro hacia **menos magia implícita** donde tiene sentido, sin obligar a tirar aplicaciones enteras. Para un producto con horizonte largo, importa que exista **hoja de ruta** y **guías de migración** publicadas por el equipo del framework.

### 3.5. Ecosistema enterprise e integración con Nx

En monorepos Nx, Angular es un **ciudadano de primera clase**: generadores, lint, pruebas y afectación por grafo encajan con el flujo de trabajo del repo. Eso reduce fricción entre **apps** y **libs** frente a setups 100% custom.

### 3.6. Accesibilidad, i18n y estándares web

Angular incluye herramientas y patrones para **i18n** y buenas prácticas de **accesibilidad** en componentes; en productos que deben cumplir expectativas de clientes B2B, tener un camino oficial reduce riesgo.

---

## 4. React (y similares): fortalezas reales y por qué no fue el eje aquí

**Fortalezas habituales de React:**

- Enorme ecosistema de librerías y empleo.
- Flexibilidad máxima para experimentar patrones de UI.
- Next.js u otros meta-frameworks muy maduros para sitios y apps híbridas con fuerte foco SEO.

**Costes típicos en un ERP:**

- Más **decisiones arquitectónicas recurrentes** (estado, datos remotos, formularios, convenciones de carpetas).
- Riesgo de **fragmentación** entre equipos o módulos si no hay disciplina estricta (equivalente a definir vuestro propio “mini-Angular” internamente).

Para Josanz ERP, la prioridad es **consistencia entre features** y **integración limpia con Nx y librerías compartidas**; Angular encaja ese perfil con menos superficie de decisión.

---

## 5. Vue, Svelte y otros

- **Vue:** excelente equilibrio simplicidad/poder; en organizaciones muy grandes a veces pesa menos “estándar de industria” que React/Angular según región y hiring — no es un defecto técnico, es **contexto de mercado**.
- **Svelte / Solid / otros:** muy competentes para muchas UIs; en un ERP grande, el factor limitante suele ser **patrones de equipo, testing y contratos** más que el algoritmo de actualización del DOM.

La elección de Angular aquí es **estratégica para producto y mantenimiento**, no una valoración de que otras herramientas sean “peores”.

---

## 6. Cómo se relaciona con la arquitectura del repo

Aunque Angular sea el framework, **la lógica de negocio crítica no queda atrapada en componentes**:

- Contratos y reglas compartidas pueden vivir en **`libs/isomorphic`**.
- El frontend se organiza en **smart/dumb** (ver libro blanco), de modo que un cambio de librería de tablas o temas no arrastra reglas de negocio.

Eso mitiga uno de los riesgos históricos de cualquier framework: **acoplar todo al ciclo de vida de la vista**.

---

## 7. Conclusión

**Angular es una apuesta por framework completo, tipado y convenciones claras**, optimizada para aplicaciones empresariales con muchos flujos, formularios y años de evolución. Frente a React (máxima libertad) u otros enfoques, reduce la **varianza arquitectónica** entre módulos y encaja de forma natural con **Nx** y con la separación **feature / ui-kit / shell** de Josanz ERP.

**Mensaje clave:** no se trata de “la tecnología de moda”, sino de **predecibilidad y coste total de propiedad** para un ERP multi-tenant que debe crecer con el negocio.

---

## 8. Evolución de este documento

- Actualizar la **versión** y esta sección cuando cambie el stack principal del frontend o se documente SSR/hidratación en producción.
- Si el equipo adopta políticas nuevas (p. ej. reglas estrictas de estado global), enlazarlas aquí para mantener alineada la “historia” de la decisión.
