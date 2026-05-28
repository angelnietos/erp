/** Estilos base del visor / PDF (siempre aplicados). */
export const DEFAULT_DOCUMENT_PREVIEW_CSS = `
.markdown-preview {
  font-size: 1.05rem;
  line-height: 1.72;
  color: #1f2937;
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

export function normalizeUserCss(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('{')) {
    return scopeCssToMarkdownPreview(trimmed);
  }

  const declarations = trimmed.replace(/[{}]/g, '').trim();
  if (!declarations) {
    return '';
  }

  return `.markdown-preview {\n${declarations}\n}`;
}

/** CSS completo para vista previa y PDF (base + personalizado acotado). */
export function buildDocumentPreviewCss(userCss: string): string {
  return [DEFAULT_DOCUMENT_PREVIEW_CSS, normalizeUserCss(userCss)]
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
