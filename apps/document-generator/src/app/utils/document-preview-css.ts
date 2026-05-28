/** Variables por defecto aplicadas en :root para la vista previa / PDF. */
export const DEFAULT_CSS_VARS = `:root {
  --markdown-font-size: 1.05rem;
  --markdown-line-height: 1.72;
  --markdown-color: #1f2937;
  --markdown-padding: 48px;
  --markdown-bg: #ffffff;
  --markdown-border: #e2e8f0;
  --markdown-radius: 24px;
  --brand-primary: #7a0000;
  --brand-accent: #ff3131;
}`;

/** Estilos base del visor / PDF (siempre aplicados) que usan variables CSS. */
export const DEFAULT_DOCUMENT_PREVIEW_CSS = `
.markdown-preview {
  font-size: var(--markdown-font-size, 1.05rem);
  line-height: var(--markdown-line-height, 1.72);
  color: var(--markdown-color, #1f2937);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3 {
  letter-spacing: -0.025em;
}

.markdown-preview h1 {
  font-size: clamp(2rem, 3vw, 2.75rem);
}

.markdown-preview h2 {
  font-size: clamp(1.35rem, 2vw, 1.75rem);
}

.markdown-preview p,
.markdown-preview li {
  font-size: inherit;
}
`;

export function scopeSingleSelector(selector: string): string {
  if (!selector || selector.includes('.markdown-preview')) {
    return selector;
  }

  if (selector === ':root' || selector === 'html' || selector === 'body') {
    return '.markdown-preview';
  }

  if (selector.startsWith('body.')) {
    return `.markdown-preview${selector.slice('body'.length)}`;
  }

  if (selector.startsWith('html ')) {
    return `.markdown-preview ${selector.slice('html '.length)}`;
  }

  if (selector.startsWith('body ')) {
    return `.markdown-preview ${selector.slice('body '.length)}`;
  }

  return `.markdown-preview ${selector}`;
}

export function scopeCssToMarkdownPreview(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) {
    return '';
  }

  if (!trimmed.includes('{')) {
    return `.markdown-preview {\n${trimmed.replace(/[{}]/g, '').trim()}\n}`;
  }

  return trimmed.replace(
    /(^|})\s*([^@{}][^{}]*)\{/g,
    (match, boundary: string, selectorText: string) => {
      const scopedSelectors = selectorText
        .split(',')
        .map((selector) => scopeSingleSelector(selector.trim()))
        .join(', ');

      return `${boundary}\n${scopedSelectors} {`;
    },
  );
}

/** Strip any leading bare declarations that appear before the first selector (malformed AI output). */
function stripLeadingBareDeclarations(css: string): string {
  const firstBrace = css.indexOf('{');
  if (firstBrace <= 0) return css;
  const beforeBrace = css.slice(0, firstBrace);
  // If the text before the first { contains a }, the opening brace is inside a broken block
  // (e.g. "color: red;\n} body {" — strip everything up to and including the first })
  const firstClose = beforeBrace.indexOf('}');
  if (firstClose !== -1) {
    return css.slice(firstClose + 1).trim();
  }
  return css;
}

export function normalizeUserCss(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('{')) {
    const cleaned = stripLeadingBareDeclarations(trimmed);
    if (!cleaned) return '';
    return scopeCssToMarkdownPreview(cleaned);
  }

  const declarations = trimmed.replace(/[{}]/g, '').trim();
  if (!declarations) {
    return '';
  }

  return `.markdown-preview {\n${declarations}\n}`;
}

/** CSS completo para vista previa y PDF (base + personalizado acotado). */
export function buildDocumentPreviewCss(userCss: string): string {
  // Ensure default variables are present first, then base CSS, then user CSS (scoped)
  const userPart = normalizeUserCss(userCss);
  return [DEFAULT_CSS_VARS, DEFAULT_DOCUMENT_PREVIEW_CSS, userPart]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * CSS guardado en IndexedDB: puede ser el CSS ya fusionado del editor
 * o solo el CSS del usuario (documentos antiguos).
 */
export function resolveStoredDocumentCss(storedCustomCss: string | undefined): string {
  const raw = (storedCustomCss ?? '').trim();
  if (!raw) {
    return buildDocumentPreviewCss('');
  }
  if (raw.includes('.markdown-preview')) {
    return raw;
  }
  return buildDocumentPreviewCss(raw);
}

export type PdfBackgroundMode = 'theme' | 'color' | 'corporate';

export interface PdfBackgroundSettings {
  pdfBackgroundMode?: PdfBackgroundMode;
  pdfBackgroundColor?: string;
  pdfBackgroundImageUrl?: string;
}

export function readPdfBackgroundSettings(
  doc: Record<string, unknown> | null | undefined,
): PdfBackgroundSettings {
  if (!doc) {
    return {};
  }
  const mode = doc['pdfBackgroundMode'];
  return {
    pdfBackgroundMode:
      mode === 'color' || mode === 'corporate' || mode === 'theme'
        ? mode
        : undefined,
    pdfBackgroundColor:
      typeof doc['pdfBackgroundColor'] === 'string'
        ? doc['pdfBackgroundColor']
        : undefined,
    pdfBackgroundImageUrl:
      typeof doc['pdfBackgroundImageUrl'] === 'string'
        ? doc['pdfBackgroundImageUrl']
        : undefined,
  };
}

function sanitizePdfColor(color: string): string {
  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\([^)]+\)$/.test(trimmed)) {
    return trimmed;
  }
  return '#ffffff';
}

/** CSS de fondo para el documento PDF (html/body + contenedor). */
export function buildPdfBackgroundCss(settings: PdfBackgroundSettings): string {
  const mode = settings.pdfBackgroundMode ?? 'theme';

  if (mode === 'color' && settings.pdfBackgroundColor) {
    const color = sanitizePdfColor(settings.pdfBackgroundColor);
    return `
html, body {
  background-color: ${color} !important;
  background: ${color} !important;
}
.pdf-canvas-root {
  background-color: ${color} !important;
  background: ${color} !important;
  min-height: 100%;
  padding: 0;
}
.pdf-body-content.markdown-preview {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}
`;
  }

  if (mode === 'corporate' && settings.pdfBackgroundImageUrl?.trim()) {
    const url = settings.pdfBackgroundImageUrl
      .trim()
      .replace(/"/g, '%22')
      .replace(/'/g, '%27');
    return `
html, body {
  background-color: #f8fafc !important;
}
.pdf-canvas-root {
  background-image: url("${url}");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100%;
}
.pdf-body-content.markdown-preview {
  background: rgba(255, 255, 255, 0.88) !important;
}
`;
  }

  return '';
}

export function resolvePdfGenerationCss(
  storedCustomCss: string | undefined,
  background?: PdfBackgroundSettings,
): string {
  const base = resolveStoredDocumentCss(storedCustomCss);
  const bgCss = buildPdfBackgroundCss(background ?? {});
  if (!bgCss.trim()) {
    return base;
  }
  return `${base}\n\n${bgCss}`;
}

/** Color de lienzo para html2canvas (modo color sólido). */
export function getHtml2CanvasBackground(
  settings: PdfBackgroundSettings,
): string | null {
  if (settings.pdfBackgroundMode === 'color' && settings.pdfBackgroundColor) {
    return sanitizePdfColor(settings.pdfBackgroundColor);
  }
  return null;
}

/** Estilo inline del contenedor de vista previa en el editor. */
export function buildPreviewPaneStyle(
  settings: PdfBackgroundSettings,
): Record<string, string> {
  const mode = settings.pdfBackgroundMode ?? 'theme';
  if (mode === 'color' && settings.pdfBackgroundColor) {
    return { background: sanitizePdfColor(settings.pdfBackgroundColor) };
  }
  if (mode === 'corporate' && settings.pdfBackgroundImageUrl?.trim()) {
    const url = settings.pdfBackgroundImageUrl.trim();
    return {
      backgroundImage: `url("${url.replace(/"/g, '%22')}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: '#f8fafc' };
}

/** Regla final para que el fondo elegido gane al tema y a plantillas con !important. */
export function buildPreviewBackgroundOverrideCss(
  settings: PdfBackgroundSettings,
): string {
  const mode = settings.pdfBackgroundMode ?? 'theme';

  if (mode === 'color' && settings.pdfBackgroundColor) {
    const color = sanitizePdfColor(settings.pdfBackgroundColor);
    return `
:root .document-preview-pane.markdown-preview,
:root .document-preview-render.markdown-preview,
:root:not([data-theme*='light']) .document-preview-pane.markdown-preview,
:root:not([data-theme*='light']) .document-preview-render.markdown-preview,
.document-preview-pane.markdown-preview,
.document-preview-render.markdown-preview {
  background: ${color} !important;
  background-color: ${color} !important;
  background-image: none !important;
}

:root:not([data-theme*='light']) .document-preview-pane.markdown-preview,
:root:not([data-theme*='light']) .document-preview-render.markdown-preview {
  color: var(--text-primary) !important;
}
`;
  }

  if (mode === 'corporate' && settings.pdfBackgroundImageUrl?.trim()) {
    const url = settings.pdfBackgroundImageUrl
      .trim()
      .replace(/"/g, '%22')
      .replace(/'/g, '%27');
    return `
:root .document-preview-pane.markdown-preview,
:root .document-preview-render.markdown-preview,
:root:not([data-theme*='light']) .document-preview-pane.markdown-preview,
:root:not([data-theme*='light']) .document-preview-render.markdown-preview,
.document-preview-pane.markdown-preview,
.document-preview-render.markdown-preview {
  background-image: url("${url}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
`;
  }

  return '';
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = filename.replace(/[\\/:*?"<>|]+/g, '-');
  a.href = url;
  a.download = safe.endsWith('.pdf') ? safe : `${safe}.pdf`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 250);
}
