import { Injectable, inject } from '@angular/core';
import { escapeHtml } from '../utils/html-escape';
import {
  enrichDocumentHtmlForStyling,
  getHtml2CanvasBackground,
  readPdfBackgroundSettings,
  resolvePdfGenerationCss,
  type PdfBackgroundSettings,
} from '../utils/document-preview-css';
import { TemplatesRegistryService } from './templates-registry.service';
import type {
  Html2PdfFactory,
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
      return await html2pdf().set(options).from(page).outputPdf('blob');
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
        <style>
          :root {
            --markdown-font-size: 1.05rem;
            --markdown-line-height: 1.72;
            --markdown-color: #1f2937;
            --brand-primary: #7a0000;
            --brand-accent: #ff3131;
            --bg: #ffffff;
            --text: #1f2937;
            --text-soft: #475569;
            --border: #e2e8f0;
            --code-bg: #0f172a;
            --code-text: #f8fafc;
            --bg-soft: #f8f9fb;
          }
          ${headerFooterCss}
          * {
            box-sizing: border-box;
          }
          html {
            counter-reset: page;
          }
          body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            font-family: 'Inter', system-ui, -apple-system, 'Helvetica Neue', sans-serif;
            line-height: 1.68;
            color: #0f172a;
            font-size: 11.5pt;
            letter-spacing: 0.01em;
          }
          .pdf-page {
            counter-increment: page;
            position: relative;
          }
          .pdf-page-number {
            position: absolute;
            bottom: 12mm;
            width: 100%;
            text-align: center;
            font-size: 9pt;
            color: #64748b;
          }
          .pdf-page-number::after {
            content: "Página " counter(page);
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
          h4 {
            font-size: 14pt;
            font-weight: 600;
            margin: 0.65rem 0 0.35rem 0;
            color: #475569;
          }
          p {
            margin: 0.5rem 0;
            line-height: 1.65;
            text-align: justify;
            orphans: 3;
            widows: 3;
          }
          ul, ol { margin: 0.75rem 0; padding-left: 1.5rem; }
          li { margin: 0.375rem 0; }
          blockquote {
            margin: 0.65rem 0;
            padding: 0.65rem 1rem;
            border-left: 4px solid #3b82f6;
            background-color: #eff6ff;
            border-radius: 0 0.5rem 0.5rem 0;
            color: #1e40af;
            page-break-inside: auto;
          }
          code {
            background-color: #f1f5f9;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-family: Consolas, 'JetBrains Mono', monospace;
            font-size: 11pt;
            color: #dc2626;
          }
          pre {
            margin: 1rem 0;
            padding: 1rem;
            background-color: #0f172a;
            border-radius: 0.5rem;
            overflow-x: auto;
            page-break-inside: avoid;
          }
          pre code { background-color: transparent; color: #e2e8f0; padding: 0; }
          strong, b { font-weight: 700; }
          em, i { font-style: italic; }
          u { text-decoration: underline; }
          s, strike { text-decoration: line-through; }
          hr { margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0; }
          a { color: #2563eb; text-decoration: underline; }
          a:hover { color: #1d4ed8; }
          table { width: 100%; border-collapse: collapse; margin: 0.65rem 0; page-break-inside: auto; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th {
            background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
            font-weight: 600;
            color: #1e293b;
            padding: 0.55rem 0.65rem;
            text-align: left;
            border: 1px solid #cbd5e1;
          }
          td {
            padding: 0.55rem 0.65rem;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
          }
          tr:nth-child(even) td { background-color: #f8fafc; }
          img { max-width: 100%; height: auto; page-break-inside: avoid; }
          .pdf-cover-page {
        page-break-after: always;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        box-sizing: border-box;
        text-align: center;
      }
      .pdf-cover-page h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 0 16px;
        letter-spacing: -0.03em;
      }
${this.getPdfPaginationCss()}
           ${presetCss}
           ${styleCss}
           ${mergedCss}
         </style>
      </head>
      <body>
        ${coverHtml}
        <div class="pdf-canvas-root">
          <div class="pdf-body-content document-preview-render markdown-preview">
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
    const pageFormat = typeof hf['pageNumberFormat'] === 'string' ? hf['pageNumberFormat'] : 'simple';

    const pageNumberSelector = showPageNumbers ? 'content: counter(page);' : 'content: none;';
    const totalPagesSelector = pageFormat === 'x-of-y' ? 'content: " de " counter(pages);' : '';
    const pagePrefixSelector = pageFormat === 'page-x' ? 'content: "Página " counter(page);' : '';

    let pageContent = pageNumberSelector;
    if (pageFormat === 'x-of-y') {
      pageContent = 'content: counter(page) " de " counter(pages);';
    } else if (pageFormat === 'page-x') {
      pageContent = 'content: "Página " counter(page);';
    }

    return `
      .pdf-header-fixed {
        position: running(pdf-header);
        font-size: ${fontSize};
        color: ${textColor};
        ${showDivider ? 'border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;' : ''}
      }
      .pdf-footer-fixed {
        position: running(pdf-footer);
        font-size: ${fontSize};
        color: ${textColor};
        text-align: center;
        ${showDivider ? 'border-top: 1px solid #e2e8f0; padding-top: 8px;' : ''}
      }
      .pdf-page-header {
        position: absolute;
        top: 10mm;
        left: 15mm;
        right: 15mm;
        font-size: ${fontSize};
        color: ${textColor};
        ${showDivider ? 'border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;' : ''}
      }
      .pdf-page-header-left { float: left; }
      .pdf-page-header-center { text-align: center; }
      .pdf-page-header-right { float: right; }
      .pdf-page-footer {
        position: absolute;
        bottom: 10mm;
        left: 15mm;
        right: 15mm;
        font-size: ${fontSize};
        color: ${textColor};
        text-align: center;
        ${showDivider ? 'border-top: 1px solid #e2e8f0; padding-top: 6px;' : ''}
      }
      .pdf-page-footer::before {
        ${pageContent}
      }
    `;
  }

  private stylePresetCssForPdf(preset: string): string {
    const presets: Record<string, string> = {
      corporate: `
.markdown-preview h1 {
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
.markdown-preview h1 { font-size: 1.8rem; margin: 1rem 0 0.6rem; }
.markdown-preview h2 { font-size: 1.35rem; margin: 0.85rem 0 0.45rem; }
.markdown-preview h3 { font-size: 1.1rem; margin: 0.7rem 0 0.35rem; }
.markdown-preview p, .markdown-preview ul, .markdown-preview ol, .markdown-preview table { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.markdown-preview th, .markdown-preview td { padding: 0.4rem 0.55rem; }
`,
      large: `
.markdown-preview h1 { font-size: clamp(2.5rem, 5vw, 3.35rem); }
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

    let backgroundStyle = 'background: linear-gradient(135deg, #420000 0%, #7a0000 100%);';
    const bgType = typeof cover['backgroundType'] === 'string' ? cover['backgroundType'] : 'gradient';
    if (bgType === 'solid' && typeof cover['backgroundColor'] === 'string') {
      backgroundStyle = `background: ${cover['backgroundColor']};`;
    } else if (bgType === 'gradient' && typeof cover['gradientFrom'] === 'string' && typeof cover['gradientTo'] === 'string') {
      backgroundStyle = `background: linear-gradient(135deg, ${cover['gradientFrom']}, ${cover['gradientTo']});`;
    } else if (bgType === 'image' && typeof cover['backgroundImageUrl'] === 'string') {
      backgroundStyle = `background: url('${cover['backgroundImageUrl']}') center/cover no-repeat;`;
    }

    const textAlign = layout === 'left-aligned' ? 'left' : 'center';

    return `
      <div class="pdf-cover-page" style="${backgroundStyle} height: 100vh; color: ${textColor}; display: flex; align-items: center; justify-content: center; padding: 60px;">
        <div style="text-align: ${textAlign}; max-width: 600px;">
          ${logoUrl ? `<img src="${logoUrl}" style="max-width: 140px; max-height: 70px; object-fit: contain; margin-bottom: 32px;" alt="Logo"/>` : ''}
          <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 16px; color: ${textColor};">${title}</h1>
          ${subtitle ? `<p style="font-size: 1.1rem; opacity: 0.9; margin: 0 0 24px; color: ${textColor};">${subtitle}</p>` : ''}
          ${showDivider ? `<div style="width: 80px; height: 4px; background: ${textColor}; opacity: 0.5; border-radius: 4px; margin: ${textAlign === 'center' ? '0 auto 24px' : '0 0 24px'};"></div>` : ''}
          <p style="font-size: 0.9rem; opacity: 0.85; color: ${textColor};">
            ${[showAuthor && author ? author : '', showDate && date ? date : ''].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    `;
  }

  private applyCorporateCoverVisibility(
    html: string,
    data: DocumentData,
  ): string {
    if (data.quickStylePreset === 'corporate') {
      return html;
    }

    if (!/class\s*=\s*["'][^"']*\bcover\b/i.test(html)) {
      return html;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('.cover').forEach((cover) => cover.remove());
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
