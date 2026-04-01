/** Escape text for safe insertion into HTML documents. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Opens a new window with simple printable HTML and triggers the print dialog.
 * User can choose "Guardar como PDF" en el navegador.
 */
export function openPrintableDocument(title: string, bodyInnerHtml: string): void {
  const w = window.open('', '_blank');
  if (!w) {
    window.alert(
      'No se pudo abrir la ventana de impresión. Permite ventanas emergentes para este sitio.',
    );
    return;
  }
  const safeTitle = escapeHtml(title);
  w.document.open();
  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${safeTitle}</title>
  <style>
    body { font-family: system-ui, Segoe UI, sans-serif; padding: 24px; color: #111; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.25rem; margin-bottom: 8px; }
    .meta { color: #444; font-size: 0.9rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 0.85rem; }
    th { background: #f5f5f5; }
    .totals { margin-top: 16px; text-align: right; font-weight: 600; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
${bodyInnerHtml}
</body>
</html>`);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 200);
}
