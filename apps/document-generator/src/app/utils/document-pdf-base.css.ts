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
  font-family: 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.72;
  color: #1f2937;
  font-size: 11pt;
  background-color: #f8fafc;
}

.pdf-cover,
.pdf-cover-page {
  width: 210mm;
  height: 297mm;
  min-height: 297mm;
  page-break-after: always;
  break-after: page;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

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
  padding: 0.85rem 1rem;
  font-size: 9.5pt;
  color: #475569;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.pdf-header {
  border-bottom: 1px solid #d1d5db;
}

.pdf-footer {
  border-top: 1px solid #d1d5db;
  justify-content: center;
  text-align: center;
}

.pdf-header .pdf-brand,
.pdf-footer .pdf-brand {
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
}

.pdf-header .pdf-section,
.pdf-footer .pdf-section {
  min-width: 0;
  flex: 1;
}

.pdf-header .pdf-section.center,
.pdf-footer .pdf-section.center {
  text-align: center;
}

.pdf-header .pdf-section.right,
.pdf-footer .pdf-section.right {
  text-align: right;
}

.pdf-cover .cover-container {
  width: 100%;
  max-width: 760px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  box-shadow: 0 40px 120px rgba(15, 23, 42, 0.12);
}

.pdf-cover .cover-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pdf-cover .cover-title {
  font-size: clamp(2.5rem, 5vw, 3.35rem);
  line-height: 1.02;
  margin: 0;
  font-weight: 900;
  color: #111827;
  letter-spacing: -0.04em;
}

.pdf-cover .cover-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #475569;
  opacity: 0.95;
}

.pdf-cover .cover-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1.8rem;
}

.pdf-cover .cover-meta .cover-meta-item {
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: #334155;
}

.pdf-cover .cover-meta .cover-meta-item strong {
  display: block;
  margin-bottom: 0.35rem;
  color: #0f172a;
  font-size: 0.88rem;
}

.pdf-signatures {
  margin-top: 32px;
}

h1,
h2,
h3,
h4 {
  page-break-after: avoid;
  break-after: avoid-page;
  margin-top: 0;
  margin-bottom: 0.85em;
  color: #111827;
}

.pdf-body-content.markdown-preview h1 {
  font-size: 2.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.pdf-body-content.markdown-preview h2 {
  font-size: 1.65rem;
  font-weight: 700;
  margin-top: 1.75em;
}

.pdf-body-content.markdown-preview h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.4em;
}

.pdf-body-content.markdown-preview p {
  margin: 0 0 1.1em;
  color: #334155;
}

.pdf-body-content.markdown-preview a {
  color: #7a0000;
  text-decoration: none;
}

.pdf-body-content.markdown-preview a:hover {
  text-decoration: underline;
}

.pdf-body-content.markdown-preview strong {
  color: #0f172a;
  font-weight: 700;
}

.pdf-body-content.markdown-preview em {
  font-style: italic;
}

.pdf-body-content.markdown-preview ul,
.pdf-body-content.markdown-preview ol {
  margin: 0 0 1.2em 1.45em;
  padding: 0;
}

.pdf-body-content.markdown-preview li {
  margin: 0.35em 0;
}

.pdf-body-content.markdown-preview blockquote {
  margin: 1.5em 0;
  padding: 1.15em 1.25em;
  border-left: 4px solid #7a0000;
  background: #fdf2f2;
  color: #475569;
}

.pdf-body-content.markdown-preview hr {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin: 2em 0;
}

.pdf-body-content.markdown-preview code {
  background: #f8fafc;
  color: #111827;
  padding: 0.2em 0.35em;
  border-radius: 0.35rem;
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 0.95em;
}

.pdf-body-content.markdown-preview pre {
  background: #111827;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.85rem;
  overflow-x: auto;
  margin: 1.5em 0;
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
}

.pdf-body-content.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  page-break-inside: auto;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.pdf-body-content.markdown-preview thead {
  display: table-header-group;
}

.pdf-body-content.markdown-preview tr {
  page-break-inside: avoid;
  break-inside: avoid-page;
}

.pdf-body-content.markdown-preview th,
.pdf-body-content.markdown-preview td {
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.pdf-body-content.markdown-preview th {
  background-color: #f8fafc;
  font-weight: 700;
  color: #111827;
}

.pdf-body-content.markdown-preview tr:nth-child(even) td {
  background-color: #f8fafc;
}

.pdf-body-content.markdown-preview img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto;
}

@media print {
  .pdf-body-content.markdown-preview {
    padding: 18mm 18mm 20mm;
  }
}
`;
