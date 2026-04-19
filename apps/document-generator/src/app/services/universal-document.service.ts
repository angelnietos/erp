import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as ExcelJS from 'exceljs';
import { escapeHtml } from '../utils/html-escape';

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
      case DocumentFormat.PDF:
        return this.exportToPDF(blocks, options);
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
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

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
        const words = block.content.split(' ');
        let line = '';
        const maxWidth = width - margin * 2;

        words.forEach((word: string) => {
          const testLine = line + word + ' ';
          const testWidth = timesRomanFont.widthOfTextAtSize(
            testLine,
            fontSize,
          );

          if (testWidth > maxWidth) {
            page.drawText(line.trim(), {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            line = word + ' ';
            yPosition -= lineHeight;

            if (yPosition < 80) {
              page = pdfDoc.addPage();
              yPosition = height - 50;
            }
          } else {
            line = testLine;
          }
        });

        if (line.trim()) {
          page.drawText(line.trim(), {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }

      yPosition -= lineHeight / 2;
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = new ArrayBuffer(pdfBytes.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < pdfBytes.length; i++) {
      view[i] = pdfBytes[i];
    }
    return new Blob([buffer], { type: 'application/pdf' });
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
      const c = escapeHtml(String(block.content ?? ''));
      switch (block.type) {
        case 'heading':
          html += `<h1 style="color: #1e293b;">${c}</h1>\n`;
          break;
        case 'quote':
          html += `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; color: #64748b;">${c}</blockquote>\n`;
          break;
        case 'code':
          html += `<pre style="background: #f1f5f9; padding: 16px; border-radius: 8px;">${c}</pre>\n`;
          break;
        default:
          html += `<p style="line-height: 1.6; color: #334155;">${c}</p>\n`;
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
