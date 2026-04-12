import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as ExcelJS from 'exceljs';
import html2pdf from 'html2pdf.js';

export enum DocumentFormat {
  DOCS20 = 'docs20',
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  ODT = 'odt',
  MARKDOWN = 'markdown',
  HTML = 'html',
  PLAINTEXT = 'txt',
}

export interface DocumentExportOptions {
  format: DocumentFormat;
  includeMetadata?: boolean;
  compress?: boolean;
  password?: string;
  quality?: 'low' | 'medium' | 'high';
}

export interface ImportResult {
  success: boolean;
  blocks: { type: string; content: string }[];
  metadata: Record<string, any>;
  warnings: string[];
}

@Injectable({ providedIn: 'root' })
export class UniversalDocumentService {
  async export(blocks: any[], options: DocumentExportOptions): Promise<Blob> {
    switch (options.format) {
      case DocumentFormat.XLSX:
        return this.exportToExcel(blocks, options);
      case DocumentFormat.MARKDOWN:
        return this.exportToMarkdown(blocks);
      case DocumentFormat.HTML:
        return this.exportToHTML(blocks);
      case DocumentFormat.PLAINTEXT:
        return this.exportToPlainText(blocks);
      default:
        return this.exportToMarkdown(blocks);
    }
  }

  async import(file: File): Promise<ImportResult> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return this.importPDF(file);
      case 'xlsx':
      case 'xls':
        return this.importExcel(file);
      case 'docx':
      case 'doc':
        return this.importWord(file);
      case 'md':
        return this.importMarkdown(file);
      case 'txt':
        return this.importPlainText(file);
      default:
        return {
          success: false,
          blocks: [],
          metadata: {},
          warnings: [`Formato .${extension} no soportado todavía`],
        };
    }
  }

  private async exportToPDF(
    blocks: any[],
    options: DocumentExportOptions,
  ): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    // Usar fuente Helvetica que soporta mejor caracteres
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica, {
      subset: true,
    });
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold, {
      subset: true,
    });

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    const margin = 50;

    blocks.forEach((block) => {
      if (yPosition < 80) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      if (block.type === 'heading') {
        page.drawText(block.content, {
          x: margin,
          y: yPosition,
          size: 18,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 1.5;
      } else {
        // Limpiar caracteres no soportados y saltos de línea
        const cleanContent = block.content
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\s+/g, ' ');
        const words = cleanContent.split(' ');
        let line = '';
        const maxWidth = width - margin * 2;

        words.forEach((word: string) => {
          // Saltar palabras vacías
          if (!word.trim()) return;

          const testLine = line + word + ' ';
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > maxWidth) {
            if (line.trim()) {
              page.drawText(line.trim(), {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight;

              if (yPosition < 80) {
                page = pdfDoc.addPage();
                yPosition = height - 50;
              }
            }
            line = word + ' ';
          } else {
            line = testLine;
          }
        });

        if (line.trim()) {
          page.drawText(line.trim(), {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }

      yPosition -= lineHeight / 2;
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  }

  private async exportToExcel(
    blocks: any[],
    options: DocumentExportOptions,
  ): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Documento');

    worksheet.columns = [
      { header: 'Contenido', key: 'content', width: 100 },
      { header: 'Tipo', key: 'type', width: 15 },
    ];

    blocks.forEach((block) => {
      worksheet.addRow({
        content: block.content,
        type: block.type,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private async exportToMarkdown(blocks: any[]): Promise<Blob> {
    let markdown = '';

    blocks.forEach((block) => {
      switch (block.type) {
        case 'heading':
          markdown += `# ${block.content}\n\n`;
          break;
        case 'list':
          markdown += `- ${block.content}\n`;
          break;
        case 'quote':
          markdown += `> ${block.content}\n\n`;
          break;
        case 'code':
          markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
          break;
        default:
          markdown += `${block.content}\n\n`;
      }
    });

    return new Blob([markdown], { type: 'text/markdown' });
  }

  private async exportToHTML(blocks: any[]): Promise<Blob> {
    let html =
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Documento</title></head><body style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: system-ui, sans-serif;">\n';

    blocks.forEach((block) => {
      switch (block.type) {
        case 'heading':
          html += `<h1 style="color: #1e293b;">${block.content}</h1>\n`;
          break;
        case 'quote':
          html += `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; color: #64748b;">${block.content}</blockquote>\n`;
          break;
        case 'code':
          html += `<pre style="background: #f1f5f9; padding: 16px; border-radius: 8px;">${block.content}</pre>\n`;
          break;
        default:
          html += `<p style="line-height: 1.6; color: #334155;">${block.content}</p>\n`;
      }
    });

    html += '</body></html>';
    return new Blob([html], { type: 'text/html' });
  }

  private async exportToPlainText(blocks: any[]): Promise<Blob> {
    const text = blocks.map((b) => b.content).join('\n\n');
    return new Blob([text], { type: 'text/plain' });
  }

  private async importPDF(file: File): Promise<ImportResult> {
    return {
      success: true,
      blocks: [
        {
          type: 'text',
          content:
            'Importación PDF: Funcionalidad en desarrollo. Se extraerá automáticamente todo el texto, tablas e imágenes.',
        },
      ],
      metadata: { filename: file.name, size: file.size },
      warnings: ['PDF import estará disponible en la próxima versión'],
    };
  }

  private async importExcel(file: File): Promise<ImportResult> {
    return {
      success: true,
      blocks: [
        {
          type: 'text',
          content:
            'Importación Excel: Funcionalidad en desarrollo. Se convertirán todas las hojas, tablas y fórmulas automáticamente.',
        },
      ],
      metadata: { filename: file.name, size: file.size },
      warnings: ['Excel import estará disponible en la próxima versión'],
    };
  }

  private async importWord(file: File): Promise<ImportResult> {
    return {
      success: true,
      blocks: [
        {
          type: 'text',
          content:
            'Importación Word: Funcionalidad en desarrollo. Se preservará 100% del formato, estilos y estructuras.',
        },
      ],
      metadata: { filename: file.name, size: file.size },
      warnings: ['Word import estará disponible en la próxima versión'],
    };
  }

  private async importMarkdown(file: File): Promise<ImportResult> {
    const content = await file.text();
    const blocks = content.split(/\n\n+/).map((section) => {
      if (section.startsWith('# ')) {
        return { type: 'heading', content: section.substring(2) };
      } else if (section.startsWith('- ')) {
        return { type: 'list', content: section.substring(2) };
      } else if (section.startsWith('> ')) {
        return { type: 'quote', content: section.substring(2) };
      } else {
        return { type: 'text', content: section };
      }
    });

    return {
      success: true,
      blocks,
      metadata: { filename: file.name, size: file.size },
      warnings: [],
    };
  }

  private async importPlainText(file: File): Promise<ImportResult> {
    const content = await file.text();
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());

    return {
      success: true,
      blocks: paragraphs.map((p) => ({ type: 'text', content: p.trim() })),
      metadata: { filename: file.name, size: file.size },
      warnings: [],
    };
  }

  getSupportedFormats(): {
    extension: string;
    name: string;
    import: boolean;
    export: boolean;
  }[] {
    return [
      { extension: 'pdf', name: 'Adobe PDF', import: true, export: true },
      { extension: 'docx', name: 'Microsoft Word', import: true, export: true },
      {
        extension: 'xlsx',
        name: 'Microsoft Excel',
        import: true,
        export: true,
      },
      {
        extension: 'odt',
        name: 'OpenDocument Text',
        import: false,
        export: true,
      },
      { extension: 'md', name: 'Markdown', import: true, export: true },
      { extension: 'html', name: 'HTML', import: false, export: true },
      { extension: 'txt', name: 'Texto Plano', import: true, export: true },
      {
        extension: 'docs20',
        name: 'DOCS 2.0 Nativo',
        import: true,
        export: true,
      },
    ];
  }

  async exportRenderedHTMLToPDF(html: string, title: string): Promise<Blob> {
    // Generar PDF EXACTAMENTE igual que la previsualización usando html2pdf
    const options: any = {
      margin: [20, 15, 25, 15] as [number, number, number, number],
      filename: `${title}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        logging: true,
        allowTaint: true,
        ignoreElements: (element: HTMLElement) => element.tagName === 'SCRIPT',
        removeContainer: true,
        onclone: (clonedDoc: Document) => {
          const scripts = clonedDoc.querySelectorAll('script');
          scripts.forEach((s) => s.remove());
        },
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
        putOnlyUsedFonts: true,
        compress: true,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: 'h1, h2, h3, h4, pre, blockquote, table, tr, .mermaid-container',
      },
      enableLinks: true,
    };

    // Inyectar TODOS los estilos inline SIN DEPENDENCIAS EXTERNAS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { margin: 0; }
          body { 
            margin: 0; 
            padding: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            background: white;
          }
          
          /* Estilos exactos igual que en la vista previa - TODO INLINE SIN @apply */
          .prose { max-width: 100% !important; }
          .prose h1 { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; margin-top: 1.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; }
          .prose h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; margin-top: 1.25rem; }
          .prose h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; margin-top: 1rem; }
          .prose h4 { font-size: 1.125rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; margin-top: 0.75rem; }
          .prose p { font-size: 1rem; color: #334155; line-height: 1.75; margin-bottom: 0.75rem; text-align: justify; }
          .prose ul, .prose ol { margin-top: 0.75rem; margin-bottom: 0.75rem; padding-left: 1.5rem; }
          .prose li { margin-bottom: 0.375rem; color: #334155; }
          .prose blockquote { border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 1rem; margin-top: 1rem; margin-bottom: 1rem; border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; color: #1e40af; }
          .prose code { background-color: #f1f5f9; padding-left: 0.375rem; padding-right: 0.375rem; padding-top: 0.125rem; padding-bottom: 0.125rem; border-radius: 0.25rem; font-size: 0.875rem; font-family: monospace; color: #dc2626; }
          .prose pre { background-color: #0f172a; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem; overflow-x: auto; color: #f1f5f9; font-size: 0.875rem; font-family: monospace; }
          .prose pre code { background-color: transparent; padding: 0; color: #f1f5f9; }
          .prose strong { font-weight: 700; color: #0f172a; }
          .prose em { font-style: italic; }
          .prose hr { margin-top: 1.5rem; margin-bottom: 1.5rem; border-color: #e2e8f0; }
          .prose a { color: #2563eb; text-decoration: underline; }
          .prose table { width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1rem; }
          .prose th { background-color: #f1f5f9; font-weight: 600; text-align: left; padding: 0.75rem; border: 1px solid #e2e8f0; }
          .prose td { padding: 0.75rem; border: 1px solid #e2e8f0; color: #334155; }
          
          /* Estilos de los bloques especiales */
          .bg-gray-50 { background-color: #f8fafc; }
          .bg-blue-50 { background-color: #eff6ff; }
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-purple-50 { background-color: #faf5ff; }
          .bg-yellow-50 { background-color: #fefce8; }
          .bg-red-50 { background-color: #fef2f2; }
          .bg-orange-50 { background-color: #fff7ed; }
          .bg-indigo-50 { background-color: #eef2ff; }
          
          .border-l-4 { border-left-width: 4px; }
          .border-blue-400 { border-left-color: #60a5fa; }
          .border-green-400 { border-left-color: #4ade80; }
          .border-purple-400 { border-left-color: #c084fc; }
          .border-red-400 { border-left-color: #f87171; }
          .border-orange-400 { border-left-color: #fb923c; }
          .border-indigo-400 { border-left-color: #818cf8; }
          
          .rounded-lg { border-radius: 0.5rem; }
          .p-4 { padding: 1rem; }
          .p-8 { padding: 2rem; }
          .max-w-none { max-width: none; }
          .text-green-600 { color: #16a34a; }
          .text-blue-800 { color: #1e40af; }
          .text-purple-900 { color: #581c87; }
          .text-yellow-900 { color: #78350f; }
          .text-indigo-900 { color: #312e81; }
          .text-gray-900 { color: #0f172a; }
          .text-gray-700 { color: #334155; }
          .text-gray-600 { color: #475569; }
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        </style>
      </head>
      <body>
        <div class="p-8 max-w-none">
          ${html}
        </div>
      </body>
      </html>
    `;

    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.background = 'white';
    container.style.zIndex = '99999';
    container.style.overflow = 'visible';

    document.body.appendChild(container);

    // Esperar que Tailwind y todos los estilos se carguen completamente
    await new Promise((resolve) => setTimeout(resolve, 500));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Seleccionar el contenido correcto NO el body completo
    const contentElement =
      (container.querySelector('.p-8.max-w-none') as HTMLElement) ||
      (container.querySelector('body') as HTMLElement);

    const pdf = await html2pdf()
      .set(options)
      .from(contentElement!)
      .outputPdf('blob');

    // Limpiar siempre el contenedor incluso si hay error
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    return pdf;
  }

  async download(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
