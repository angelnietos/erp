# Document Generator — Roadmap «Siguiente nivel»

Épica para sustituir el textarea por un editor WYSIWYG por bloques (TipTap/ProseMirror), con importación Word/PDF y exportación DOCX real, manteniendo paridad con el pipeline unificado de preview/PDF (`DocumentExportOrchestratorService`).

## Estado actual (baseline)

| Capacidad | Estado |
|-----------|--------|
| Preview/PDF WYSIWYG | ✅ Pipeline unificado (`fullExportHtml` + Playwright) |
| Editor | Textarea MD/HTML/plain + slash commands + undo string **+ toggle Visual (TipTap MVP)** |
| Import | MD/TXT/HTML ✅ · Word/PDF ✅ (mammoth + pdfjs) · Excel stub |
| Export | MD/HTML/PDF/TXT/XLSX ✅ · **DOCX ✅** (mismo HTML que preview) |
| BlockEngineService | Existe, no conectado al editor principal |

---

## Fase 1 — Modelo y arquitectura (1–2 semanas)

### 1.1 Modelo de documento
- [ ] Definir `DocumentContentModel`: `{ editorMode, proseMirrorJson?, html?, markdown?, plain? }`
- [ ] Extender `DocumentPersistedPayload` (IndexedDB) con `proseMirrorDoc` y `editorSurface: 'legacy' | 'blocks'`
- [ ] Migración al cargar borradores antiguos (solo `content` string → inferir modo)

### 1.2 Librería / carpeta del editor
- [x] `libs/browser/feature/document-generator/src/lib/block-editor/` (TipTap)
- [x] `document-block-editor.component.ts` — host TipTap
- [x] `document-block-serializer.service.ts` — JSON ↔ HTML ↔ Markdown
- [ ] Conectar `BlockEngineService` como capa opcional de historial por bloques

### 1.3 Integración render
- [x] `DocumentRenderInput.content` acepta HTML generado desde TipTap sin pérdida
- [x] CSS corporativo aplicado en export y preview (tokens existentes)
- [ ] Tests: HTML TipTap → mismo `bodyHtml` en preview y export

---

## Fase 2 — Editor TipTap WYSIWYG (2–3 semanas)

### 2.1 Extensiones base
- [x] `@tiptap/starter-kit` (headings, lists, bold, italic, strike, code, blockquote, hr)
- [x] `@tiptap/extension-placeholder`
- [x] `@tiptap/extension-link`, `@tiptap/extension-image`
- [x] `@tiptap/extension-text-align`
- [x] `@tiptap/extension-underline`

### 2.2 Tablas en editor
- [x] `@tiptap/extension-table` + row/cell/header (insert 3×3 MVP)
- [ ] Toolbar: añadir fila/columna, fusionar (fase 2b)
- [ ] Paridad visual tabla editor ↔ preview ↔ PDF

### 2.3 UX bloques
- [ ] Slash menu TipTap (`/` suggestion extension) — reutilizar catálogo actual
- [ ] Bubble menu (negrita, enlace, color)
- [ ] Drag handle bloques (`@tiptap/extension-drag-handle` o custom)
- [ ] Undo/redo nativo ProseMirror (reemplaza historial string en modo blocks)

### 2.4 Toggle en pantalla de edición
- [x] Conmutador «Código» ↔ «Editor visual» en canvas del editor
- [x] Al cambiar a visual: MD/plain → HTML vía serializer existente
- [ ] Fullscreen con editor visual (hoy solo textarea en fullscreen)
- [ ] Assistant IA operativo en modo visual (insertar resultado en TipTap)

---

## Fase 3 — Import / Export Office (1–2 semanas)

### 3.1 Import Word (.docx) — `WordImportService` (mammoth)
- [x] mammoth → HTML + delegación en `UniversalDocumentService`
- [x] Import abre editor visual automáticamente
- [ ] Preservar imágenes embebidas (base64) con revisión de estilos
- [ ] Warnings UI persistente (toast) además del texto bajo Importar

### 3.2 Import PDF — `PdfImportService` (pdfjs-dist)
- [x] Extracción texto por página → HTML párrafos
- [x] Import abre editor visual
- [ ] Detección básica de headings (heurística tamaño/línea)
- [ ] OCR fuera de alcance v1 (documentado en warnings)
- [ ] Configurar worker pdfjs en assets Angular si falla en prod

### 3.3 Export DOCX — `DocxExportService` (docx)
- [x] Export desde HTML del orchestrator (paridad preview)
- [x] Botón DOCX en barra export
- [ ] Mapeo imágenes inline
- [ ] Portada PDF Pro como sección inicial opcional

### 3.4 UniversalDocumentService
- [x] Delegar Word/PDF/DOCX a servicios especializados
- [ ] Excel import real (sheetjs — fase posterior)
- [ ] Actualizar `getSupportedFormats()` según capacidades reales

---

## Fase 4 — Plantillas y tablas corporativas (1 semana)

### 4.1 Plantillas
- [ ] Plantillas registry → snippets TipTap (JSON + HTML)
- [ ] «Plantilla corporativa» inserta documento TipTap preestilizado
- [ ] Presets Josanz/docs en `TemplatesRegistryService` con preview

### 4.2 Tablas avanzadas
- [ ] Table builder modal → insertar nodo TipTap table (no solo MD/HTML string)
- [ ] Estilos zebra/bordes en `document-pdf-base.ts` alineados al editor
- [ ] Celdas editables in-place en WYSIWYG

---

## Fase 5 — Producción y QA

- [ ] E2E: crear doc visual → preview = PDF → export DOCX
- [ ] Import Word muestra → editar → export PDF sin regresiones
- [x] Bundle budget: lazy-load TipTap + pdfjs + mammoth + docx en ruta `/documents/create/edit` (chunk editor ~390 kB vs ~5.6 MB antes)
- [x] Lazy-load mermaid (preview arquitectura), modales portada/firmas (`document-tools-modal-host`), orquestador PDF (`document-export-orchestrator.loader`) solo al exportar
- [ ] Budget **initial** app (~3.9 MB dev) — fuera del módulo doc-gen; requiere análisis del shell ERP global
- [ ] Backend opcional: DOCX vía LibreOffice/unoserver si fidelidad cliente insuficiente
- [ ] Documentación usuario (atajos, limitaciones PDF import)
- [x] Tests unitarios: `docx-export.service.spec.ts`, `word-import.service.spec.ts`
- [x] **Hardening prod (jun 2026):** UTF-8 editor, sin mock en preview, worker pdfjs, Excel import honesto, errores visibles en lista/export, `editorSurface` en borrador, sin `console.log`/`alert` en flujos principales

---

## Subtareas inmediatas (backlog sprint)

| ID | Tarea | Prioridad | Estado |
|----|-------|-----------|--------|
| T1 | Persistir `editorSurface` en borrador IndexedDB | Alta | ✅ Hecho |
| T2 | Fullscreen + TipTap | Media | Pendiente |
| T3 | Slash TipTap nativo | Media | Pendiente |
| T4 | Lazy-load TipTap/mammoth/pdfjs/docx + mermaid + modales + orchestrator | Alta (budget) | ✅ Hecho |
| T5 | Worker pdfjs en `angular.json` assets | Alta (prod) | ✅ Hecho |
| T6 | E2E preview = PDF = DOCX | Alta | Pendiente |
| T7 | Imágenes Word → DOCX round-trip | Baja | Pendiente |

---

## Dependencias npm

| Paquete | Uso |
|---------|-----|
| `@tiptap/core`, `@tiptap/starter-kit`, extensiones | Editor WYSIWYG |
| `mammoth` | Import .docx → HTML |
| `pdfjs-dist` | Import PDF → texto/HTML |
| `docx` | Export DOCX programático |

---

## Orden de implementación recomendado

1. ~~**Fase 3.1 + 3.3** — Word/DOCX~~ ✅ MVP
2. ~~**Fase 2.1 + 2.4** — TipTap MVP + toggle~~ ✅ MVP
3. ~~**Fase 3.2** — PDF import~~ ✅ MVP
4. **T4** — lazy-load y worker (bundle/prod) ✅
5. **Fase 2.2 + Fase 4** — tablas y plantillas
6. **Fase 5** — hardening prod

---

## Archivos clave

| Área | Ruta |
|------|------|
| Editor principal | `document-create/document-create-editor.component.ts` |
| Canvas + toggle | `document-create/document-editor-canvas.component.ts` |
| TipTap host | `block-editor/document-block-editor.component.ts` |
| Serialización | `block-editor/document-block-serializer.service.ts` |
| Import Word | `services/word-import.service.ts` |
| Import PDF | `services/pdf-import.service.ts` |
| Export DOCX | `services/docx-export.service.ts` |
| Render/export PDF | `services/document-export-orchestrator.service.ts` |
| Formatos legacy | `services/universal-document.service.ts` |
| Export UI | `document-create/document-export-actions.component.ts` |
