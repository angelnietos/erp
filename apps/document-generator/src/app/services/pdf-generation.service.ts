import { Injectable } from '@angular/core';
import { UniversalDocumentService } from './universal-document.service';

declare var html2pdf: any;
declare var marked: any;

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  constructor(private universalDocumentService: UniversalDocumentService) {}

  /**
   * Genera PDF PROFESIONAL EXACTAMENTE IGUAL que la vista previa web
   * NO usa markdown crudo - usa el HTML ya renderizado del DOM
   */
  async generateMarkdownPdf(data: any): Promise<void> {
    // Buscar el contenedor de vista previa que ya esta renderizado en pantalla
    const previewContainer = document.querySelector('.prose.max-w-none');

    if (previewContainer) {
      // Usar el contenido YA RENDERIZADO que el usuario esta viendo
      const clonedContent = previewContainer.cloneNode(true) as HTMLElement;

      const fullHtml = `
        <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: white; color: #1e293b; line-height: 1.6;">
          ${clonedContent.innerHTML}
        </div>
      `;

      const blob = await this.universalDocumentService.exportRenderedHTMLToPDF(
        fullHtml,
        data.title || 'documento',
      );

      this.universalDocumentService.download(
        blob,
        `${data.title || 'documento'}.pdf`,
      );
    } else {
      // Fallback si no hay vista previa visible
      const htmlContent = marked.parse(data.content || '');
      const blob = await this.universalDocumentService.exportRenderedHTMLToPDF(
        htmlContent,
        data.title || 'documento',
      );
      this.universalDocumentService.download(
        blob,
        `${data.title || 'documento'}.pdf`,
      );
    }
  }

  async generateQuotePdf(data: any): Promise<Uint8Array> {
    await this.generateMarkdownPdf(data);
    return new Uint8Array();
  }

  async generateDocumentationPdf(data: any): Promise<Uint8Array> {
    await this.generateMarkdownPdf(data);
    return new Uint8Array();
  }

  async generateProposalPdf(data: any): Promise<Uint8Array> {
    await this.generateMarkdownPdf(data);
    return new Uint8Array();
  }

  async generateArchitecturePdf(data: any): Promise<Uint8Array> {
    await this.generateMarkdownPdf(data);
    return new Uint8Array();
  }

  downloadPdf(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes as unknown as ArrayBuffer], {
      type: 'application/pdf',
    });
    this.universalDocumentService.download(blob, filename);
  }
}
