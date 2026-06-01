import { Injectable, inject } from '@angular/core';
import { escapeHtml } from '../utils/html-escape';
import {
   enrichDocumentHtmlForStyling,
   getHtml2CanvasBackground,
   readPdfBackgroundSettings,
   resolvePdfGenerationCss,
   type PdfBackgroundSettings,
 } from '../utils/document-preview-css';
import { PDF_EXPORT_BASE_CSS } from '../utils/document-pdf-base.css';
import { TemplatesRegistryService } from './templates-registry.service';
import type {
  Html2PdfFactory,
  JsPdfInstance,
  MarkedGlobal,
} from '../types/cdn-script-globals';

declare const html2pdf: Html2PdfFactory;
declare const marked: MarkedGlobal;

interface DocumentData {
  title?: string;
  content?: string;
  date?: string;
  /** Texto opcional bajo el título (p. ej. cliente o referencia). */
  subtitle?: string;
  client?: string;
  type?: string;
  projectName?: string;
  totalAmount?: number | string;
  description?: string;
  systemOverview?: string;
  architectureDiagram?: string;
  dataFlow?: string;
  components?: string;
  technologies?: string;
  apis?: string;
  executiveSummary?: string;
  objectives?: string;
  scope?: string;
  deliverables?: string;
  timeline?: string;
  pricing?: string;
  terms?: string;
  customCss?: string;
  pdfStyleId?: string;
  quickStylePreset?: string;
  contentEditorMode?: 'markdown' | 'html' | 'plain';
  pdfBackgroundMode?: PdfBackgroundSettings['pdfBackgroundMode'];
  pdfBackgroundColor?: string;
  pdfBackgroundImageUrl?: string;
  documentPaperColor?: string;
  documentTextColor?: string;
  documentMutedColor?: string;
  documentAccentColor?: string;
documentBorderColor?: string;
   coverConfig?: Record<string, unknown>;
   signatureConfig?: Record<string, unknown>;
   headerFooterConfig?: Record<string, unknown>;
   watermarkConfig?: Record<string, unknown>;
 }

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  private readonly templates = inject(TemplatesRegistryService);

  /** Fecha legible en español (ISO u otros formatos parseables por Date). */
  private formatDisplayDate(value?: string): string {
    if (!value?.trim()) {
      return new Date().toLocaleDateString('es-ES');
    }
    const t = Date.parse(value);
    if (!Number.isNaN(t)) {
      return new Date(t).toLocaleDateString('es-ES');
    }
    return value;
  }

  /**
   * Agrupa cada título (h1–h4) con el contenido que le sigue para que html2pdf
   * no corte un encabezado por la mitad al trocear el lienzo.
   */
  private prepareHtmlForPdfPagination(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div class="pdf-parse-root">${html}</div>`,
        'text/html',
      );
      const root = doc.body.querySelector('.pdf-parse-root');
      if (!root) {
        return html;
      }

      const nodes = Array.from(root.childNodes);
      const out = doc.createElement('div');
      out.className = 'pdf-parse-root';

      let section: HTMLDivElement | null = null;

      const flushSection = (): void => {
        if (section) {
          out.appendChild(section);
          section = null;
        }
      };

      for (const node of nodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          if (!section) {
            section = doc.createElement('div');
            section.className = 'pdf-section-block';
          }
          section.appendChild(node.cloneNode(true));
          continue;
        }

        const el = node as Element;
        const tag = el.tagName.toUpperCase();

        if (tag === 'H1') {
          flushSection();
          const titleBlock = doc.createElement('div');
          titleBlock.className = 'pdf-section-block pdf-section-block--title';
          titleBlock.appendChild(node.cloneNode(true));
          out.appendChild(titleBlock);
          continue;
        }

        if (/^H[2-4]$/.test(tag)) {
          flushSection();
          section = doc.createElement('div');
          section.className = 'pdf-section-block';
          section.appendChild(node.cloneNode(true));
          continue;
        }

        if (!section) {
          section = doc.createElement('div');
          section.className = 'pdf-section-block';
        }
        section.appendChild(node.cloneNode(true));
      }

      flushSection();
      return out.innerHTML;
    } catch {
      return html;
    }
  }

  /** Reglas de paginación compartidas (html2pdf + CSS). */
  private getPdfPaginationCss(): string {
    return `
      .pdf-canvas-root {
        min-height: 100%;
        padding: 14mm 10mm;
        box-sizing: border-box;
      }
      .pdf-body-content {
        margin-top: 0;
      }
      .pdf-body-content > h1:first-child,
      .pdf-body-content > h2:first-child,
      .pdf-section-block:first-child h1,
      .pdf-section-block:first-child h2 {
        margin-top: 0;
      }
      .pdf-section-block {
        page-break-inside: avoid;
        break-inside: avoid-page;
        -webkit-column-break-inside: avoid;
        margin-bottom: 0.85rem;
      }
      h1, h2, h3, h4 {
        page-break-after: avoid;
        break-after: avoid-page;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1 + p, h2 + p, h3 + p, h4 + p,
      h1 + ul, h2 + ul, h3 + ul, h4 + ul,
      h1 + ol, h2 + ol, h3 + ol, h4 + ol,
      h1 + table, h2 + table, h3 + table, h4 + table {
        page-break-before: avoid;
        break-before: avoid-page;
      }
      p, li {
        orphans: 3;
        widows: 3;
      }
      blockquote, pre, img, svg, table {
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
      thead {
        display: table-header-group;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
    `;
  }

  private resolvePdfStyles(data: DocumentData): {
    css: string;
    canvasBackground: string | null;
  } {
    let background = readPdfBackgroundSettings(
      data as unknown as Record<string, unknown>,
    );
    if (
      !background.pdfBackgroundMode &&
      typeof data.customCss === 'string' &&
      data.customCss.includes('body')
    ) {
      const match = /body\s*\{[^}]*background(?:-color)?:\s*([^;!]+)/i.exec(
        data.customCss,
      );
      if (match?.[1]) {
        background = {
          pdfBackgroundMode: 'color',
          pdfBackgroundColor: match[1].trim(),
        };
      }
    }
    return {
      css: resolvePdfGenerationCss(data.customCss, background),
      canvasBackground: getHtml2CanvasBackground(background),
    };
  }

  /**
   * Renderiza HTML en un nodo DOM oculto para que html2canvas capture fondos y estilos.
   */
  private async htmlToPdfBlob(
    fullHtml: string,
    filename: string,
    canvasBackground: string | null,
  ): Promise<Blob> {
    if (typeof html2pdf !== 'function') {
      throw new Error(
        'El motor PDF no está disponible. Recarga la página e inténtalo de nuevo.',
      );
    }

    const host = document.createElement('div');
    host.setAttribute('data-pdf-render-host', 'true');
    host.style.position = 'fixed';
    host.style.left = '-12000px';
    host.style.top = '0';
    host.style.width = '794px';
    host.style.zIndex = '-1';
    host.style.pointerEvents = 'none';
    host.style.overflow = 'visible';

    const parsed = new DOMParser().parseFromString(fullHtml, 'text/html');
    const headLinks = Array.from(
      parsed.head.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]'),
    ).map((node) => node.cloneNode(true) as HTMLLinkElement);
    const styleEl = document.createElement('style');
    styleEl.textContent = Array.from(parsed.head.querySelectorAll('style'))
      .map((node) => node.textContent ?? '')
      .join('\n');

    const page = parsed.body.cloneNode(true) as HTMLElement;
    page.classList.add('pdf-canvas-root');

    host.append(...headLinks, styleEl, page);
    document.body.appendChild(host);

    try {
      const options = this.pdfHtml2PdfOptions(filename, canvasBackground);
      this.expandPdfCanvasToFullPages(page, canvasBackground);
      return await html2pdf().set(options).from(page).toPdf(function(pdf: JsPdfInstance) {
        const totalPages = pdf.internal.getTotalPages ? pdf.internal.getTotalPages() : 1;
        const pageSize = pdf.internal.pageSize;
        const pageWidth = pageSize.getWidth ? pageSize.getWidth() : 210;
        // Add page numbers at the bottom center of each page via jsPDF
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor('#64748b');
          const pageHeight = pageSize.getHeight ? pageSize.getHeight() : 297;
          pdf.text(`Página ${i}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }
      }).outputPdf('blob');
    } finally {
      host.remove();
    }
  }

  private expandPdfCanvasToFullPages(
    page: HTMLElement,
    canvasBackground: string | null,
  ): void {
    const pageWidthPx = 794;
    const a4HeightPx = pageWidthPx * (297 / 210);
    const currentHeight = Math.max(page.scrollHeight, page.offsetHeight);
    const fullPageHeight = Math.ceil(currentHeight / a4HeightPx) * a4HeightPx;
    const heightPx = `${Math.max(a4HeightPx, fullPageHeight)}px`;

    page.style.minHeight = heightPx;
    if (canvasBackground) {
      page.style.background = canvasBackground;
      page.style.backgroundColor = canvasBackground;
    }

    const canvasRoot = page.querySelector('.pdf-canvas-root') as HTMLElement | null;
    if (canvasRoot) {
      canvasRoot.style.minHeight = heightPx;
      if (canvasBackground) {
        canvasRoot.style.background = canvasBackground;
        canvasRoot.style.backgroundColor = canvasBackground;
      }
    }
  }

  private pdfHtml2PdfOptions(
    filename: string,
    canvasBackground: string | null = null,
  ) {
    return {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.92 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        logging: false,
        backgroundColor: canvasBackground,
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          'h1',
          'h2',
          'h3',
          'h4',
          '.pdf-section-block',
          'tr',
          'thead',
          'blockquote',
          'pre',
          'img',
          'svg',
          'table',
        ],
      },
    };
  }

  /**
   * Genera PDF PROFESIONAL desde contenido (Markdown o HTML)
   * El PDF es IDENTICO a la vista previa web
   */
  async generateMarkdownPdf(data: DocumentData): Promise<Blob> {
    // Convertir todas las imágenes externas a Base64 asíncronamente para evitar errores CORS en html2canvas
    const dataCopy = { ...data };
    if (dataCopy.pdfBackgroundImageUrl) {
      dataCopy.pdfBackgroundImageUrl = await this.imageUrlToBase64(dataCopy.pdfBackgroundImageUrl);
    }
    if (dataCopy.coverConfig) {
      const cover = { ...dataCopy.coverConfig };
      if (typeof cover['logoUrl'] === 'string') {
        cover['logoUrl'] = await this.imageUrlToBase64(cover['logoUrl']);
      }
      if (typeof cover['backgroundImageUrl'] === 'string') {
        cover['backgroundImageUrl'] = await this.imageUrlToBase64(cover['backgroundImageUrl']);
      }
      dataCopy.coverConfig = cover;
    }
    if (dataCopy.signatureConfig) {
      const sig = { ...dataCopy.signatureConfig };
      if (typeof sig['signatureImageUrl'] === 'string') {
        sig['signatureImageUrl'] = await this.imageUrlToBase64(sig['signatureImageUrl']);
      }
      dataCopy.signatureConfig = sig;
    }
    data = dataCopy;

    // Determinar si el contenido es HTML o Markdown
    const isHtml =
      data.contentEditorMode === 'html' ||
      data.contentEditorMode === 'plain' ||
      /<\/?[a-z][\s\S]*>/i.test(data.content || '');
    let htmlContent = '';

    const markedOpts = { gfm: true, breaks: true };
    if (typeof marked?.parse === 'function') {
      marked.setOptions?.(markedOpts);
    }

    if (isHtml) {
      htmlContent = this.prepareHtmlContentForPdf(data.content || '', data);
    } else {
      htmlContent = marked.parse(data.content || '', markedOpts);
      htmlContent = this.applyCorporateCoverVisibility(htmlContent, data);
      htmlContent = enrichDocumentHtmlForStyling(htmlContent);
    }

    htmlContent = this.prepareHtmlForPdfPagination(htmlContent);

const title = escapeHtml(data.title || 'Documento');
     const { css: mergedCss, canvasBackground } = this.resolvePdfStyles(data);
     const headerFooterHtml = this.buildPdfHeaderFooterHtml(data);

     const styleCss = data.pdfStyleId
       ? this.templates.getPdfStyleCss(data.pdfStyleId)
       : '';

     const presetCss = this.stylePresetCssForPdf(
       typeof data.quickStylePreset === 'string' ? data.quickStylePreset : '',
     );

const headerFooterCss = this.buildHeaderFooterCss(data);
     const coverHtml = this.buildCoverHtml(data);

     const pdfTemplate = `
       <!DOCTYPE html>
       <html>
       <head>
         <meta charset="UTF-8">
         <title>${title}</title>
         <link rel="preconnect" href="https://fonts.googleapis.com">
         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
         <style>
           ${PDF_EXPORT_BASE_CSS}
           ${this.getPdfPaginationCss()}
           ${headerFooterCss}
           ${presetCss}
           ${styleCss}
           ${mergedCss}
         </style>
       </head>
       <body>
         ${coverHtml}
         ${headerFooterHtml}
         ${this.buildWatermarkHtml(data)}
         <div class="pdf-canvas-root">
           <div class="pdf-body-content markdown-preview">
             ${htmlContent}
           </div>
         </div>
       </body>
       </html>
     `;

     return this.htmlToPdfBlob(
       pdfTemplate,
       data.title || 'documento',
       canvasBackground,
     );
   }

  private prepareHtmlContentForPdf(content: string, data: DocumentData): string {
    if (data.contentEditorMode === 'html') {
      return this.stripWrappingHtmlFence(content);
    }

    return this.applyCorporateCoverVisibility(
      this.stripWrappingHtmlFence(content),
      data,
    );
  }

  private stripWrappingHtmlFence(content: string): string {
    const trimmed = content.trim();
    const match = /^```(?:html)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
    return match ? match[1].trim() : content;
  }

  private buildHeaderFooterCss(data: DocumentData): string {
    const hf = (data as Record<string, unknown>)['headerFooterConfig'] as Record<string, unknown> | undefined;
    if (!hf || hf['enabled'] !== true) return '';

    const fontSize = typeof hf['fontSize'] === 'string' ? hf['fontSize'] : '9pt';
    const textColor = typeof hf['textColor'] === 'string' ? hf['textColor'] : '#64748b';
    const showPageNumbers = hf['showPageNumbers'] !== false;
    const showDivider = hf['showDivider'] !== false;

    const dividerColor = textColor;
    const footerBackground = hf['backgroundColor'] && hf['backgroundColor'] !== 'transparent' ? hf['backgroundColor'] : 'rgba(255,255,255,0.92)';
    const headerBackground = footerBackground;

    return `
      .pdf-body-content {
        padding-top: 24mm;
        padding-bottom: 24mm;
      }
      .pdf-page-header,
      .pdf-page-footer {
        position: fixed;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 8px 15mm;
        font-size: ${fontSize};
        color: ${textColor};
        background: ${headerBackground};
        z-index: 10;
      }
      .pdf-page-header {
        top: 0;
        ${showDivider ? `border-bottom: 1px solid ${dividerColor};` : ''}
      }
      .pdf-page-footer {
        bottom: 0;
        ${showDivider ? `border-top: 1px solid ${dividerColor};` : ''}
      }
      .pdf-page-header-left,
      .pdf-page-footer-left,
      .pdf-page-header-center,
      .pdf-page-footer-center,
      .pdf-page-header-right,
      .pdf-page-footer-right {
        min-width: 0;
        flex: 1;
      }
      .pdf-page-header-left,
      .pdf-page-footer-left { text-align: left; }
      .pdf-page-header-center,
      .pdf-page-footer-center { text-align: center; }
      .pdf-page-header-right,
      .pdf-page-footer-right { text-align: right; }
    `;
  }

  private buildPdfHeaderFooterHtml(data: DocumentData): string {
    const hf = (data as Record<string, unknown>)['headerFooterConfig'] as Record<string, unknown> | undefined;
    if (!hf || hf['enabled'] !== true) return '';

    const showPageNumbers = hf['showPageNumbers'] !== false;
    const format = typeof hf['pageNumberFormat'] === 'string' ? hf['pageNumberFormat'] : 'simple';
    const title = data.title || 'Documento';
    const date = this.formatDisplayDate(data.date);
    const author = data.client || '';

    const renderText = (value: unknown): string => {
      const text = String(value ?? '').trim();
      if (!text) return '';
      let escaped = escapeHtml(text)
        .replace(/\{title\}/g, escapeHtml(title))
        .replace(/\{date\}/g, escapeHtml(date))
        .replace(/\{author\}/g, escapeHtml(author));

      if (showPageNumbers) {
        escaped = escaped
          .replace(/\{page\}/g, '<span class="pdf-counter-page"></span>');
      } else {
        escaped = escaped.replace(/\{page\}|\{total\}/g, '');
      }

      return escaped;
    };

    const headerLeft = renderText(hf['headerLeft']);
    const headerCenter = renderText(hf['headerCenter']);
    const headerRight = renderText(hf['headerRight']);
    const footerLeft = renderText(hf['footerLeft']);
    const footerCenter = renderText(hf['footerCenter']);
    
    // Build automatic page text - just page number since total can't be known in CSS
    let autoPageText = '';
    if (showPageNumbers) {
      autoPageText = format === 'page-x'
        ? 'Pág. <span class="pdf-counter-page"></span>'
        : '<span class="pdf-counter-page"></span>';
    }
    const footerRight = renderText(hf['footerRight'] || autoPageText);

    return `
      <div class="pdf-page-header">
        <div class="pdf-page-header-left">${headerLeft}</div>
        <div class="pdf-page-header-center">${headerCenter}</div>
        <div class="pdf-page-header-right">${headerRight}</div>
      </div>
      <div class="pdf-page-footer">
        <div class="pdf-page-footer-left">${footerLeft}</div>
        <div class="pdf-page-footer-center">${footerCenter}</div>
        <div class="pdf-page-footer-right">${footerRight}</div>
      </div>
    `;
  }

  private stylePresetCssForPdf(preset: string): string {
    const presets: Record<string, string> = {
      corporate: `
.markdown-preview h1, .pdf-cover h1, .pdf-cover-page h1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 850;
  color: #111827;
  border-bottom: 2px solid rgba(122, 0, 0, 0.22);
  padding-bottom: 0.75rem;
}
.markdown-preview h1::before {
  background: linear-gradient(90deg, #7a0000, #ff3131);
}
.markdown-preview h2 {
  font-size: clamp(1.55rem, 2.5vw, 2rem);
  font-weight: 800;
  color: #1f2937;
  border-left: 5px solid #ff3131;
  padding-left: 0.85rem;
}
.markdown-preview h3 {
  color: #374151;
  font-weight: 750;
}
.markdown-preview table {
  border-radius: 12px;
  overflow: hidden;
}
.markdown-preview th {
  background: #7a0000;
  color: #ffffff;
}
.markdown-preview blockquote {
  background: #fff1f1;
  border-left-color: #ff3131;
  color: #5b0000;
}
`,
      compact: `
.markdown-preview h1, .pdf-cover h1, .pdf-cover-page h1 { font-size: 1.8rem; margin: 1rem 0 0.6rem; }
.markdown-preview h2 { font-size: 1.35rem; margin: 0.85rem 0 0.45rem; }
.markdown-preview h3 { font-size: 1.1rem; margin: 0.7rem 0 0.35rem; }
.markdown-preview p, .markdown-preview ul, .markdown-preview ol, .markdown-preview table { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.markdown-preview th, .markdown-preview td { padding: 0.4rem 0.55rem; }
`,
      large: `
.markdown-preview h1, .pdf-cover h1, .pdf-cover-page h1 { font-size: clamp(2.5rem, 5vw, 3.35rem); }
.markdown-preview h2 { font-size: clamp(1.85rem, 3vw, 2.35rem); }
.markdown-preview h3 { font-size: 1.55rem; }
.markdown-preview th, .markdown-preview td { padding: 0.8rem 1rem; }
`,
    };
    return presets[preset] ?? '';
  }

private buildCoverHtml(data: DocumentData): string {
    const cover = (data as Record<string, unknown>)['coverConfig'] as Record<string, unknown> | undefined;
    if (!cover || cover['enabled'] !== true) return '';

    const title = escapeHtml(typeof cover['title'] === 'string' ? cover['title'] : data.title || 'Documento');
    const subtitle = escapeHtml(typeof cover['subtitle'] === 'string' ? cover['subtitle'] : '');
    const author = escapeHtml(typeof cover['author'] === 'string' ? cover['author'] : '');
    const date = escapeHtml(typeof cover['date'] === 'string' ? cover['date'] : this.formatDisplayDate(data.date));
    const logoUrl = typeof cover['logoUrl'] === 'string' ? cover['logoUrl'] : '';
    const textColor = typeof cover['textColor'] === 'string' ? cover['textColor'] : '#ffffff';
    const showDivider = cover['showDivider'] !== false;
    const showDate = cover['showDate'] !== false;
    const showAuthor = cover['showAuthor'] !== false;
    const layout = typeof cover['layout'] === 'string' ? cover['layout'] : 'centered';
    const titleFontSize = typeof cover['htmlTitleFontSize'] === 'string' ? cover['htmlTitleFontSize'] : '2.5rem';
    const subtitleFontSize = typeof cover['htmlSubtitleFontSize'] === 'string' ? cover['htmlSubtitleFontSize'] : '1.1rem';

    let backgroundStyle = 'background: linear-gradient(135deg, #420000 0%, #7a0000 100%);';
    const bgType = typeof cover['backgroundType'] === 'string' ? cover['backgroundType'] : 'gradient';
    if (bgType === 'solid' && typeof cover['backgroundColor'] === 'string') {
      backgroundStyle = `background: ${cover['backgroundColor']};`;
    } else if (bgType === 'gradient' && typeof cover['gradientFrom'] === 'string' && typeof cover['gradientTo'] === 'string') {
      backgroundStyle = `background: linear-gradient(135deg, ${cover['gradientFrom']}, ${cover['gradientTo']});`;
    } else if (bgType === 'image' && typeof cover['backgroundImageUrl'] === 'string') {
      const imageUrl = cover['backgroundImageUrl'].replace(/"/g, '%22').replace(/'/g, '%27');
      backgroundStyle = `background: url('${imageUrl}') center/cover no-repeat; background-clip: border-box;`;
    }

    const textAlign = layout === 'left-aligned' ? 'left' : 'center';
    const metadataParts = [
      showAuthor && author ? `<span class="cover-meta-item">Autor: ${author}</span>` : '',
      showDate && date ? `<span class="cover-meta-item">Fecha: ${date}</span>` : '',
    ].filter(Boolean).join(showAuthor && showDate ? ' · ' : '');

    return `
      <div class="pdf-cover-page" style="${backgroundStyle} height: 297mm; min-height: 297mm; color: ${textColor}; display: flex; align-items: center; justify-content: center; padding: 32px;">
        <div class="cover-container" style="text-align: ${textAlign}; width: 100%; max-width: 660px;">
          <div class="cover-header">
            ${logoUrl ? `<img src="${logoUrl}" class="cover-logo" style="max-width: 120px; object-fit: contain; margin-bottom: 0.75rem;" alt="Logo"/>` : ''}
            <h1 style="font-size: ${titleFontSize}; font-weight: 800; margin: 0 0 1rem; letter-spacing: -0.03em; color: ${textColor}; word-break: break-word; max-width: 100%;">${title}</h1>
            ${subtitle ? `<p style="font-size: ${subtitleFontSize}; margin: 0; opacity: 0.92; color: ${textColor}; word-break: break-word; max-width: 100%;">${subtitle}</p>` : ''}
          </div>
          ${showDivider ? `<div style="width: 80px; height: 3px; background: ${textColor}; opacity: 0.4; border-radius: 999px; margin: 1rem auto;"></div>` : ''}
          ${metadataParts ? `<div style="font-size: 0.875rem; opacity: 0.88; margin-top: 0.5rem; color: ${textColor};">${metadataParts}</div>` : ''}
        </div>
      </div>
    `;
  }

   private buildWatermarkHtml(data: DocumentData): string {
     const wm = (data as Record<string, unknown>)['watermarkConfig'] as Record<string, unknown> | undefined;
     if (!wm || wm['enabled'] !== true || !wm['text']) return '';

     const text = String(wm['text'] || '');
     const opacity = Math.max(0.05, Math.min(0.5, typeof wm['opacity'] === 'number' ? wm['opacity'] : 0.1));
     const fontSize = typeof wm['fontSize'] === 'number' ? wm['fontSize'] : 48;
     const rotation = typeof wm['rotation'] === 'number' ? wm['rotation'] : -45;
     const color = typeof wm['color'] === 'string' ? wm['color'] : '#000000';

     return `
<div class="pdf-watermark" style="
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${rotation}deg);
  font-size: ${fontSize}px;
  color: ${color};
  opacity: ${opacity};
  pointer-events: none;
  user-select: none;
  z-index: -1;
  white-space: nowrap;
  font-weight: 700;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
">${text}</div>`;
   }

  private applyCorporateCoverVisibility(
    html: string,
    data: DocumentData,
  ): string {
    // Remove cover elements from document content when coverConfig is provided
    // to prevent duplicate covers in PDF
    const cover = data.coverConfig as { enabled?: boolean } | undefined;
    if (!cover?.enabled) {
      return html;
    }

    if (!/class\s*=\s*["'][^"']*\b(pdf-cover|cover)\b[^"']*/i.test(html)) {
      return html;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('.pdf-cover, .pdf-cover-page, .cover').forEach((coverEl) => coverEl.remove());
    return wrapper.innerHTML;
  }

  async generateQuotePdf(data: DocumentData): Promise<Blob> {
    const htmlContent = this.buildQuoteHtml(data);
    return this.generatePdfFromHtml(htmlContent, data);
  }

  async generateDocumentationPdf(data: DocumentData): Promise<Blob> {
    return this.generateMarkdownPdf(data);
  }

  async generateProposalPdf(data: DocumentData): Promise<Blob> {
    const htmlContent = this.buildProposalHtml(data);
    return this.generatePdfFromHtml(htmlContent, data);
  }

  async generateArchitecturePdf(data: DocumentData): Promise<Blob> {
    const htmlContent = await this.buildArchitectureHtml(data);
    return this.generatePdfFromHtml(htmlContent, data);
  }

  private async buildArchitectureHtml(data: DocumentData): Promise<string> {
    let html = '';
    const e = (s?: string) => escapeHtml(s ?? '');

    if (data.systemOverview) {
      const t = e(data.systemOverview);
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Resumen del Sistema</h3>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 1rem; border-left: 4px solid #3b82f6;">
            <p style="color: #1e40af; white-space: pre-wrap;">${t}</p>
          </div>
        </div>
      `;
    }

    if (data.architectureDiagram) {
      const t = e(data.architectureDiagram);
      html += `
        <div style="margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Diagrama de Arquitectura</h4>
          <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem;">
            <pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 4px; font-size: 9pt; font-family: monospace; white-space: pre-wrap;">${t}</pre>
          </div>
        </div>
      `;
    }

    if (data.dataFlow) {
      const t = e(data.dataFlow);
      html += `
        <div style="margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Diagrama de Flujo de Datos</h4>
          <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem;">
            <pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 4px; font-size: 9pt; font-family: monospace; white-space: pre-wrap;">${t}</pre>
          </div>
        </div>
      `;
    }

    if (data.components || data.technologies) {
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          ${
            data.components
              ? `
            <div>
              <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Componentes del Sistema</h4>
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 1rem; border-left: 4px solid #22c55e;">
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${e(data.components)}</p>
              </div>
            </div>
          `
              : ''
          }
          ${
            data.technologies
              ? `
            <div>
              <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Tecnologías Utilizadas</h4>
              <div style="background-color: #faf5ff; border-radius: 8px; padding: 1rem; border-left: 4px solid #a855f7;">
                <p style="color: #7c3aed; white-space: pre-wrap; font-size: 11pt; font-weight: 600;">${e(data.technologies)}</p>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    if (data.apis) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">APIs y Endpoints</h4>
          <div style="background-color: #fff7ed; border-radius: 8px; padding: 1rem; border-left: 4px solid #f97316;">
            <p style="color: #9a3412; white-space: pre-wrap; font-size: 11pt;">${e(data.apis)}</p>
          </div>
        </div>
      `;
    }

    return html;
  }

  private buildProposalHtml(data: DocumentData): string {
    let html = '';
    const e = (s?: string) => escapeHtml(s ?? '');

    if (data.executiveSummary) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Resumen Ejecutivo</h3>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 1rem; border-left: 4px solid #3b82f6;">
            <p style="color: #1e40af; white-space: pre-wrap;">${e(data.executiveSummary)}</p>
          </div>
        </div>
      `;
    }

    if (data.objectives || data.scope) {
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          ${
            data.objectives
              ? `
            <div>
              <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Objetivos</h4>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${e(data.objectives)}</p>
              </div>
            </div>
          `
              : ''
          }
          ${
            data.scope
              ? `
            <div>
              <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Alcance del Proyecto</h4>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${e(data.scope)}</p>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    if (data.deliverables || data.timeline || data.pricing) {
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          ${
            data.deliverables
              ? `
            <div>
              <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Entregables</h4>
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 1rem; border-left: 4px solid #22c55e;">
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${e(data.deliverables)}</p>
              </div>
            </div>
          `
              : ''
          }
          <div>
            ${
              data.timeline
                ? `
              <div style="margin-bottom: 1rem;">
                <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Cronograma</h4>
                <div style="background-color: #faf5ff; border-radius: 8px; padding: 1rem;">
                  <p style="color: #7c3aed; font-weight: 600;">${e(data.timeline)}</p>
                </div>
              </div>
            `
                : ''
            }
            ${
              data.pricing
                ? `
              <div>
                <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Precios</h4>
                <div style="background-color: #fffbeb; border-radius: 8px; padding: 1rem;">
                  <p style="color: #d97706; font-weight: 600;">${e(data.pricing)}</p>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;
    }

    if (data.terms) {
      html += `
        <div>
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Términos y Condiciones</h4>
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 1rem; border-left: 4px solid #ef4444;">
            <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${e(data.terms)}</p>
          </div>
        </div>
      `;
    }

    return html;
  }

  private buildQuoteHtml(data: DocumentData): string {
    const project = escapeHtml(data.projectName ?? '');
    const desc = escapeHtml(data.description ?? '');
    const rawAmt = data.totalAmount;
    const num =
      typeof rawAmt === 'number'
        ? rawAmt
        : parseFloat(String(rawAmt ?? '').replace(/\s/g, '').replace(',', '.'));
    const amountStr = Number.isFinite(num)
      ? num.toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR',
        })
      : '';
    return `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Presupuesto del Proyecto</h3>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <span style="font-weight: 600; color: #374151;">Proyecto:</span>
              <p style="color: #111827; margin-top: 0.25rem;">${project}</p>
            </div>
            <div>
              <span style="font-weight: 600; color: #374151;">Monto Total:</span>
              <p style="color: #111827; margin-top: 0.25rem; font-size: 16pt; font-weight: 600; color: #16a34a;">
                ${amountStr}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Descripción:</h4>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
          <p style="color: #111827; white-space: pre-wrap;">${desc}</p>
        </div>
      </div>
    `;
  }

  private async generatePdfFromHtml(
    htmlContent: string,
    data: DocumentData,
  ): Promise<Blob> {
    const bodyHtml = this.prepareHtmlForPdfPagination(htmlContent);

    const title = escapeHtml(data.title || 'Documento');
    const metaDate = escapeHtml(this.formatDisplayDate(data.date));
    const metaClient = escapeHtml(
      data.subtitle || data.client || 'Josanz ERP',
    );

    const { css: mergedCss, canvasBackground } = this.resolvePdfStyles(data);

    const styleCss = data.pdfStyleId
      ? this.templates.getPdfStyleCss(data.pdfStyleId)
      : '';

    const pdfTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          html,
          body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            font-family:
              'Segoe UI',
              system-ui,
              -apple-system,
              'Helvetica Neue',
              sans-serif;
            line-height: 1.62;
            color: #1e293b;
            font-size: 11.5pt;
            letter-spacing: 0.01em;
          }
          h1 {
            font-size: 20pt;
            font-weight: 800;
            margin: 1.25rem 0 0.65rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
            color: #0f172a;
            letter-spacing: -0.02em;
          }
          h2 {
            font-size: 18pt;
            font-weight: 700;
            margin: 1rem 0 0.5rem 0;
            color: #1e293b;
          }
          h3 {
            font-size: 15pt;
            font-weight: 600;
            margin: 0.85rem 0 0.45rem 0;
            color: #334155;
          }
          p {
            margin: 0.5rem 0;
            line-height: 1.65;
            text-align: justify;
            orphans: 3;
            widows: 3;
          }
          table {
            page-break-inside: auto;
            border-collapse: collapse;
            width: 100%;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
          .pdf-header {
            text-align: center;
            margin-bottom: 1.75rem;
            padding: 1.35rem 1.25rem 1.25rem;
            border-radius: 12px;
            background: linear-gradient(
              165deg,
              #f8fafc 0%,
              #f1f5f9 45%,
              #eef2f7 100%
            );
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          }
          .pdf-header::before {
            content: '';
            display: block;
            height: 4px;
            margin: -1.35rem -1.25rem 1rem -1.25rem;
            border-radius: 12px 12px 0 0;
            background: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #0ea5e9 100%);
          }
          .pdf-header h1 {
            border: none;
            margin: 0;
            padding: 0;
            font-size: 22pt;
            color: #0f172a;
            letter-spacing: -0.02em;
          }
          .pdf-meta {
            font-size: 9.5pt;
            color: #64748b;
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem 0.65rem;
            justify-content: center;
            margin-top: 0.85rem;
          }
          .pdf-meta span {
            display: inline-block;
            padding: 0.25rem 0.65rem;
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            color: #475569;
          }
          ${this.getPdfPaginationCss()}
          .pdf-doc-footer {
            margin-top: 2.25rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 8.5pt;
            color: #94a3b8;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .pdf-doc-footer::before {
            content: '';
            display: block;
            width: 48px;
            height: 3px;
            margin: 0 auto 0.65rem;
            border-radius: 2px;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
          }
          ${mergedCss}
          ${styleCss}
        </style>
      </head>
      <body>
        <div class="pdf-canvas-root">
          <div class="pdf-header">
            <h1>${title}</h1>
            <div class="pdf-meta">
              <span>Fecha: ${metaDate}</span>
              <span>${metaClient}</span>
            </div>
          </div>

          <div class="pdf-body-content markdown-preview">
          ${bodyHtml}
          </div>

          <footer class="pdf-doc-footer">Documento generado con Josanz ERP</footer>
        </div>
      </body>
      </html>
    `;

    return this.htmlToPdfBlob(
      pdfTemplate,
      data.title || 'documento',
      canvasBackground,
    );
  }

  private async imageUrlToBase64(url: string): Promise<string> {
    if (!url || typeof url !== 'string' || url.startsWith('data:')) {
      return url;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to convert image to base64:', url, e);
      return url;
    }
  }

  downloadPdf(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}




