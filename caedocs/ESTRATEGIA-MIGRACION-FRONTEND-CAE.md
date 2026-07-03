# ESTRATEGIA DE MODERNIZACIÓN FRONTEND — PLATAFORMA CAE

## Migración incremental React → Angular mediante microfrontends (Strangler Fig)

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0 |
| **Estado** | Documento de referencia |
| **Fecha** | 03/07/2026 |
| **Proyecto** | Plataforma CAE v2.0 — Evolución frontend + Capa IA |
| **Clasificación** | Confidencial — IDEAUTO / Babooni |
| **Documentos relacionados** | [`ESPECIFICACION-FUNCIONAL-v3.0.md`](ESPECIFICACION-FUNCIONAL-v3.0.md), [`DISENO-TECNICO-v3.0.md`](DISENO-TECNICO-v3.0.md), [`ARQUITECTURA-CAE-IA.md`](ARQUITECTURA-CAE-IA.md) |

---

## Histórico de revisiones

| Rev. | Fecha | Naturaleza del cambio |
|------|-------|------------------------|
| 1 | 03/07/2026 | Primera versión: estrategia Strangler Fig, evolución React→Angular, relación con capa IA |
| 2 | 03/07/2026 | Tono orientado a documentación de entrega; eliminación de lenguaje interno |

---

## Índice de contenidos

1. [Contexto y oportunidad de mejora](#1-contexto-y-oportunidad-de-mejora)
2. [Propuesta estratégica](#2-propuesta-estratégica)
3. [Patrón Strangler Fig con microfrontends](#3-patrón-strangler-fig-con-microfrontends)
4. [Angular vs React — criterios de selección](#4-angular-vs-react--criterios-de-selección)
5. [Ventajas del enfoque incremental](#5-ventajas-del-enfoque-incremental)
6. [Costes, riesgos e inconvenientes](#6-costes-riesgos-e-inconvenientes)
7. [Criterios de aplicabilidad](#7-criterios-de-aplicabilidad)
8. [Fases de migración](#8-fases-de-migración)
9. [Relación con el proyecto de Asistencia IA](#9-relación-con-el-proyecto-de-asistencia-ia)
10. [Gobernanza, métricas y criterios de éxito](#10-gobernanza-métricas-y-criterios-de-éxito)
11. [Beneficios y encaje estratégico](#11-beneficios-y-encaje-estratégico)
12. [Visión final](#12-visión-final)

---

## 1. Contexto y oportunidad de mejora

### 1.1 Situación actual

La **Plataforma CAE v2.0** está construida en **React**. Con el crecimiento funcional del producto se han identificado **oportunidades de mejora** en mantenibilidad, consistencia de experiencia, estandarización entre equipos y capacidad de evolución del frontend:

- **Acoplamiento entre módulos** — dificulta cambios localizados.
- **Heterogeneidad de patrones** — distintas librerías y enfoques (routing, estado, formularios, validación).
- **Coste creciente de cambio** — nuevas funcionalidades impactan zonas no relacionadas.
- **Cobertura de pruebas mejorable** — el monolito frontend dificulta regresiones automatizadas.

> La oportunidad no reside en sustituir React de forma abrupta, sino en **evolucionar la plataforma de forma incremental**, aprovechando el proyecto de Asistencia IA como primer hito de modernización arquitectónica.

### 1.2 Enfoque acordado y evolución propuesta

| | Enfoque |
|---|---------|
| **Integración Fase 1 (acordada)** | Capa IA integrada en **CAE v2 (React)** mediante microfrontends — continuidad operativa |
| **Programa de mejora** | Asistencia IA + **modernización progresiva** de la plataforma CAE |
| **Horizonte de evolución** | **Angular** como stack para módulos nuevos y reescrituras; convivencia temporal con React hasta consolidación |

---

## 2. Propuesta estratégica

### 2.1 Idea central

**Incluir como mejora de la plataforma CAE** un modelo arquitectónico alineado con monorepo Nx, libs hexagonales y microfrontends:

1. **Hoy:** el host CAE v2 **React** sigue operando; la capa IA se integra por slots (MFE).
2. **Mañana:** **todo módulo nuevo** se desarrolla en **Angular** e integra en el shell React vía Module Federation.
3. **Progresivamente:** los módulos React actuales se **reescriben en Angular** cuando el coste/beneficio lo justifique.
4. **Objetivo final:** el shell React **desaparece**; CAE queda unificado en **Angular** (o host Angular con remotes Angular).

```mermaid
flowchart LR
    subgraph HOY["Hoy"]
        REACT["CAE v2 React (actual)"]
    end

    subgraph TRANS["Transición"]
        REACT2["React ↓ reduciéndose"]
        ANG["Angular ↑ creciendo"]
        REACT2 <-->|Microfrontends| ANG
    end

    subgraph META["Objetivo"]
        CAE["CAE Angular unificado"]
    end

    HOY --> TRANS --> META

    style REACT fill:#ffebee,stroke:#c62828
    style ANG fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style CAE fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
```

### 2.2 Principios de la estrategia

| ID | Principio | Descripción |
|----|-----------|-------------|
| EM-01 | **No big bang** | Nunca reescribir CAE completo de una vez |
| EM-02 | **Angular greenfield** | Módulos nuevos siempre en Angular |
| EM-03 | **React estable en Fase 1** | CAE v2 React en operación; nuevas capacidades grandes priorizan Angular |
| EM-04 | **Misma integración** | Contrato MFE versionado (slots, eventos, auth) independiente del framework |
| EM-05 | **Libs first** | Dominio y backend en `libs/isomorphic` y `libs/node`; UI en `libs/angular/cae` y `libs/react/cae` |
| EM-06 | **Medir para migrar** | Sustituir módulo React cuando ROI, riesgo y dependencias lo avalen |
| EM-07 | **Transparencia** | Costes y plazos del período dual stack explicitados desde el inicio |

---

## 3. Patrón Strangler Fig con microfrontends

La estrategia sigue el patrón **Strangler Fig**: el sistema nuevo crece alrededor del existente hasta sustituirlo progresivamente.

![Evolución Strangler Fig](diagrams/08-strangler-migracion.png)

| Elemento | Rol |
|--------|-----|
| **Host React (transitorio)** | Shell CAE v2; carga remotes por Module Federation |
| **Remote Angular** | Módulos nuevos: IA, Operaciones mejoradas, backoffice, etc. |
| **Remote React (Fase 1 IA)** | Integración acordada de la capa IA en CAE v2 |
| **Contrato de slot** | `expedienteId`, auth JWT, callbacks — idéntico para ambos stacks |
| **Design system compartido** | Tokens visuales comunes para que la UX no “salte” entre frameworks |

```mermaid
flowchart TB
    subgraph HOST["Host CAE — React (transitorio)"]
        ROUTER["Router / layout CAE v2"]
        SLOT_A["Slot módulo A — React"]
        SLOT_B["Slot módulo B — Angular remote"]
        SLOT_IA["Slot Asistencia IA — Angular remote"]
        ROUTER --> SLOT_A & SLOT_B & SLOT_IA
    end

    subgraph REMOTES["Remotes Angular (creciendo)"]
        M1["feature-expediente-v2"]
        M2["feature-assistant"]
        M3["feature-operaciones"]
    end

    SLOT_B & SLOT_IA --> M1 & M2 & M3
    M1 & M2 & M3 --> API["cae-ia-backend + Core CAE API"]

    style HOST fill:#fff9c4,stroke:#f9a825
    style REMOTES fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

---

## 4. Angular vs React — criterios de selección

### 4.1 Por qué Angular encaja en CAE (proyecto enterprise grande)

| Ventaja Angular | Aplicación en CAE |
|-----------------|-------------------|
| **Arquitectura definida** | Todos los equipos organizan proyectos de forma similar (módulos, servicios, componentes) |
| **Baterías incluidas** | Routing, DI, HTTP, formularios, validación — menos decisiones ad hoc |
| **Estandarización** | Decenas de desarrolladores pueden seguir las mismas convenciones |
| **TypeScript first-class** | Mantenimiento a largo plazo en ERP/administración |
| **Testing integrado** | Karma/Jest, TestBed, herramientas oficiales para E2E (Cypress/Playwright) |
| **Precedente sector** | Banca, administración pública, ERPs internos — perfil similar a CAE |

Por estas razones, **muchas organizaciones grandes** siguen apostando por Angular en aplicaciones con vida útil de muchos años y equipos numerosos.

### 4.2 Fortalezas de React

| Ventaja React | Aplicación en CAE v2 |
|---------------|----------------------|
| Integración nativa | Host actual de CAE v2; adopción inmediata en Fase 1 |
| Flexibilidad | Permite evolución rápida con convenciones bien definidas |
| Ecosistema | Amplia disponibilidad de librerías y perfiles |
| Continuidad | Sin interrupción del servicio durante despliegue IA |

> **Conclusión:** React es el **stack acordado para la Fase 1** (integración IA en CAE v2). Angular se propone como **stack de evolución** para módulos nuevos y modernización, cuando el beneficio en estandarización, mantenibilidad y productividad supere el coste de la convivencia temporal de ambos ecosistemas.

---

## 5. Ventajas del enfoque incremental

| Ventaja | Descripción |
|---------|-------------|
| **Sin parada de negocio** | CAE sigue operando durante toda la transición |
| **Riesgo acotado** | Cada módulo migrado es un entregable independiente |
| **Valor temprano** | IA y mejoras visibles antes de reescribir todo |
| **Equipos en paralelo** | Mantenimiento CAE v2 React y desarrollo Angular en módulos nuevos |
| **Aprendizaje progresivo** | Module Federation, contratos y design system se afianzan módulo a módulo |
| **Mejora estructurada** | Plan de evolución de plataforma, no parches aislados |

---

## 6. Costes, riesgos e inconvenientes

Durante la transición (potencialmente **varios años**) coexistirán:

| Inconveniente | Mitigación |
|---------------|------------|
| **Dos frameworks** | Gobernanza clara: reglas de qué va en cada stack |
| **Dos pipelines CI/CD** | Monorepo Nx unifica build; targets por app |
| **Dos formas de trabajar** | Guías de arquitectura, Storybook, formación Angular |
| **Dos ecosistemas de dependencias** | Renovación automatizada; política de versiones shared |
| **Mayor peso en navegador** | Lazy loading remotes; no cargar Angular + React en misma ruta si no es necesario |
| **Complejidad MFE** | Auth centralizada, contrato de eventos, design tokens, semver remotes |
| **Período dual stack** | Presupuesto y roadmap explícitos; no indefinido |

> Los microfrontends implican complejidad adicional. El enfoque incremental evita un *big bang* y permite validar cada módulo antes de consolidar la plataforma en Angular.

---

## 7. Criterios de aplicabilidad

### 7.1 La estrategia es adecuada cuando…

| Condición | CAE |
|-----------|-----|
| El producto tiene **vida útil prolongada** | CAE es core de negocio IDEAUTO |
| **Varios equipos** evolucionan la plataforma en paralelo | Desarrollo continuo CAE + capa IA |
| Existe **arquitectura MFE** definida (contratos, auth, design system) | Documentada en diseño técnico v3.0 |
| Se busca **mejora de plataforma** junto con la capa IA | Programa integrado IA + modernización |
| Se requiere **estandarización** y mantenibilidad a largo plazo | Angular como stack de evolución |

### 7.2 Requiere replanteamiento cuando…

| Condición | Notas |
|-----------|-------|
| No hay presupuesto para **período dual stack** | Acordar fases y duración máxima de convivencia |
| Capacidad limitada para Angular | Valorar formación o refuerzo de equipo |
| Migración sin ROI demostrable | Priorizar módulos con mayor impacto en negocio |

---

## 8. Fases de migración

| Fase | Horizonte | CAE v2 React (actual) | Angular | Entregables clave |
|------|-----------|----------------------|---------|-------------------|
| **0 — Baseline** | Actual | 100% CAE | Pendiente de arranque | Análisis de arquitectura, mapa módulos, contrato MFE |
| **1 — IA integrada** | 0–6 meses | Host estable | MFE IA React (Fase 1) + Angular (evolución) | `cae-ia-backend`, paneles asistencia, slots |
| **2 — Nuevos módulos** | 6–18 meses | Sin features grandes nuevas | Todo greenfield en Angular | Primer módulo negocio nuevo en Angular embebido |
| **3 — Sustitución** | 18–36+ meses | Módulos retirados uno a uno | Reescrituras priorizadas por ROI | Matriz módulo → fecha retirada React |
| **4 — Consolidación** | Objetivo | **0% shell React** | Host Angular unificado | CAE completo en Angular; React desmantelado |

### 8.1 Criterios para migrar un módulo React concreto

| Criterio | Peso |
|----------|------|
| Volumen de incidencias en el módulo | Alto |
| Complejidad y acoplamiento | Alto |
| Frecuencia de cambios previstos | Medio |
| Dependencias con otros módulos React | Medio (orden de migración) |
| Disponibilidad de diseño/UX revisado | Medio |
| Equipo con capacidad Angular | Bloqueante |

---

## 9. Relación con el proyecto de Asistencia IA

La capa IA **no es un silo**: es el **primer candidato** para demostrar el modelo de modernización.

| Aspecto | Enfoque |
|---------|---------|
| **Backend** | Agnóstico de UI — `libs/node/cae`, `libs/isomorphic/cae` |
| **MFE React (Fase 1)** | Integración acordada de la capa IA en el host CAE v2 |
| **MFE Angular (evolución)** | Misma funcionalidad con arquitectura estandarizada: Storybook, tests, libs modulares |
| **Segundo módulo Angular** | Cola Operaciones mejorada, dashboard MLOps o expediente v2 |
| **Valor conjunto** | La capa IA incluye un **plan de mejora de plataforma**, no únicamente capacidades OCR |

```mermaid
flowchart LR
    IA["Proyecto IA CAE"] --> MFE["Microfrontends"]
    MFE --> STRAT["Estrategia Strangler"]
    STRAT --> CAE["CAE modernizado Angular"]

    style IA fill:#f3e5f5,stroke:#7b1fa2
    style STRAT fill:#fff9c4,stroke:#f9a825
    style CAE fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

---

## 10. Gobernanza, métricas y criterios de éxito

### 10.1 Comité de arquitectura frontend

- Revisión mensual: módulos candidatos a migración, estado dual stack, oportunidades de mejora.
- Participantes: Arquitectura, Producto, IDEAUTO, Babooni.

### 10.2 Métricas de seguimiento

| Métrica | Objetivo transición |
|---------|---------------------|
| % líneas UI en Angular vs React | Crecimiento trimestral Angular |
| Nº módulos React activos | Decrecimiento planificado |
| Incidencias frontend por módulo | ↓ post-migración Angular |
| Tiempo medio entrega feature | ↓ en módulos Angular estandarizados |
| Cobertura tests + Storybook | ↑ en `libs/angular/cae/ui` |
| Peso bundle remotes | Monitorizado; alertas si supera umbral |
| Satisfacción de usuario (encuesta) | ↑ respecto a línea base |

### 10.3 Criterio de cierre React

React se considera **retirado** cuando:

1. Ningún módulo de negocio crítico depende del shell React actual.
2. E2E completos pasan en host Angular.
3. UAT de paridad funcional aprobada.
4. Período de hypercare post-switch sin incidencias P1.

---

## 11. Beneficios y encaje estratégico

### 11.1 Beneficios para la plataforma CAE

1. **Continuidad operativa** — CAE sigue en producción durante toda la transición; mejoras por módulos.
2. **Valor inmediato con IA** — Validación progresiva, MLOps y asistencia al usuario desde la Fase 1.
3. **Estandarización progresiva** — Angular aporta arquitectura uniforme en módulos nuevos.
4. **Inversión protegida** — React permanece en Fase 1; la migración avanza cuando aporta valor medible.
5. **Plan estructurado** — Roadmap por fases con métricas, gobernanza y criterios de éxito.

### 11.2 Preguntas frecuentes

| Pregunta | Respuesta |
|----------|-----------|
| ¿Por qué dos stacks (React y Angular)? | React integra la Fase 1 en CAE v2; Angular es el stack de evolución para módulos nuevos |
| ¿Implica parar la plataforma? | No. Migración incremental mediante microfrontends |
| ¿Cuánto dura la convivencia dual? | Acotada por fases; se revisa trimestralmente en comité de arquitectura |
| ¿Se puede mantener solo React? | Fase 1 sí; la evolución Angular es opcional y se activa por módulo según ROI |

---

## 12. Visión final

La Plataforma CAE evoluciona hacia un **ecosistema modular en Angular**, construido módulo a módulo mediante **microfrontends**, sin interrumpir el negocio.

El proyecto de **Asistencia Inteligente** es el **primer hito** del programa: entrega valor inmediato (validación progresiva, MLOps, fitness) y establece el patrón arquitectónico (libs Nx, hexagonal, MFE, Storybook, pirámide de testing) para la modernización progresiva de CAE.

> **Resumen:** *Fase 1 en React (integración acordada con CAE v2); evolución en Angular para módulos nuevos; microfrontends como puente; consolidación progresiva cuando cada módulo lo justifique.*

---

*Estrategia de Modernización Frontend — Plataforma CAE.*
