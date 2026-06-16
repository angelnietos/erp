/** CSS base para exportación PDF con Chromium (A4, portada, impresión). */
export const PDF_EXPORT_BASE_CSS = `
@page {
  size: A4;
  margin: 0;
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.72;
  color: #1f2937;
  font-size: 11pt;
  background-color: #f8fafc;
}

/* === PORTADA PROFESSIONAL (idéntica preview/PDF) === */
.pdf-cover,
.pdf-cover-page,
.cover {
  position: relative;
  overflow: hidden;
  width: 210mm;
  height: 297mm;
  min-height: 297mm;
  page-break-after: always;
  break-after: page;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.pdf-cover::before,
.pdf-cover-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 20%),
    radial-gradient(circle at 80% 40%, rgba(255,255,255,0.12), transparent 25%);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}

.pdf-cover .cover-container,
.pdf-cover-page .cover-container,
.cover .cover-container {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  max-width: 660px;
}

.pdf-cover .cover-header,
.pdf-cover-page .cover-header,
.cover .cover-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.pdf-cover .cover-title,
.pdf-cover-page .cover-title,
.cover .cover-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.08;
  margin: 0;
  letter-spacing: -0.03em;
  color: inherit;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}

.pdf-cover .cover-subtitle,
.pdf-cover-page .cover-subtitle,
.cover .cover-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.92;
  color: inherit;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}

.pdf-cover .cover-divider,
.pdf-cover-page .cover-divider,
.cover .cover-divider {
  width: 80px;
  height: 3px;
  background: currentColor;
  opacity: 0.4;
  border-radius: 999px;
  margin: 1rem auto;
}

.pdf-cover .cover-meta,
.pdf-cover-page .cover-meta,
.cover .cover-meta {
  font-size: 0.875rem;
  opacity: 0.88;
  margin-top: 0.5rem;
  color: inherit;
}

.pdf-cover .cover-meta-item,
.pdf-cover-page .cover-meta-item,
.cover .cover-meta-item {
  display: inline-block;
}

.pdf-cover .cover-meta-item:not(:last-child)::after,
.pdf-cover-page .cover-meta-item:not(:last-child)::after,
.cover .cover-meta-item:not(:last-child)::after {
  content: ' · ';
  opacity: 0.6;
}

.pdf-cover .cover-logo,
.pdf-cover-page .cover-logo,
.cover .cover-logo {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
  margin-bottom: 0.75rem;
}

/* === NAVEGACIÓN Y FIRMA === */
.pdf-body-content.markdown-preview {
  padding: 16mm 18mm 20mm;
  box-sizing: border-box;
  max-width: 190mm;
  margin: 0 auto;
  background: #ffffff;
}

.pdf-header,
.pdf-footer,
.pdf-signatures {
  page-break-inside: avoid;
  break-inside: avoid;
}

.pdf-header,
.pdf-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 6px 15mm;
  font-size: 9pt;
  color: #64748b;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.pdf-footer {
  justify-content: center;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.pdf-page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 8px 15mm;
  font-size: 9pt;
  color: #64748b;
  background: rgba(255,255,255,0.95);
  border-bottom: 1px solid #e2e8f0;
  z-index: 10;
}

.pdf-page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 8px 15mm;
  font-size: 9pt;
  color: #64748b;
  background: rgba(255,255,255,0.95);
  border-top: 1px solid #e2e8f0;
  z-index: 10;
}

.pdf-page-header-left,
.pdf-page-footer-left { text-align: left; flex: 1; }
.pdf-page-header-center,
.pdf-page-footer-center { text-align: center; flex: 1; }
.pdf-page-header-right,
.pdf-page-footer-right { text-align: right; flex: 1; }

/* === CONTENIDO CON COMPACTACIÓN PROFESIONAL === */
.pdf-body-content.markdown-preview h1:not([style*='color:']),
.pdf-body-content.markdown-preview h2:not([style*='color:']),
.pdf-body-content.markdown-preview h3:not([style*='color:']),
.pdf-body-content.markdown-preview h4:not([style*='color:']),
.pdf-body-content.markdown-preview strong:not([style*='color:']) {
  color: #0f172a;
  letter-spacing: -0.02em;
  page-break-after: avoid;
  break-after: avoid-page;
  page-break-inside: avoid;
  break-inside: avoid;
}

.pdf-body-content.markdown-preview h1:not([style*='color:']) {
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  font-weight: 800;
  margin: 1.25rem 0 0.5rem 0;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #e2e8f0;
}

.pdf-body-content.markdown-preview h2:not([style*='color:']) {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 700;
  margin: 0.85rem 0 0.4rem 0;
}

.pdf-body-content.markdown-preview h3:not([style*='color:']) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.7rem 0 0.35rem 0;
}

.pdf-body-content.markdown-preview h4:not([style*='color:']) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.55rem 0 0.25rem 0;
}

/* Párrafos compactos sin saltos excesivos */
.pdf-body-content.markdown-preview p {
  margin: 0.45rem 0;
  line-height: 1.68;
  text-align: justify;
  orphans: 3;
  widows: 3;
}

.pdf-body-content.markdown-preview p:not([style*='color:']),
.pdf-body-content.markdown-preview li:not([style*='color:']) {
  color: #334155;
}

/* Listas con espaciado compacto y sin saltos de página innecesarios */
.pdf-body-content.markdown-preview ul,
.pdf-body-content.markdown-preview ol {
  margin: 0.55rem 0;
  padding-left: 1.4rem;
}

.pdf-body-content.markdown-preview li {
  margin: 0.25rem 0;
  orphans: 2;
  widows: 2;
}

/* Evitar saltos de página antes de listas */
.pdf-body-content.markdown-preview h1 + ul,
.pdf-body-content.markdown-preview h2 + ul,
.pdf-body-content.markdown-preview h3 + ul,
.pdf-body-content.markdown-preview h4 + ul,
.pdf-body-content.markdown-preview h1 + ol,
.pdf-body-content.markdown-preview h2 + ol,
.pdf-body-content.markdown-preview h3 + ol,
.pdf-body-content.markdown-preview h4 + ol,
.pdf-body-content.markdown-preview p + ul,
.pdf-body-content.markdown-preview p + ol {
  margin-top: 0.25rem;
}

/* Bloques de código y citas con control de página */
.pdf-body-content.markdown-preview blockquote {
  margin: 0.75rem 0;
  padding: 0.75rem 1rem;
  border-left: 4px solid #7a0000;
  background: #fff1f1;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #5b0000;
  page-break-inside: avoid;
  break-inside: avoid-page;
}

.pdf-body-content.markdown-preview pre {
  margin: 0.85rem 0;
  padding: 1rem;
  background: #0f172a;
  border-radius: 0.5rem;
  overflow-x: auto;
  page-break-inside: avoid;
  break-inside: avoid-page;
}

.pdf-body-content.markdown-preview pre code {
  background: transparent;
  color: #e2e8f0;
  padding: 0;
}

.pdf-body-content.markdown-preview code {
  background: #f1f5f9;
  color: #1e293b;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 0.95em;
}

/* Separadores */
.pdf-body-content.markdown-preview hr {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
}

/* Enlaces */
.pdf-body-content.markdown-preview a {
  color: #7a0000;
  text-decoration: underline;
}

.pdf-body-content.markdown-preview a:hover {
  color: #ff3131;
}

/* Tablas profesionales */
.pdf-body-content.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  page-break-inside: auto;
  break-inside: auto;
}

.pdf-body-content.markdown-preview thead {
  display: table-header-group;
}

.pdf-body-content.markdown-preview tr {
  page-break-inside: avoid;
  break-inside: avoid-page;
}

.pdf-body-content.markdown-preview th:not([style*='color:']) {
  background: #f8fafc;
  font-weight: 700;
  color: #1e293b;
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.pdf-body-content.markdown-preview td:not([style*='color:']) {
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  vertical-align: top;
}

.pdf-body-content.markdown-preview tr:nth-child(even) td:not([style*='color:']) {
  background: #f8fafc;
}

/* Imágenes */
.pdf-body-content.markdown-preview img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0.85rem auto;
  page-break-inside: avoid;
  break-inside: avoid-page;
}

/* Firma */
.pdf-signatures {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  page-break-inside: avoid;
}

/* Watermark overlay para PDF */
.pdf-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 48px;
  color: #000000;
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  z-index: -1;
  white-space: nowrap;
  font-weight: 700;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

/* Callouts (notas, info, advertencia, éxito) */
.pdf-body-content.markdown-preview .doc-callout {
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
  color: #1e40af;
  page-break-inside: avoid;
}

.pdf-body-content.markdown-preview .doc-callout--info {
  border-left-color: #2563eb;
  background: #eff6ff;
  color: #1e3a8a;
}

.pdf-body-content.markdown-preview .doc-callout--warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
  color: #92400e;
}

.pdf-body-content.markdown-preview .doc-callout--success {
  border-left-color: #16a34a;
  background: #f0fdf4;
  color: #166534;
}

.pdf-body-content.markdown-preview .doc-callout--note {
  border-left-color: #6366f1;
  background: #eef2ff;
  color: #3730a3;
}

.pdf-body-content.markdown-preview .doc-checklist {
  list-style: none;
  padding-left: 0;
}

.pdf-body-content.markdown-preview .doc-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.35rem 0;
}

/* Secciones con control de página */
.pdf-body-content.markdown-preview .doc-block {
  page-break-inside: avoid;
  break-inside: avoid-page;
}

.pdf-body-content.markdown-preview .doc-section-title {
  margin-top: 1.5rem;
}

@media print {
  .pdf-body-content.markdown-preview {
    padding: 18mm 18mm 20mm;
  }
}
`;
