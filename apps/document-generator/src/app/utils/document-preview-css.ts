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
  --bg: var(--markdown-bg);
  --text: var(--markdown-color);
  --text-soft: #475569;
  --border: var(--markdown-border);
  --code-bg: #0f172a;
  --code-text: #f8fafc;
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

/** Scopes for user/AI CSS — must match or beat document color isolation rules. */
const USER_CSS_SCOPES = [
  '.document-create-shell .document-preview-pane--isolated.markdown-preview',
  '.document-create-shell .document-preview-pane.markdown-preview',
] as const;

function joinUserCssScopes(selectorSuffix = ''): string {
  const suffix = selectorSuffix.trim();
  return USER_CSS_SCOPES.map((scope) => (suffix ? `${scope} ${suffix}` : scope)).join(
    ',\n',
  );
}

export function scopeSingleSelector(selector: string): string {
  if (!selector) {
    return selector;
  }

  if (selector.includes('document-create-shell') && selector.includes('document-preview-pane')) {
    return selector;
  }

  if (selector.includes('.markdown-preview')) {
    const withoutRoot = selector
      .replace(/^\s*\.markdown-preview\s+/, '')
      .replace(/^\s*\.markdown-preview/, '');
    if (withoutRoot !== selector.trim()) {
      return joinUserCssScopes(withoutRoot);
    }
    return USER_CSS_SCOPES.map((scope) =>
      selector.replace(/\.markdown-preview\b/g, scope),
    ).join(',\n');
  }

  if (selector === ':root' || selector === 'html' || selector === 'body') {
    return joinUserCssScopes();
  }

  if (selector.startsWith('body.')) {
    return joinUserCssScopes(selector.slice('body'.length).trim());
  }

  if (selector.startsWith('html ')) {
    return joinUserCssScopes(selector.slice('html '.length));
  }

  if (selector.startsWith('body ')) {
    return joinUserCssScopes(selector.slice('body '.length));
  }

  return joinUserCssScopes(selector);
}

export function scopeCssToMarkdownPreview(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) {
    return '';
  }

  if (!trimmed.includes('{')) {
    return `${joinUserCssScopes()} {\n${trimmed.replace(/[{}]/g, '').trim()}\n}`;
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

  return `${joinUserCssScopes()} {\n${declarations}\n}`;
}

export function prioritizeUserCss(css: string): string {
  const prioritized = css.replace(
    /(^|[{\s;])(color\s*:\s*[^;!}]+)(;?)/gi,
    (_match, prefix: string, declaration: string, suffix: string) =>
      `${prefix}${declaration.trim()} !important${suffix || ';'}`,
  );

  return prioritized.replace(
    /(^|})\s*([^@{}][^{}]*)\{([^{}]*\bcolor\s*:\s*[^;!}]+(?:\s*!important)?[^{}]*)\}/gi,
    (match, boundary: string, selectorText: string, body: string) => {
      const colorDeclaration = /\bcolor\s*:\s*[^;!}]+(?:\s*!important)?/i.test(body);
      if (!colorDeclaration) return match;
      const selectors = selectorText
        .split(',')
        .map((selector) => addNoInlineColorGuard(selector.trim()))
        .join(', ');
      return `${boundary}\n${selectors} {${body}}`;
    },
  );
}

function addNoInlineColorGuard(selector: string): string {
  if (!selector || selector.includes('[style*=')) {
    return selector;
  }
  if (selector.includes('::')) {
    return selector;
  }
  const pseudoMatch = selector.match(/(:[a-z-]+(?:\([^)]*\))?)$/i);
  if (pseudoMatch) {
    return `${selector.slice(0, -pseudoMatch[0].length)}:not([style*='color:'])${pseudoMatch[0]}`;
  }
  return `${selector}:not([style*='color:'])`;
}

function addClasses(element: Element | null, ...classes: string[]): void {
  if (!element) return;
  element.classList.add(...classes.filter(Boolean));
}

/**
 * Marked genera HTML muy genérico. Estas clases dan al asistente puntos de apoyo
 * estables para crear diseños ricos sin depender de la plantilla corporativa.
 */
export function enrichDocumentHtmlForStyling(html: string): string {
  if (!html.trim() || typeof DOMParser === 'undefined') {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<main>${html}</main>`, 'text/html');
    const root = doc.body.querySelector('main');
    if (!root) return html;

    Array.from(root.children).forEach((element, index) => {
      const tagName = element.tagName.toLowerCase();
      addClasses(element, 'doc-block', `doc-block--${tagName}`);
      (element as HTMLElement).dataset['docIndex'] = String(index + 1);
    });

    root.querySelectorAll('h1').forEach((heading, index) => {
      addClasses(
        heading,
        'doc-heading',
        'doc-heading--1',
        index === 0 ? 'doc-title' : 'doc-title-secondary',
      );
    });
    root.querySelectorAll('h2').forEach((heading) =>
      addClasses(heading, 'doc-heading', 'doc-heading--2', 'doc-section-title'),
    );
    root.querySelectorAll('h3').forEach((heading) =>
      addClasses(heading, 'doc-heading', 'doc-heading--3', 'doc-subsection-title'),
    );
    root.querySelectorAll('h4,h5,h6').forEach((heading) =>
      addClasses(heading, 'doc-heading', 'doc-heading--minor'),
    );

    const headings = Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    headings.forEach((heading) => {
      const next = heading.nextElementSibling;
      if (next?.tagName.toLowerCase() === 'p') {
        addClasses(next, 'doc-lead');
      }
    });

    root.querySelectorAll('p').forEach((paragraph) =>
      addClasses(paragraph, 'doc-paragraph'),
    );
    root.querySelectorAll('ul').forEach((list) =>
      addClasses(list, 'doc-list', 'doc-list--unordered'),
    );
    root.querySelectorAll('ol').forEach((list) =>
      addClasses(list, 'doc-list', 'doc-list--ordered'),
    );
    root.querySelectorAll('li').forEach((item) =>
      addClasses(item, 'doc-list-item'),
    );
    root.querySelectorAll('blockquote').forEach((quote) =>
      addClasses(quote, 'doc-callout'),
    );
    root.querySelectorAll('table').forEach((table, index) => {
      addClasses(table, 'doc-table', `doc-table--${index + 1}`);
    });
    root.querySelectorAll('thead').forEach((thead) =>
      addClasses(thead, 'doc-table-head'),
    );
    root.querySelectorAll('tbody').forEach((tbody) =>
      addClasses(tbody, 'doc-table-body'),
    );
    root.querySelectorAll('tr').forEach((row) => addClasses(row, 'doc-table-row'));
    root.querySelectorAll('th').forEach((cell) =>
      addClasses(cell, 'doc-table-header'),
    );
    root.querySelectorAll('td').forEach((cell) =>
      addClasses(cell, 'doc-table-cell'),
    );
    root.querySelectorAll('hr').forEach((divider) =>
      addClasses(divider, 'doc-divider'),
    );
    root.querySelectorAll('pre').forEach((code) =>
      addClasses(code, 'doc-code-block'),
    );
    root.querySelectorAll('code').forEach((code) =>
      addClasses(code, 'doc-code'),
    );
    root.querySelectorAll('img').forEach((image) =>
      addClasses(image, 'doc-image'),
    );

    return root.innerHTML || html;
  } catch {
    return html;
  }
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
  documentPaperColor?: string;
  documentTextColor?: string;
  documentMutedColor?: string;
  documentAccentColor?: string;
  documentBorderColor?: string;
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
    documentPaperColor:
      typeof doc['documentPaperColor'] === 'string'
        ? doc['documentPaperColor']
        : undefined,
    documentTextColor:
      typeof doc['documentTextColor'] === 'string'
        ? doc['documentTextColor']
        : undefined,
    documentMutedColor:
      typeof doc['documentMutedColor'] === 'string'
        ? doc['documentMutedColor']
        : undefined,
    documentAccentColor:
      typeof doc['documentAccentColor'] === 'string'
        ? doc['documentAccentColor']
        : undefined,
    documentBorderColor:
      typeof doc['documentBorderColor'] === 'string'
        ? doc['documentBorderColor']
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

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim();
  const hex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.exec(trimmed);
  if (!hex) return null;
  const raw = hex[1].length === 3
    ? hex[1].split('').map((part) => part + part).join('')
    : hex[1];
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

function mixColor(baseColor: string, overlayColor: string, overlayAmount: number): string {
  const base = hexToRgb(baseColor);
  const overlay = hexToRgb(overlayColor);
  if (!base || !overlay) return baseColor;
  const amount = Math.min(1, Math.max(0, overlayAmount));
  const channel = (baseValue: number, overlayValue: number) =>
    Math.round(baseValue * (1 - amount) + overlayValue * amount);
  return `rgb(${channel(base.r, overlay.r)}, ${channel(base.g, overlay.g)}, ${channel(base.b, overlay.b)})`;
}

function buildDocumentColorIsolationCss(colors: {
  paper: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
}): string {
  const { paper, text, muted, accent, border } = colors;
  const tableHeaderBg = mixColor(paper, accent, 0.18);
  const tableEvenBg = mixColor(paper, text, 0.04);
  const tableOddBg = paper;
  return `
:where(.document-preview-pane--isolated.markdown-preview),
:where(.document-preview-render.markdown-preview),
:where(.pdf-body-content.markdown-preview) {
  --markdown-bg: ${paper} !important;
  --markdown-color: ${text} !important;
  --brand-primary: ${accent} !important;
  --brand-accent: ${accent} !important;
  --markdown-border: ${border} !important;
  background-color: ${paper};
  color: ${text};
  border-color: ${border};
  --bg: ${paper} !important;
  --text: ${text} !important;
  --text-soft: ${muted} !important;
  --border: ${border} !important;
  --code-bg: #0f172a !important;
  --code-text: #f8fafc !important;
}

:where(.document-preview-pane--isolated.markdown-preview) *:not([style*='color:']),
:where(.document-preview-render.markdown-preview) *:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) *:not([style*='color:']) {
  color: ${text};
}

:where(.document-preview-pane--isolated.markdown-preview) p:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) li:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) td:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) .doc-paragraph:not([style*='color:']),
:where(.document-preview-render.markdown-preview) p:not([style*='color:']),
:where(.document-preview-render.markdown-preview) li:not([style*='color:']),
:where(.document-preview-render.markdown-preview) td:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) p:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) li:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) td:not([style*='color:']) {
  color: ${muted};
}

:where(.document-preview-pane--isolated.markdown-preview) h1:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) h2:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) h3:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) h4:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) h5:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) h6:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) strong:not([style*='color:']),
:where(.document-preview-render.markdown-preview) h1,
:where(.document-preview-render.markdown-preview) h2,
:where(.document-preview-render.markdown-preview) h3,
:where(.document-preview-render.markdown-preview) strong,
:where(.pdf-body-content.markdown-preview) h1:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) h2:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) h3:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) strong:not([style*='color:']) {
  color: ${text};
}

:where(.document-preview-pane--isolated.markdown-preview) a:not([style*='color:']),
:where(.document-preview-pane--isolated.markdown-preview) .doc-callout:not([style*='color:']),
:where(.document-preview-render.markdown-preview) a:not([style*='color:']),
:where(.document-preview-render.markdown-preview) .doc-callout:not([style*='color:']),
:where(.pdf-body-content.markdown-preview) a:not([style*='color:']) {
  color: ${accent};
}

:where(.document-preview-pane--isolated.markdown-preview) h1,
:where(.document-preview-pane--isolated.markdown-preview) h2,
:where(.document-preview-pane--isolated.markdown-preview) blockquote,
:where(.document-preview-pane--isolated.markdown-preview) .doc-callout,
:where(.document-preview-pane--isolated.markdown-preview) hr,
:where(.document-preview-pane--isolated.markdown-preview) th,
:where(.document-preview-pane--isolated.markdown-preview) td,
:where(.document-preview-render.markdown-preview) h1,
:where(.document-preview-render.markdown-preview) h2,
:where(.document-preview-render.markdown-preview) blockquote,
:where(.document-preview-render.markdown-preview) hr,
:where(.document-preview-render.markdown-preview) th,
:where(.document-preview-render.markdown-preview) td,
:where(.pdf-body-content.markdown-preview) h1,
:where(.pdf-body-content.markdown-preview) h2,
:where(.pdf-body-content.markdown-preview) blockquote,
:where(.pdf-body-content.markdown-preview) hr,
:where(.pdf-body-content.markdown-preview) th,
:where(.pdf-body-content.markdown-preview) td {
  border-color: ${border};
}

:where(.document-preview-pane--isolated.markdown-preview) h1::before,
:where(.document-preview-pane--isolated.markdown-preview) h2::before,
:where(.document-preview-pane--isolated.markdown-preview) h2::after,
:where(.document-preview-render.markdown-preview) h1::before,
:where(.document-preview-render.markdown-preview) h2::before,
:where(.document-preview-render.markdown-preview) h2::after,
:where(.pdf-body-content.markdown-preview) h1::before,
:where(.pdf-body-content.markdown-preview) h2::before,
:where(.pdf-body-content.markdown-preview) h2::after {
  background: ${accent};
}

:where(.document-preview-pane--isolated.markdown-preview) table,
:where(.document-preview-render.markdown-preview) table,
:where(.pdf-body-content.markdown-preview) table {
  background: ${paper};
  border-color: ${border};
}

:where(.document-preview-pane--isolated.markdown-preview) thead,
:where(.document-preview-render.markdown-preview) thead,
:where(.pdf-body-content.markdown-preview) thead {
  background: transparent;
}

:where(.document-preview-pane--isolated.markdown-preview) th,
:where(.document-preview-render.markdown-preview) th,
:where(.pdf-body-content.markdown-preview) th {
  background: ${tableHeaderBg};
  color: ${text};
  border-color: ${border};
}

:where(.document-preview-pane--isolated.markdown-preview) td,
:where(.document-preview-render.markdown-preview) td,
:where(.pdf-body-content.markdown-preview) td {
  background: transparent;
  color: ${muted};
  border-color: ${border};
}

:where(.document-preview-pane--isolated.markdown-preview) tr:nth-child(even) td,
:where(.document-preview-render.markdown-preview) tr:nth-child(even) td,
:where(.pdf-body-content.markdown-preview) tr:nth-child(even) td {
  background: ${tableEvenBg};
}

:where(.document-preview-pane--isolated.markdown-preview) tr:nth-child(odd) td,
:where(.document-preview-render.markdown-preview) tr:nth-child(odd) td,
:where(.pdf-body-content.markdown-preview) tr:nth-child(odd) td {
  background: ${tableOddBg};
}

.document-create-shell .document-preview-pane--isolated.markdown-preview,
.document-preview-render.markdown-preview {
  background-color: ${paper} !important;
  color: ${text} !important;
  border-color: ${border} !important;
}

.document-create-shell .document-preview-pane--isolated.markdown-preview *:not([style*='color:']),
.document-preview-render.markdown-preview *:not([style*='color:']) {
  color: ${text} !important;
}

.document-create-shell .document-preview-pane--isolated.markdown-preview p:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview li:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview td:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview .doc-paragraph:not([style*='color:']),
.document-preview-render.markdown-preview p:not([style*='color:']),
.document-preview-render.markdown-preview li:not([style*='color:']),
.document-preview-render.markdown-preview td:not([style*='color:']) {
  color: ${muted} !important;
}

.document-create-shell .document-preview-pane--isolated.markdown-preview h1:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview h2:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview h3:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview h4:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview h5:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview h6:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview strong:not([style*='color:']),
.document-preview-render.markdown-preview h1:not([style*='color:']),
.document-preview-render.markdown-preview h2:not([style*='color:']),
.document-preview-render.markdown-preview h3:not([style*='color:']),
.document-preview-render.markdown-preview strong:not([style*='color:']) {
  color: ${text} !important;
}

.document-create-shell .document-preview-pane--isolated.markdown-preview a:not([style*='color:']),
.document-create-shell .document-preview-pane--isolated.markdown-preview .doc-callout:not([style*='color:']),
.document-preview-render.markdown-preview a:not([style*='color:']) {
  color: ${accent} !important;
}
`;
}

/** CSS de fondo para el documento PDF (html/body + contenedor). */
export function buildPdfBackgroundCss(settings: PdfBackgroundSettings): string {
  const mode = settings.pdfBackgroundMode ?? 'theme';
  const paper = sanitizePdfColor(settings.documentPaperColor ?? '#ffffff');
  const text = sanitizePdfColor(settings.documentTextColor ?? '#1f2937');
  const muted = sanitizePdfColor(settings.documentMutedColor ?? '#475569');
  const accent = sanitizePdfColor(settings.documentAccentColor ?? '#2563eb');
  const border = sanitizePdfColor(settings.documentBorderColor ?? '#e2e8f0');

  if (mode === 'theme') {
    const canvas = sanitizePdfColor(settings.pdfBackgroundColor ?? paper);
    return `
html, body {
  background-color: ${canvas} !important;
  background: ${canvas} !important;
}
.pdf-canvas-root {
  background-color: ${canvas} !important;
  background: ${canvas} !important;
  min-height: 100%;
  padding: 0;
}
.pdf-body-content.markdown-preview {
  background: ${paper} !important;
  box-shadow: none !important;
}
${buildDocumentColorIsolationCss({ paper, text, muted, accent, border })}
`;
  }

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
  background: ${paper} !important;
  box-shadow: none !important;
}
${buildDocumentColorIsolationCss({ paper, text, muted, accent, border })}
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
  background: ${paper} !important;
}
${buildDocumentColorIsolationCss({ paper, text, muted, accent, border })}
`;
  }

  return '';
}

/**
 * Traduce los selectores del panel de vista previa al contexto PDF.
 *
 * El CSS guardado en BD está scopeado a `.document-create-shell .document-preview-pane--isolated.markdown-preview`
 * (selector del editor en vivo). En el PDF el contenedor es `.pdf-body-content.markdown-preview`, por lo que
 * sin esta transformación el CSS del usuario nunca aplica al PDF exportado.
 */
export function resolvePdfCustomCss(storedCustomCss: string | undefined): string {
  const resolved = resolveStoredDocumentCss(storedCustomCss);

  return (
    resolved
      // Reemplaza ambas variantes de scope del editor → scope PDF
      .replace(
        /\.document-create-shell\s+\.document-preview-pane(?:--isolated)?\.(?:markdown-preview|document-preview-render)/g,
        '.pdf-body-content.markdown-preview',
      )
      // Reemplaza selectores :where() del aislamiento de colores → scope PDF
      .replace(
        /:where\(\.document-preview-pane(?:--isolated)?(?:\.markdown-preview|\.document-preview-render)?\)/g,
        ':where(.pdf-body-content.markdown-preview)',
      )
      // Reemplaza .document-preview-render.markdown-preview → scope PDF
      .replace(
        /\.document-preview-render\.markdown-preview/g,
        '.pdf-body-content.markdown-preview',
      )
  );
}

export function resolvePdfGenerationCss(
  storedCustomCss: string | undefined,
  background?: PdfBackgroundSettings,
): string {
  // Usamos resolvePdfCustomCss en lugar de resolveStoredDocumentCss para que
  // el CSS del usuario coincida con los elementos dentro del PDF generado.
  const base = resolvePdfCustomCss(storedCustomCss);
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
  if (settings.pdfBackgroundMode === 'theme' && settings.pdfBackgroundColor) {
    return sanitizePdfColor(settings.pdfBackgroundColor);
  }
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
  const paper = sanitizePdfColor(settings.documentPaperColor ?? '#ffffff');
  if (mode === 'theme') {
    return {
      background: paper,
      color: sanitizePdfColor(settings.documentTextColor ?? '#1f2937'),
    };
  }
  if (mode === 'color' && settings.pdfBackgroundColor) {
    return {
      background: sanitizePdfColor(settings.pdfBackgroundColor),
      color: sanitizePdfColor(settings.documentTextColor ?? '#1f2937'),
    };
  }
  if (mode === 'corporate' && settings.pdfBackgroundImageUrl?.trim()) {
    const url = settings.pdfBackgroundImageUrl.trim();
    return {
      backgroundImage: `url("${url.replace(/"/g, '%22')}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: sanitizePdfColor(settings.documentTextColor ?? '#1f2937'),
    };
  }
  return paper === '#ffffff'
    ? { background: '#f8fafc', color: '#1f2937' }
    : { background: '#f8fafc' };
}

/** Regla final para que el fondo elegido gane al tema y a plantillas con !important. */
export function buildPreviewBackgroundOverrideCss(
  settings: PdfBackgroundSettings,
): string {
  const mode = settings.pdfBackgroundMode ?? 'theme';
  const paper = sanitizePdfColor(settings.documentPaperColor ?? '#ffffff');
  const text = sanitizePdfColor(settings.documentTextColor ?? '#1f2937');
  const muted = sanitizePdfColor(settings.documentMutedColor ?? '#475569');
  const accent = sanitizePdfColor(settings.documentAccentColor ?? '#2563eb');
  const border = sanitizePdfColor(settings.documentBorderColor ?? '#e2e8f0');

  if (mode === 'color' && settings.pdfBackgroundColor) {
    const color = sanitizePdfColor(settings.pdfBackgroundColor);
    return `
:root .document-preview-pane.markdown-preview,
:root .document-preview-render.markdown-preview,
:root:not([data-theme*='light']) .document-preview-pane.markdown-preview,
:root:not([data-theme*='light']) .document-preview-render.markdown-preview,
.document-preview-pane.markdown-preview,
.document-preview-render.markdown-preview {
  background: ${paper};
  background-color: ${paper};
  background-image: none !important;
}

.document-preview-pane-shell {
  background: ${color};
}

${buildDocumentColorIsolationCss({ paper, text, muted, accent, border })}
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

${buildDocumentColorIsolationCss({ paper, text, muted, accent, border })}
`;
  }

  if (mode === 'theme') {
    const canvas = settings.pdfBackgroundColor ?? paper;
    return `
html, body {
  background-color: ${canvas} !important;
  background: ${canvas} !important;
}

${buildDocumentColorIsolationCssForIframe({ paper, text, muted, accent, border })}
`;
  }

  return '';
}

/** CSS de aislamiento de colores optimizado para iframe (sin prefijos del editor). */
function buildDocumentColorIsolationCssForIframe(colors: {
  paper: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
}): string {
  const { paper, text, muted, accent, border } = colors;
  const tableHeaderBg = mixColor(paper, accent, 0.18);
  const tableEvenBg = mixColor(paper, text, 0.04);
  const tableOddBg = paper;
  return `
.markdown-preview,
.document-preview-render.markdown-preview {
  --markdown-bg: ${paper} !important;
  --markdown-color: ${text} !important;
  --brand-primary: ${accent} !important;
  --brand-accent: ${accent} !important;
  --markdown-border: ${border} !important;
  background-color: ${paper};
  color: ${text};
  border-color: ${border};
  --bg: ${paper} !important;
  --text: ${text} !important;
  --text-soft: ${muted} !important;
  --border: ${border} !important;
  --code-bg: #0f172a !important;
  --code-text: #f8fafc !important;
}

.markdown-preview *:not([style*='color:']),
.document-preview-render.markdown-preview *:not([style*='color:']) {
  color: ${text};
}

.markdown-preview p:not([style*='color:']),
.markdown-preview li:not([style*='color:']),
.markdown-preview td:not([style*='color:']),
.markdown-preview .doc-paragraph:not([style*='color:']),
.document-preview-render.markdown-preview p:not([style*='color:']),
.document-preview-render.markdown-preview li:not([style*='color:']),
.document-preview-render.markdown-preview td:not([style*='color:']) {
  color: ${muted};
}

.markdown-preview h1:not([style*='color:']),
.markdown-preview h2:not([style*='color:']),
.markdown-preview h3:not([style*='color:']),
.markdown-preview h4:not([style*='color:']),
.markdown-preview h5:not([style*='color:']),
.markdown-preview h6:not([style*='color:']),
.markdown-preview strong:not([style*='color:']),
.document-preview-render.markdown-preview h1,
.document-preview-render.markdown-preview h2,
.document-preview-render.markdown-preview h3,
.document-preview-render.markdown-preview strong {
  color: ${text} !important;
}

.markdown-preview a:not([style*='color:']),
.markdown-preview .doc-callout:not([style*='color:']),
.document-preview-render.markdown-preview a:not([style*='color:']),
.document-preview-render.markdown-preview .doc-callout:not([style*='color:']) {
  color: ${accent};
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview blockquote,
.markdown-preview .doc-callout,
.markdown-preview hr,
.markdown-preview th,
.markdown-preview td,
.document-preview-render.markdown-preview h1,
.document-preview-render.markdown-preview h2,
.document-preview-render.markdown-preview blockquote,
.document-preview-render.markdown-preview hr,
.document-preview-render.markdown-preview th,
.document-preview-render.markdown-preview td {
  border-color: ${border};
}

.markdown-preview h1::before,
.markdown-preview h2::before,
.markdown-preview h2::after,
.document-preview-render.markdown-preview h1::before,
.document-preview-render.markdown-preview h2::before,
.document-preview-render.markdown-preview h2::after {
  background: ${accent};
}

.markdown-preview table,
.document-preview-render.markdown-preview table {
  background: ${paper};
  border-color: ${border};
}

.markdown-preview thead,
.document-preview-render.markdown-preview thead {
  background: transparent;
}

.markdown-preview th,
.document-preview-render.markdown-preview th {
  background: ${tableHeaderBg};
  color: ${text};
  border-color: ${border};
}

.markdown-preview td,
.document-preview-render.markdown-preview td {
  background: transparent;
  color: ${muted};
  border-color: ${border};
}

.markdown-preview tr:nth-child(even) td,
.document-preview-render.markdown-preview tr:nth-child(even) td {
  background: ${tableEvenBg};
}

.markdown-preview tr:nth-child(odd) td,
.document-preview-render.markdown-preview tr:nth-child(odd) td {
  background: ${tableOddBg};
}
`;
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
