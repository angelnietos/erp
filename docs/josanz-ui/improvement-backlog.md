# Josanz UI — Backlog de mejoras (iteración continua)

Documento de subtareas para seguir ampliando el design system y Storybook en `libs/browser/shared/josanz-ui`.

**Validación habitual:** `pnpm exec nx run josanz-ui:build-storybook:ci`  
**Rama de despliegue Storybook:** `storybook-deploy` → Railway `josanz-ui-storybook`

---

## Leyenda

| Estado | Significado |
|--------|-------------|
| ✅ | Hecho en repo |
| 🔄 | En curso / parcial |
| ⬜ | Pendiente |

---

## Fase A — Componentes base (formularios y datos)

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| A1 | `josanz-form-field` + validation-message | ✅ | Story: Forms / Field Wrapper |
| A2 | `josanz-data-grid` (búsqueda, sort, select all, loading) | ✅ | Story dedicada + showcase |
| A3 | `josanz-data-table` sort real + `sortChange` | ✅ | |
| A4 | `josanz-number-input` / `password-input` | ✅ | |
| A5 | `josanz-date-picker` standalone | ✅ | Story: Date Picker |
| A6 | `josanz-otp-input` | ✅ | Story: OTP Input |
| A7 | `josanz-search-field` genérico | ✅ | Story: Search Field |
| A8 | Formulario reactivo ejemplo (FormGroup + form-field) | ✅ | Story Forms / Reactive Example |
| A9 | `josanz-phone-input` con prefijo país | ✅ | CVA + story |
| A10 | `josanz-currency-input` con sufijo EUR | ✅ | CVA + story |
| A11 | CVA en textarea / date-picker / password | ✅ | `JosanzValueAccessorBase` |
| A12 | CVA en number-input / chip-input | ✅ | Integrado con `formControlName` |
| A13 | CVA en select / checkbox / switch | ✅ | Reactive Example ampliado |
| A14 | `password-input` indicador de fortaleza | ✅ | `showStrength` |
| A15 | CVA en multi-select | ✅ | spec + reactive story |

---

## Fase B — Overlay, navegación y layout

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| B1 | popover, dropdown-menu, tag, chip-input | ✅ | |
| B2 | card, list-item, progress-steps, inline-alert | ✅ | |
| B3 | Navbar / Tree View / Context Menu stories | ✅ | |
| B4 | `josanz-flex` en layout-primitives | ✅ | selector `josanz-flex` |
| B5 | Cerrar popover/menú al click fuera (HostListener) | ✅ | popover, dropdown, context-menu |
| B6 | `josanz-breadcrumb-nav` con RouterLink opcional | ✅ | Story dedicada |
| B7 | Bottom sheet + drawer: backdrop, Escape, `openChange` | ✅ | bottom-sheet stories + drawer Escape |
| B9 | `josanz-confirm-dialog` | ✅ | Story + export |
| B10 | Command palette `openChange` + dismiss | ✅ | backdrop, Escape, cierra al seleccionar |
| B8 | Modal focus trap y Escape | ✅ | trapFocus, Tab, Escape, backdrop |
| B11 | Drawer focus trap (paridad modal) | ✅ | `trapFocus`, Tab cycle, FocusTrap story |

---

## Fase C — Feedback, media y editor

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| C1 | Stories: tooltip, divider, slider, spinner | ✅ | |
| C2 | `josanz-inline-alert` | ✅ | |
| C3 | Rich text: toolbar ampliada + `format` interno | ✅ | underline, removeFormat |
| C4 | Rich text story dedicada + play | ✅ | |
| C5 | Video/audio player stories dedicadas | ✅ | Media Player |
| C6 | Toast queue + auto-dismiss configurable | ✅ | `autoDismiss`, acciones, persistentes |
| C7 | Skeleton variants en tablas y cards | ✅ | `list` y `table` |

---

## Fase D — Datos avanzados y dashboards

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| D1 | Charts CSS (bar/donut) | ✅ | |
| D2 | Kanban básico | ✅ | |
| D3 | Paginación server-side story (mock) | ✅ | Data Grid / ServerSidePagination |
| D4 | Data grid: export CSV | ✅ | Botón Exportar CSV |
| D4b | Data grid: column resize | ✅ | `resizable`, `columnWidths`, `columnWidthsChange` |
| D4c | Data grid: skeleton loading (`loadingSkeleton`) | ✅ | Usa `josanz-skeleton` variant table |
| D5 | Tree view: checkbox multi-select | ✅ | checkable + checkedIds |
| D6 | Integración charting lib (opcional, lazy) | ⬜ | Evaluar peso bundle |

---

## Fase E — Storybook y documentación

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| E1 | Component Catalog (índice) | ✅ | Documentacion / Component Catalog |
| E2 | Component Showcase suites | ✅ | Varias escenas compuestas |
| E3 | `play` en stories críticas (forms, grid, command) | ✅ | forms, grid, command, context, layout, spinner |
| E4 | Matriz Chromatic / Visual Regression | ✅ | En showcase |
| E5 | MDX por categoría (Forms, Data, Layout) | ✅ | + Overlays, Feedback |
| E6 | Props table autodocs 100% componentes exportados | ✅ | argTypes reforzados en legacy shells, grid, forms y overlays |
| E7 | Stories robustas 1:1 por export | ✅ | Playground + variantes + play en críticos |

---

## Fase F — Calidad y consumo en ERP

| ID | Subtarea | Estado | Notas |
|----|----------|--------|-------|
| F1 | Exportar todo en `src/index.ts` | 🔄 | Revisar tras cada lote; Flex exportado vía layout-primitives |
| F2 | Unit tests smoke (selectores, outputs) | ✅ | specs legacy corregidos + nuevos CVA/grid |
| F3 | Usar componentes en `josanz-web-app` piloto | ✅ | `/export` con card + button |
| F4 | Tokens Figma ↔ theme.service alineados | ⬜ | |
| F5 | Modo oscuro en todos los componentes nuevos | ⬜ | Probar atmosphere dark |

---

## Iteración recomendada (próximos 3 PRs)

### PR-1 — Formularios
- A5, A6, A8, A9  
- E3 plays en form-field y date-picker  

### PR-2 — Datos y tablas
- A10, D3, D4, D5  
- data-table select all en cabecera  

### PR-3 — Polish y a11y
- B5–B8, C6, F2  
- MDX categoría Forms (E5)  

---

## Checklist antes de merge a `storybook-deploy`

- [ ] `build-storybook:ci` verde  
- [ ] Sin errores de lint en archivos tocados  
- [ ] Nuevos componentes en `index.ts`  
- [ ] Story mínima (Playground o Suite) por componente nuevo  
- [ ] Showcase actualizado si el componente es “hero” de producto  

---

*Última actualización: iteración Storybook robusto — stories dedicadas, MDX categorías, multi-select CVA, drawer focus trap, piloto /export.*

---

## Inventario Storybook (exports públicos)

| Categoría | Cobertura |
|-----------|-----------|
| Formularios | Stories dedicadas: textarea, select, checkbox, switch, radio, password, chip, multi-select, autocomplete, file-upload + suites |
| Datos | data-table, data-grid, accordion, timeline, chart, kanban + suites |
| Overlays | modal, drawer, bottom-sheet, confirm-dialog, popover, dropdown, context-menu, tooltip, command-palette |
| Layout | layout-primitives, main-* layouts, sidebar, navbar, breadcrumbs |
| Feedback | alert, inline-alert, toast, spinner, skeleton, progress-bar, rich-text, media-player |
| Polish | tag, list-item, segmented-control, rating, color-picker, copy-button, keyboard-shortcut, FAB |

**Patrón mínimo por story:** `Playground` + variantes/estados + `play()` en interacciones críticas.
