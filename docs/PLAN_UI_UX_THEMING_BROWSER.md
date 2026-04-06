# Plan — UI/UX, theming profundo y acciones en `libs/browser`

Objetivo: que el **aspecto y la forma** de la interfaz **cambien de verdad** al cambiar de tema (no solo el color de acento), unificar calidad visual en **todas las features** bajo `libs/browser`, y cerrar **botones y acciones vacías** (siempre navegación, API o feedback).

Este documento es el **plan maestro** previo a ejecutar mejoras; convive con [BACKLOG.md](./BACKLOG.md) (producto/backend) y puede alimentarse de sus ítems de UX.

---

## 1. Alcance

| Incluido | Fuera de alcance (por ahora) |
|----------|------------------------------|
| `libs/browser/feature/**` (dashboard, clientes, eventos, proyectos, servicios, reportes, auditoría, recibos, presupuestos, alquileres, inventario, entregas, flota, facturación, Verifactu, identidad, ajustes) | Apps shell sueltas fuera de `libs/browser` salvo lo necesario para tokens globales |
| `libs/browser/shared/ui-kit/**` | Rediseño de marca corporativa externa (solo guías) |
| `libs/browser/shared/data-access/**` (coherencia con toasts/estado si aplica) | Cambios de API backend |
| `libs/browser/shared/ui-shell/**` (layout, sidebar, selector de tema) | Nuevos módulos de negocio |

---

## 2. Principios de diseño

1. **Tema = sistema**, no solo paleta: cada tema o variante debe poder alterar **tipografía efectiva**, **radios**, **sombras**, **bordes**, **densidad**, **estilo de tarjeta/botón** y **patrón de fondo**, dentro de límites accesibles (contraste WCAG AA donde sea posible).
2. **Un solo origen de verdad**: tokens expuestos como **CSS variables** (`--radius-md`, `--font-ui`, `--shadow-card`, `--density-padding`, etc.) derivados de `ThemeService` / configuración de tema.
3. **Componentes primero**: las features consumen **ui-kit** y clases utilitarias; se evita duplicar bloques de “glass / solid” en cada feature.
4. **Acción siempre significativa**: ningún botón o enlace principal sin **destino** (ruta, `HttpClient`, diálogo o toast de “no disponible” explícito).

---

## 3. Estado actual (breve)

- `ThemeService` (`libs/browser/shared/data-access`) ya define por tema: colores, `bgStyle` (aurora, matrix, nebula, …) y **`uiVariant`** (`glass` | `solid` | `flat` | `neumorphic` | `minimal`).
- En la práctica, muchas pantallas **solo enlazan `--primary`** o colores puntuales; **`uiVariant` y `bgStyle` están infrautilizados** en componentes de feature.
- Algunas acciones pueden quedar **sin feedback** o sin comportamiento claro (deuda alineada con [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)).

---

## 4. Fase A — Sistema de tokens y variante visual

### A.1 Ampliar `ThemeConfig`

Añadir (o mapear desde el tema) propiedades explícitas, por ejemplo:

- **Forma**: `--radius-sm|md|lg`, `--border-width`, `--card-style` (enum coherente con `uiVariant`).
- **Tipografía**: familia UI, escala de tamaños de título/cuerpo/label (puede ser CSS variables que apunten a `var(--font-main)` existente o nuevas).
- **Elevación**: `--shadow-sm|md|lg`, `--glow-intensity` (ligado a `brandGlow`).
- **Densidad**: `--space-unit` o clases `compact | comfortable` por tema.
- **Motion**: duración/opacidad de transiciones (opcional, `prefers-reduced-motion`).

### A.2 Aplicación en `ThemeService`

- Al cambiar tema, además de colores, **inyectar en `document.documentElement`** las nuevas variables de forma y tipografía.
- Documentar en comentarios o en este plan la **matriz tema → tokens** (p. ej. `minimal` + `flat` = sin blur, bordes finos; `glass` + `nebula` = blur + sombras suaves).

### A.3 `shared-ui-kit`

- Revisar **botones, cards, inputs, tablas, badges** para que lean **variables de forma** (radio, sombra) y **variante** (`uiVariant`) donde tenga sentido.
- Evitar valores mágicos repetidos (`12px`, `1.5rem`) sustituyéndolos por tokens.

**Criterio de aceptación A:** Cambiar de un tema “glass” a uno “minimal” produce **cambio visible** en bordes/sombras/tipografía sin tocar cada feature a mano.

---

## 5. Fase B — Shell y fondo

- **App layout / sidebar** (`shared-ui-shell`): que respete tokens de densidad y variante (ancho, separación, iconografía).
- **Fondos animados / hero** (p. ej. login, dashboard): acoplar **`bgStyle`** del tema a un conjunto **acotado** de implementaciones (performance en `highPerformanceMode` del `PluginStore`).
- Modo alto rendimiento: **degradar** blur/partículas según flag ya existente.

**Criterio de aceptación B:** Al cambiar tema, el **fondo y el marco** de la app reflejan `bgStyle` + variante, no solo el color primario.

---

## 6. Fase C — Auditoría por feature (orden sugerido)

Para cada módulo bajo `libs/browser/feature/*`:

1. **Inventario de pantallas** (lista, detalle, formularios).
2. **Lista de acciones** (botones, enlaces, menús): ¿navegan, llaman API o muestran feedback?
3. **Sustituir estilos locales** por tokens + componentes ui-kit.
4. **Homogeneizar**: cabeceras de página, breadcrumbs, tablas, estados vacíos, errores de carga.

**Orden recomendado** (impacto + flujo usuario):

1. Dashboard  
2. Identidad / login (primera impresión)  
3. Clientes, proyectos, eventos  
4. Presupuestos, facturación, recibos  
5. Inventario, alquileres, entregas, flota  
6. Reportes, auditoría  
7. Servicios, Verifactu, ajustes  

**Criterio de aceptación C (por feature):** Lista de acciones cerrada; estilos alineados a tokens; estados vacío/carga/error visibles y coherentes.

---

## 7. Fase D — Acciones y microcopy

- **Botón sin handler**: implementar comportamiento o ocultar hasta que exista.
- **Placeholder “próximamente”**: sustituir por toast + deshabilitado con tooltip o enlazar a doc interna.
- **Feedback mínimo**: servicio de **toast/snackbar** compartido (si no existe unificado, añadirlo en data-access o ui-kit).
- Textos: revisar **mayúsculas / tono** (misma convención por tipo de pantalla: títulos vs botones).

---

## 8. Fase E — Calidad y regresiones

- **Contraste** en temas claros/oscuros y temas “gaming”.
- **Teclado y foco** visible en botones y tablas.
- **Bundle / CSS**: donde un componente supere budget de estilos, **extraer** a hojas compartidas o simplificar (alineado con avisos de build del frontend).
- **Pruebas visuales** (opcional): screenshots por tema en Playwright o manual checklist antes de release.

---

## 9. Entregables

| Entregable | Descripción |
|------------|-------------|
| Tokens documentados | Tabla tema → variables en este plan o en `USER_GUIDE` (sección tema) |
| ui-kit actualizado | Componentes base sensibles a forma + variante |
| Features auditadas | Checklist por carpeta en issue tracker o tabla en anexo a este doc |
| Guía “acciones” | Patrón: loading / éxito / error para mutaciones HTTP |

---

## 10. Riesgos

- **Sobrecarga visual** en temas con muchos efectos → respetar `highPerformanceMode` y `prefers-reduced-motion`.
- **Regresiones de contraste** en temas saturados → revisión manual rápida por tema tras cambios globales.
- **Alcance infinito** → cerrar Fases A–B antes de abrir todas las features en paralelo.

---

## 11. Relación con otros documentos

- Tras ejecutar este plan, actualizar [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) (línea de tema/tokens) y tachar ítems relacionados en [BACKLOG.md](./BACKLOG.md).
- No sustituye mejoras de producto/backend del backlog; **prioriza experiencia y coherencia visual**.

---

## 12. Checklist de arranque (siguiente paso operativo)

- [ ] Aprobar lista de tokens nuevos (nombre + responsable).
- [ ] Implementar Fase A en `ThemeService` + variables globales en estilos raíz del frontend.
- [ ] Actualizar 2 componentes ui-kit piloto (Button + Card) y **una** feature piloto (Dashboard) como referencia.
- [ ] Replicar patrón al resto de features según orden de la Fase C.

---

*Versión 1.0 — plan previo a implementación; los PRs concretos pueden dividirse por fase o por feature.*
