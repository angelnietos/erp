import { Injectable } from '@angular/core';
import type { MarkedGlobal } from '../types/cdn-script-globals';
import type { PdfStyle } from '../services/templates-registry.service';
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
} from '../utils/document-export-html';
import {
  removeManagedStylePreset,
  stylePresetCss,
} from '../utils/document-style-presets';
import { PDF_EXPORT_BASE_CSS } from '../utils/document-pdf-base.css';
import type {
  ContentEditorMode,
  DocumentRenderInput,
  DocumentRenderPayload,
} from '../models/document-render.models';

declare const marked: MarkedGlobal;

@Injectable({ providedIn: 'root' })
export class DocumentRenderService {
  buildPayload(input: DocumentRenderInput): DocumentRenderPayload {
    const contentMarkup = this.parseContentMarkup(input);
    const extras: DocumentExtrasInput = {
      coverConfig: input.coverConfig,
      signatureConfig: input.signatureConfig,
      headerFooterConfig: input.headerFooterConfig,
      coverPanelEnabled: input.coverPanelEnabled,
      signaturePanelEnabled: input.signaturePanelEnabled,
      headerFooterPanelEnabled: input.headerFooterPanelEnabled,
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
      return this.stripWrappingHtmlFence(content);
    }

    if (contentEditorMode === 'plain') {
      return enrichDocumentHtmlForStyling(
        this.applyCorporateCoverVisibility(
          this.plainTextToHtml(content),
          input.coverConfig,
        ),
      );
    }

    const mdOpts = { gfm: true, breaks: true };
    let parsed = content;
    try {
      marked.setOptions?.(mdOpts);
      const result = marked.parse(content, mdOpts);
      parsed = typeof result === 'string' ? result : String(result);
    } catch {
      parsed = content;
    }

    parsed = this.applyCorporateCoverVisibility(parsed, input.coverConfig);
    return enrichDocumentHtmlForStyling(parsed);
  }

  buildPreviewStylesheet(input: DocumentRenderInput): string {
    const cleanedCss = removeManagedStylePreset(input.customCss);
    return [
      buildDocumentPreviewCss(''),
      this.selectedPdfStylePreviewCss(input.pdfStyles, input.selectedPdfStyle),
      normalizeUserCss(stylePresetCss(input.selectedQuickStylePreset)),
      buildPreviewBackgroundOverrideCss(input.backgroundSettings),
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
      ? this.adaptMarkdownScopedCssForHtml(
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
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
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

  buildHtmlPreviewSrcdoc(
    contentHtml: string,
    stylesheet: string,
    extras: DocumentExtrasInput,
  ): string {
    let bodyHtml = assembleDocumentBodyHtml(contentHtml, extras);

    // Remove fixed height styles from cover for responsive preview
    bodyHtml = bodyHtml
      .replace(/height:\s*297mm/gi, '')
      .replace(/min-height:\s*297mm/gi, '')
      .replace(/\s*;\s*;/g, ';');

    const styleTag = `<style id="document-generator-custom-css">\n${stylesheet}\n${this.previewCoverOverrideCss()}\n</style>`;

    if (/<\/head>/i.test(contentHtml)) {
      return contentHtml.replace(/<\/head>/i, `${styleTag}\n</head>`);
    }
    if (/<html[\s>]/i.test(contentHtml)) {
      return contentHtml.replace(
        /<html([^>]*)>/i,
        `<html$1><head>${styleTag}</head>`,
      );
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
</html>`;
  }

  getRenderableContentForPdf(
    content: string,
    mode: ContentEditorMode,
    coverConfig: { enabled?: boolean } | undefined,
  ): string {
    if (mode === 'html') {
      return this.stripWrappingHtmlFence(content);
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
    return (
      pdfStyles.find((style) => style.id === selectedPdfStyle)?.css ?? ''
    );
  }

  private adaptMarkdownScopedCssForHtml(css: string): string {
    return css
      .replace(/\.document-create-shell\s+\.document-preview-pane(?:--isolated)?\.(?:markdown-preview|document-preview-render)\s+/g, '')
      .replace(/\.document-preview-pane(?:--isolated)?\.(?:markdown-preview|document-preview-render)\s+/g, '')
      .replace(/\.markdown-preview\s*>\s*/g, '')
      .replace(/\.markdown-preview\s+/g, '')
      .replace(/\.markdown-preview(?=\s*[{,])/g, '.pdf-body-content.markdown-preview');
  }

  private stripWrappingHtmlFence(content: string): string {
    const trimmed = content.trim();
    const match = /^```(?:html)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
    return match ? match[1].trim() : content;
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
    // Remove cover elements from document content when coverConfig is provided
    // to prevent duplicate covers in PDF
    if (!coverConfig?.enabled) {
      return html;
    }

    if (!/class\s*=\s*["'][^"']*\b(pdf-cover|cover)\b[^"']*/i.test(html)) {
      return html;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('.pdf-cover, .pdf-cover-page, .cover').forEach((cover) => cover.remove());
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
    return `
body .pdf-cover,
body .pdf-cover-page,
.pdf-cover,
.pdf-cover-page {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: auto !important;
  aspect-ratio: 210/297 !important;
}
`;
  }
}
