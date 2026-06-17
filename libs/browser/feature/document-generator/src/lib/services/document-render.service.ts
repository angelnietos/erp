import { Injectable } from '@angular/core';
import type { PdfStyle } from './templates-registry.service';
import { parseMarkdownToHtml } from '../utils/markdown-parse.util';
import {
  buildDocumentPreviewCss,
  buildPreviewBackgroundOverrideCss,
  enrichDocumentHtmlForStyling,
  normalizeUserCss,
  prioritizeUserCss,
  resolvePdfGenerationCss,
  scopeCssToMarkdownPreview,
} from '../utils/document-preview-css';
import {
  assembleDocumentBodyHtml,
  type DocumentExtrasInput,
  PDF_COVER_SHARED_CSS,
} from '../utils/document-export-html';
import {
  removeManagedStylePreset,
  stylePresetCss,
} from '../utils/document-style-presets';
import { PDF_EXPORT_BASE_CSS } from '../utils/document-pdf-base';

import type {
  ContentEditorMode,
  DocumentRenderInput,
  DocumentRenderPayload,
} from '../models/document-render.models';

/** Base markdown preview styles for iframe isolation - uses static colors since iframe cannot access parent theme variables */
const MARKDOWN_PREVIEW_BASE_CSS_IFRAME = `
/* Base markdown preview styles for iframe isolation */
.document-preview-render.markdown-preview {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 1.05rem;
  line-height: 1.72;
  color: #1f2937;
  background: #ffffff;
}

.document-preview-render.markdown-preview h1,
.document-preview-render.markdown-preview h2,
.document-preview-render.markdown-preview h3 {
  letter-spacing: -0.025em;
}

.document-preview-render.markdown-preview h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  color: #0f172a;
  position: relative;
}

.document-preview-render.markdown-preview h1::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
}

.document-preview-render.markdown-preview h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.25rem 0 0.75rem 0;
  color: #1e293b;
}

.document-preview-render.markdown-preview h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #334155;
}

.document-preview-render.markdown-preview p {
  margin: 0.75rem 0;
  line-height: 1.7;
  text-align: justify;
}

.document-preview-render.markdown-preview ul,
.document-preview-render.markdown-preview ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.document-preview-render.markdown-preview li {
  margin: 0.375rem 0;
}

.document-preview-render.markdown-preview blockquote {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 4px solid #3b82f6;
  background-color: #eff6ff;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #1e40af;
}

.document-preview-render.markdown-preview code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

.document-preview-render.markdown-preview pre {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #0f172a;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.document-preview-render.markdown-preview pre code {
  background-color: transparent;
  color: #e2e8f0;
  padding: 0;
}

.document-preview-render.markdown-preview strong {
  font-weight: 700;
}

.document-preview-render.markdown-preview em {
  font-style: italic;
}

.document-preview-render.markdown-preview hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #e2e8f0;
}

.document-preview-render.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.document-preview-render.markdown-preview th,
.document-preview-render.markdown-preview td {
  border: 1px solid #cbd5e1;
  padding: 0.5rem 0.75rem;
  text-align: left;
  vertical-align: top;
}

.document-preview-render.markdown-preview th {
  background: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
}

.document-preview-render.markdown-preview td {
  background: #ffffff;
  color: #1e293b;
}

.document-preview-render.markdown-preview a {
  color: #2563eb;
  text-decoration: underline;
}

.document-preview-render.markdown-preview a:hover {
  color: #1d4ed8;
}
`;

@Injectable({ providedIn: 'root' })
export class DocumentRenderService {
  buildPayload(input: DocumentRenderInput): DocumentRenderPayload {
    const contentMarkup = this.parseContentMarkup(input);
    const extras: DocumentExtrasInput = {
      coverConfig: input.coverConfig,
      signatureConfig: input.signatureConfig,
      headerFooterConfig: input.headerFooterConfig,
      watermarkConfig: input.watermarkConfig,
      coverPanelEnabled: input.coverPanelEnabled,
      signaturePanelEnabled: input.signaturePanelEnabled,
      headerFooterPanelEnabled: input.headerFooterPanelEnabled,
      watermarkPanelEnabled: input.watermarkPanelEnabled,
      documentTitle: input.documentTitle,
    };
    const bodyHtml = assembleDocumentBodyHtml(contentMarkup, extras);
    const previewStylesheet = this.buildPreviewStylesheet(input);
    const exportStylesheet = this.buildExportStylesheet(input);
    const fullExportHtml = this.buildFullExportHtml(
      input.documentTitle ?? 'Documento',
      bodyHtml,
      exportStylesheet,
    );

    return {
      contentMarkup,
      bodyHtml,
      previewStylesheet,
      exportStylesheet,
      fullExportHtml,
    };
  }

  parseContentMarkup(input: DocumentRenderInput): string {
    const { content, contentEditorMode } = input;

    if (contentEditorMode === 'html') {
      let html = this.stripWrappingHtmlFence(content);
      if (/<html[\s>]/i.test(html)) {
        html = this.extractBodyContent(html);
      }
      return enrichDocumentHtmlForStyling(html);
    }

    if (contentEditorMode === 'plain') {
      return enrichDocumentHtmlForStyling(
        this.applyCorporateCoverVisibility(
          this.plainTextToHtml(content),
          input.coverConfig,
        ),
      );
    }

    const parsed = parseMarkdownToHtml(content);
    const withCover = this.applyCorporateCoverVisibility(parsed, input.coverConfig);
    return enrichDocumentHtmlForStyling(withCover);
  }

  buildPreviewStylesheet(input: DocumentRenderInput): string {
    const cleanedCss = removeManagedStylePreset(input.customCss);
    const rootRe = /:root\s*\{([\s\S]*?)\}/m;
    const rootMatch = rootRe.exec(cleanedCss || '');
    let rootVarsBlock = '';
    if (rootMatch?.[1]) {
      const vars = rootMatch[1].trim();
      rootVarsBlock = [
        `:root {\n${vars}\n}`,
        `.document-create-shell .document-preview-pane.markdown-preview, .document-create-shell .document-preview-pane--isolated.markdown-preview {\n${vars}\n}`,
      ].join('\n\n');
    }

    return [
      buildDocumentPreviewCss(''),
      this.selectedPdfStylePreviewCss(input.pdfStyles, input.selectedPdfStyle),
      normalizeUserCss(stylePresetCss(input.selectedQuickStylePreset)),
      buildPreviewBackgroundOverrideCss(input.backgroundSettings),
      rootVarsBlock,
      prioritizeUserCss(normalizeUserCss(cleanedCss)),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  buildExportStylesheet(input: DocumentRenderInput): string {
    const customCssForExport = this.customCssForDocument(input);
    const pdfStyleRaw = this.selectedPdfStyleRawCss(
      input.pdfStyles,
      input.selectedPdfStyle,
    );
    const pdfStyleGlobal = pdfStyleRaw
      ? this.adaptMarkdownScopedCssForPdf(
          scopeCssToMarkdownPreview(pdfStyleRaw),
        )
      : '';

    return [
      PDF_EXPORT_BASE_CSS,
      pdfStyleGlobal,
      resolvePdfGenerationCss(customCssForExport, input.backgroundSettings),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  buildFullExportHtml(
    title: string,
    bodyHtml: string,
    stylesheet: string,
  ): string {
    const safeTitle = this.escapeHtml(title);
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style id="document-generator-export-css">
${stylesheet}
  </style>
  </head>
  <body>
    <main class="pdf-body-content markdown-preview">
${bodyHtml}
    </main>
  </body>
  </html>`;
  }

  /** HTML idéntico al PDF (Playwright / descarga). */
  buildPdfExportHtml(input: DocumentRenderInput): string {
    const payload = this.buildPayload(input);
    return payload.fullExportHtml;
  }

  /**
   * Vista previa en iframe: misma base CSS que exportación + overrides responsivos
   * para portada y lienzo (WYSIWYG con el PDF).
   */
  buildUnifiedPreviewSrcdoc(input: DocumentRenderInput): string {
    const payload = this.buildPayload(input);
    const previewStylesheet = [
      payload.exportStylesheet,
      this.previewScreenCss(),
      this.previewCoverOverrideCssForExportBody(),
    ]
      .filter(Boolean)
      .join('\n\n');

    return this.buildFullExportHtml(
      input.documentTitle ?? 'Documento',
      payload.bodyHtml,
      previewStylesheet,
    );
  }

  buildHtmlPreviewSrcdoc(
    contentHtml: string,
    stylesheet: string,
    extras: DocumentExtrasInput,
  ): string {
    const processedHtml = this.stripWrappingHtmlFence(contentHtml);
    const isFullDocument = /<html[\s>]/i.test(processedHtml);

    let bodyHtml: string;
    let headContent = '';

    if (isFullDocument) {
      const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(processedHtml);
      headContent = headMatch?.[1]?.trim() || '';

      const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(processedHtml);
      const rawBody = bodyMatch?.[1]?.trim() || processedHtml;

      if (!rawBody.includes('document-preview-render')) {
        bodyHtml = assembleDocumentBodyHtml(rawBody, extras);
        bodyHtml = `<div class="document-preview-render markdown-preview">${bodyHtml}</div>`;
      } else {
        bodyHtml = rawBody;
      }
    } else {
      bodyHtml = assembleDocumentBodyHtml(processedHtml, extras);
      bodyHtml = `<div class="document-preview-render markdown-preview">${bodyHtml}</div>`;
    }

    bodyHtml = bodyHtml
      .replace(/height:\s*297mm/gi, '')
      .replace(/min-height:\s*297mm/gi, '')
      .replace(/\s*;\s*;/g, ';');

    const adaptedStylesheet = this.adaptMarkdownScopedCssForHtml(
      String(stylesheet || ''),
    );
    const styleTag = `<style id="document-generator-custom-css">\n${stylesheet}\n\n/* Adapted for srcdoc (scoped -> iframe) */\n${adaptedStylesheet}\n${MARKDOWN_PREVIEW_BASE_CSS_IFRAME}\n${this.previewCoverOverrideCss()}\n</style>`;

    if (isFullDocument) {
      return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  ${styleTag}
  ${headContent}
</head>
<body>
  ${bodyHtml}
</body>
</html><!-- preview-timestamp: ${Date.now()} -->`;
    }

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  ${styleTag}
</head>
<body>
  ${bodyHtml}
</body>
</html><!-- preview-timestamp: ${Date.now()} -->`;
  }

  getRenderableContentForPdf(
    content: string,
    mode: ContentEditorMode,
    coverConfig: { enabled?: boolean } | undefined,
  ): string {
    if (mode === 'html') {
      const stripped = this.stripWrappingHtmlFence(content);
      return /<html[\s>]/i.test(stripped)
        ? this.extractBodyContent(stripped)
        : stripped;
    }
    if (mode === 'plain') {
      return this.applyCorporateCoverVisibility(
        this.plainTextToHtml(content),
        coverConfig,
      );
    }
    return this.applyCorporateCoverVisibility(content, coverConfig);
  }

  customCssForDocument(input: DocumentRenderInput): string {
    const cleaned = removeManagedStylePreset(input.customCss);
    return [
      stylePresetCss(input.selectedQuickStylePreset),
      prioritizeUserCss(normalizeUserCss(cleaned)),
    ]
      .filter((part) => part.trim())
      .join('\n\n');
  }

  private selectedPdfStylePreviewCss(
    pdfStyles: PdfStyle[],
    selectedPdfStyle: string,
  ): string {
    const css =
      pdfStyles.find((style) => style.id === selectedPdfStyle)?.css ?? '';
    return css ? scopeCssToMarkdownPreview(css) : '';
  }

  private selectedPdfStyleRawCss(
    pdfStyles: PdfStyle[],
    selectedPdfStyle: string,
  ): string {
    return pdfStyles.find((style) => style.id === selectedPdfStyle)?.css ?? '';
  }

  private adaptMarkdownScopedCssForTarget(css: string, target: string): string {
    return css
      .replace(
        /\.document-create-shell\s+\.document-preview-pane(?:--isolated)?\.(?:markdown-preview|document-preview-render)(\s|,|\{)/g,
        `${target}$1`,
      )
      .replace(
        /\.document-preview-pane(?:--isolated)?\.(?:markdown-preview|document-preview-render)(\s|,|\{)/g,
        `${target}$1`,
      )
      .replace(/\.pdf-body-content\.markdown-preview/g, target)
      .replace(/\.document-preview-render\.markdown-preview/g, target)
      .replace(/\.markdown-preview\s*>\s*/g, `${target} > `)
      .replace(/\.markdown-preview(?=[,\{])/g, `${target}`)
      .replace(/\.markdown-preview\s+/g, `${target} `);
  }

  private adaptMarkdownScopedCssForHtml(css: string): string {
    return this.adaptMarkdownScopedCssForTarget(
      css,
      '.document-preview-render.markdown-preview',
    );
  }

  private adaptMarkdownScopedCssForPdf(css: string): string {
    return this.adaptMarkdownScopedCssForTarget(
      css,
      '.pdf-body-content.markdown-preview',
    );
  }

  private stripWrappingHtmlFence(content: string): string {
    const trimmed = content.trim();
    const match = /^```(?:html)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
    return match ? match[1].trim() : content;
  }

  private extractBodyContent(fullHtml: string): string {
    const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(fullHtml);
    if (bodyMatch?.[1]) {
      const content = bodyMatch[1].trim();
      const wrapperMatch =
        /<div[^>]*class=(["'])[^"']*document-preview-render[^"']*\1[^>]*>([\s\S]*?)<\/div>/i.exec(
          content,
        );
      if (wrapperMatch?.[2]) {
        return wrapperMatch[2];
      }
      return content;
    }
    return fullHtml;
  }

  private plainTextToHtml(content: string): string {
    const paragraphs = content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return '';
    }

    return paragraphs
      .map(
        (paragraph) =>
          `<p style="white-space: pre-wrap;">${this.escapeHtml(paragraph)}</p>`,
      )
      .join('\n');
  }

  private applyCorporateCoverVisibility(
    html: string,
    coverConfig: { enabled?: boolean } | undefined,
  ): string {
    if (!coverConfig?.enabled) {
      return html;
    }

    if (!/class\s*=\s*["'][^"']*\b(pdf-cover|cover)\b[^"']*/i.test(html)) {
      return html;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc
        .querySelectorAll('.pdf-cover, .pdf-cover-page, .cover')
        .forEach((cover) => cover.remove());
      return doc.body.innerHTML || html;
    } catch {
      return html.replace(
        /<([a-z][\w:-]*)\b[^>]*class=(["'])[^"']*\b(pdf-cover|cover)\b[^"']*\2[^>]*>[\s\S]*?<\/\1>/gi,
        '',
      );
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private previewCoverOverrideCss(): string {
    return this.previewCoverOverrideCssForExportBody();
  }

  /** Overrides responsivos de portada/contenido para iframe (misma estructura que PDF). */
  previewCoverOverrideCssForExportBody(): string {
    return `
/* Cover styles (shared with PDF) */
${PDF_COVER_SHARED_CSS}

/* Responsive preview: misma estructura .pdf-body-content que exportación */
.pdf-body-content .pdf-cover,
.pdf-body-content .pdf-cover-page,
.pdf-body-content .cover,
.pdf-cover,
.pdf-cover-page {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: auto !important;
  aspect-ratio: 210/297 !important;
  padding: 32px !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

.pdf-cover .cover-container,
.pdf-cover-page .cover-container {
  width: 100% !important;
}

.pdf-cover .cover-title,
.pdf-cover-page .cover-title,
.pdf-cover .cover-subtitle,
.pdf-cover-page .cover-subtitle {
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  white-space: normal !important;
}

/* Watermark overlay for iframe preview */
.pdf-body-content .pdf-watermark {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) rotate(-45deg) !important;
  font-size: 48px !important;
  color: #000000 !important;
  opacity: 0.1 !important;
  pointer-events: none !important;
  user-select: none !important;
  z-index: -1 !important;
  white-space: nowrap !important;
  font-weight: 700 !important;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
}

/* Content spacing - compact but professional (matches PDF) */
.pdf-body-content p {
  margin: 0.45rem 0 !important;
  line-height: 1.68 !important;
}

.pdf-body-content ul,
.pdf-body-content ol {
  margin: 0.55rem 0 !important;
}

.pdf-body-content li {
  margin: 0.25rem 0 !important;
}

.pdf-body-content h1 {
  margin: 1.25rem 0 0.5rem 0 !important;
}

.pdf-body-content h2 {
  margin: 0.85rem 0 0.4rem 0 !important;
}

.pdf-body-content h3 {
  margin: 0.7rem 0 0.35rem 0 !important;
}

.pdf-body-content h1 + ul,
.pdf-body-content h2 + ul,
.pdf-body-content h3 + ul,
.pdf-body-content h1 + ol,
.pdf-body-content h2 + ol,
.pdf-body-content h3 + ol {
  margin-top: 0.25rem !important;
}
`;
  }

  /** Lienzo del iframe de vista previa (simula hoja sobre fondo gris). */
  previewScreenCss(): string {
    return `
html, body {
  margin: 0;
  padding: 24px 16px 32px;
  min-height: 100%;
  background: #e8ecf1;
}

.pdf-body-content.markdown-preview {
  max-width: 794px;
  margin: 0 auto;
  background: #ffffff;
  box-shadow:
    0 4px 6px -1px rgba(15, 23, 42, 0.08),
    0 24px 48px -12px rgba(15, 23, 42, 0.18);
  min-height: 200px;
}
`;
  }
}
