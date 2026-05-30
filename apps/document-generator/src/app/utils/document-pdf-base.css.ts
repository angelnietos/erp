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
  padding: 14mm 10mm;
  box-sizing: border-box;
}

.pdf-header,
.pdf-footer {
  page-break-inside: avoid;
  break-inside: avoid;
}

.pdf-signatures {
  page-break-inside: avoid;
  break-inside: avoid;
}

h1, h2, h3, h4 {
  page-break-after: avoid;
  break-after: avoid-page;
}

table {
  width: 100%;
  border-collapse: collapse;
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
  break-inside: avoid-page;
}

th, td {
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  vertical-align: top;
}

th {
  background-color: #e8eef5;
  font-weight: 700;
  color: #1e293b;
}

tr:nth-child(even) td {
  background-color: #f8fafc;
}

img {
  max-width: 100%;
  height: auto;
}

blockquote, pre, img, svg {
  page-break-inside: avoid;
  break-inside: avoid-page;
}
`;
