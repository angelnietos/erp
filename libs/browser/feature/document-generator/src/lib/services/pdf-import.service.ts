import { Injectable } from '@angular/core';
import type { ImportResult } from './universal-document.service';

@Injectable({ providedIn: 'root' })
export class PdfImportService {
  private workerConfigured = false;

  async importPdf(file: File): Promise<ImportResult> {
    try {
      const pdfjs = await import('pdfjs-dist');
      await this.ensureWorker(pdfjs);

      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data }).promise;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .filter(Boolean);
        if (strings.length > 0) {
          pageTexts.push(strings.join(' '));
        }
      }

      const fullText = pageTexts.join('\n\n').trim();
      if (!fullText) {
        return {
          success: false,
          blocks: [],
          metadata: { filename: file.name, size: file.size, pages: pdf.numPages },
          warnings: [
            'No se extrajo texto del PDF. Puede ser un escaneo — OCR no está disponible en v1.',
          ],
        };
      }

      const html = this.textToHtml(fullText);

      return {
        success: true,
        blocks: [{ type: 'html', content: html }],
        metadata: {
          filename: file.name,
          size: file.size,
          pages: pdf.numPages,
          source: 'pdf',
        },
        warnings:
          pdf.numPages > 1
            ? [`Importados ${pdf.numPages} páginas como texto plano.`]
            : [],
      };
    } catch (error) {
      return {
        success: false,
        blocks: [],
        metadata: { filename: file.name, size: file.size },
        warnings: [
          error instanceof Error
            ? error.message
            : 'No se pudo leer el PDF.',
        ],
      };
    }
  }

  private async ensureWorker(pdfjs: typeof import('pdfjs-dist')): Promise<void> {
    if (this.workerConfigured) {
      return;
    }
    const base =
      typeof document !== 'undefined' && document.baseURI
        ? new URL(document.baseURI).pathname.replace(/\/[^/]*$/, '/')
        : '/';
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}pdfjs/pdf.worker.min.mjs`;
    this.workerConfigured = true;
  }

  private textToHtml(text: string): string {
    return text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p class="doc-paragraph">${this.escapeHtml(p)}</p>`)
      .join('\n');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
