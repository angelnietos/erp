import { Injectable } from '@angular/core';
import type { ExportBlock, ImportResult } from './universal-document.service';

export interface WordImportResult {
  html: string;
  warnings: string[];
  plainText: string;
}

@Injectable({ providedIn: 'root' })
export class WordImportService {
  async importDocx(file: File): Promise<WordImportResult> {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = (await import('mammoth')).default;
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1.doc-block.doc-heading:fresh",
            "p[style-name='Heading 2'] => h2.doc-block.doc-section-title:fresh",
            "p[style-name='Heading 3'] => h3.doc-block.doc-subsection-title:fresh",
            'b => strong',
            'i => em',
          ],
        },
      ),
      mammoth.extractRawText({ arrayBuffer }),
    ]);

    const warnings = [
      ...htmlResult.messages.map((m) => m.message),
      ...textResult.messages.map((m) => m.message),
    ].filter(Boolean);

    return {
      html: htmlResult.value.trim(),
      plainText: textResult.value.trim(),
      warnings,
    };
  }

  async toImportResult(file: File): Promise<ImportResult> {
    try {
      const { html, warnings, plainText } = await this.importDocx(file);
      if (!html && !plainText) {
        return {
          success: false,
          blocks: [],
          metadata: { filename: file.name, size: file.size },
          warnings: ['El archivo Word está vacío o no se pudo leer.'],
        };
      }

      return {
        success: true,
        blocks: [
          {
            type: 'html',
            content: html || `<p>${this.escapeHtml(plainText)}</p>`,
          },
        ],
        metadata: {
          filename: file.name,
          size: file.size,
          source: 'docx',
        },
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        blocks: [],
        metadata: { filename: file.name, size: file.size },
        warnings: [
          error instanceof Error
            ? error.message
            : 'No se pudo importar el documento Word.',
        ],
      };
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
