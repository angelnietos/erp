import { Injectable, inject } from '@angular/core';
import type { DocumentRenderInput } from '../models/document-render.models';
import { DocumentRenderService } from './document-render.service';
import { DocumentPdfApiService } from './document-pdf-api.service';
import { PdfGenerationService } from './pdf-generation.service';
import { TemplatesRegistryService } from './templates-registry.service';
import { buildRenderInputFromPersisted } from '../utils/document-render-input.utils';

/**
 * Pipeline único: vista previa, PDF e HTML descargable comparten el mismo
 * {@link DocumentRenderService#buildPdfExportHtml} (Playwright primario).
 */
@Injectable({ providedIn: 'root' })
export class DocumentExportOrchestratorService {
  private readonly documentRender = inject(DocumentRenderService);
  private readonly documentPdfApi = inject(DocumentPdfApiService);
  private readonly pdfFallback = inject(PdfGenerationService);
  private readonly templates = inject(TemplatesRegistryService);

  buildRenderInputFromPersisted(
    data: Record<string, unknown>,
  ): DocumentRenderInput {
    return buildRenderInputFromPersisted(data, this.templates.getPdfStyles());
  }

  buildPreviewSrcdoc(input: DocumentRenderInput): string {
    return this.documentRender.buildUnifiedPreviewSrcdoc(input);
  }

  buildExportHtml(input: DocumentRenderInput): string {
    return this.documentRender.buildPdfExportHtml(input);
  }

  async exportPdf(
    input: DocumentRenderInput,
    title: string,
  ): Promise<Blob> {
    const html = this.buildExportHtml(input);
    const safeTitle = title.trim() || 'Documento';
    try {
      return await this.documentPdfApi.exportPdf({
        title: safeTitle,
        html,
      });
    } catch (backendError) {
      console.warn(
        'Backend PDF failed, falling back to client renderer (same HTML)',
        backendError,
      );
      return this.pdfFallback.generateFromExportHtml(html, safeTitle);
    }
  }

  async exportPdfFromPersisted(
    data: Record<string, unknown>,
    title?: string,
  ): Promise<Blob> {
    const input = this.buildRenderInputFromPersisted(data);
    const docTitle =
      title ??
      (typeof data['title'] === 'string' ? data['title'] : 'Documento');
    return this.exportPdf(input, docTitle);
  }

  /** Descarga HTML con el mismo markup/CSS que el PDF. */
  exportHtmlFile(input: DocumentRenderInput, title: string): Blob {
    const html = this.buildExportHtml(input);
    return new Blob([html], { type: 'text/html;charset=utf-8' });
  }
}
