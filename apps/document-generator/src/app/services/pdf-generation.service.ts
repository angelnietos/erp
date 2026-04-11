import { Injectable } from '@angular/core';

declare var html2pdf: any;
declare var marked: any;

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  /**
   * Genera PDF PROFESIONAL desde Markdown
   * El PDF es IDENTICO a la vista previa web
   */
  async generateMarkdownPdf(data: any): Promise<void> {
    // Convertimos Markdown a HTML exactamente igual que la vista previa
    const htmlContent = marked.parse(data.content || '');

    // Plantilla PDF profesional con estilos idénticos
    const pdfTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 25mm 20mm 25mm 20mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            font-size: 12pt;
          }
          h1 {
            font-size: 22pt;
            font-weight: 800;
            margin: 1.5rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
            color: #0f172a;
            page-break-after: avoid;
          }
          h2 {
            font-size: 18pt;
            font-weight: 700;
            margin: 1.25rem 0 0.75rem 0;
            color: #1e293b;
            page-break-after: avoid;
          }
          h3 {
            font-size: 15pt;
            font-weight: 600;
            margin: 1rem 0 0.5rem 0;
            color: #334155;
            page-break-after: avoid;
          }
          p {
            margin: 0.75rem 0;
            line-height: 1.7;
            text-align: justify;
          }
          ul, ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }
          li {
            margin: 0.375rem 0;
          }
          blockquote {
            margin: 1rem 0;
            padding: 0.75rem 1rem;
            border-left: 4px solid #3b82f6;
            background-color: #eff6ff;
            border-radius: 0 0.5rem 0.5rem 0;
            color: #1e40af;
          }
          code {
            background-color: #f1f5f9;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-family: Consolas, monospace;
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
          pre code {
            background-color: transparent;
            color: #e2e8f0;
            padding: 0;
          }
          strong {
            font-weight: 700;
          }
          em {
            font-style: italic;
          }
          hr {
            margin: 1.5rem 0;
            border: none;
            border-top: 1px solid #e2e8f0;
          }
          a {
            color: #2563eb;
            text-decoration: underline;
          }
          .pdf-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .pdf-header h1 {
            border: none;
            margin: 0;
            padding: 0;
          }
          .pdf-meta {
            font-size: 10pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
          }
          .pdf-footer {
            position: running(footer);
            text-align: center;
            font-size: 9pt;
            color: #94a3b8;
          }
          @page {
            @bottom-center {
              content: element(footer);
            }
          }
        </style>
      </head>
      <body>
        <div class="pdf-footer">
          Generado por Josanz ERP | Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
        
        <div class="pdf-header">
          <h1>${data.title || 'Documento'}</h1>
          <div class="pdf-meta">
            <span>Cliente: ${data.client || 'Josanz ERP'}</span>
            <span>Fecha: ${data.date || new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        ${htmlContent}
      </body>
      </html>
    `;

    // Opciones de PDF profesionales
    const options = {
      margin: 15,
      filename: `${data.title || 'documento'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Generamos y descargamos el PDF
    const container = document.createElement('div');
    container.innerHTML = pdfTemplate;
    document.body.appendChild(container);

    try {
      await html2pdf().set(options).from(container).save();
    } finally {
      document.body.removeChild(container);
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
    // Método mantenido por compatibilidad
  }
}
