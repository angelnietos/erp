import { Injectable } from '@angular/core';
import { UniversalDocumentService } from './universal-document.service';

declare var html2pdf: any;

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  constructor(private universalDocumentService: UniversalDocumentService) {}

  /**
   * Genera PDF PROFESIONAL EXACTAMENTE IGUAL que la vista previa web
   * ✅ NUNCA USA MARKDOWN CRUDO - SIEMPRE USA LA VISTA RENDERIZADA
   */
  async generateMarkdownPdf(data: any): Promise<void> {
    // ✅ OBTENER SIEMPRE EL CONTENIDO DIRECTAMENTE DEL DOM RENDERIZADO
    // Buscar selectores múltiples por si alguno falla
    const previewContainer =
      document.querySelector('.prose.max-w-none') ||
      document.querySelector('.prose') ||
      document.querySelector('[class*="prose"]') ||
      document.querySelector('.document-preview-content');

    if (!previewContainer) {
      console.error('No se encontró la vista previa renderizada');
      return;
    }

    // ✅ COPIAMOS EXACTAMENTE LO QUE VE EL USUARIO EN PANTALLA
    const clonedContent = previewContainer.cloneNode(true) as HTMLElement;

    const blob = await this.universalDocumentService.exportRenderedHTMLToPDF(
      clonedContent.innerHTML,
      data.title || 'documento',
    );

    this.universalDocumentService.download(
      blob,
      `${data.title || 'documento'}.pdf`,
    );
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
