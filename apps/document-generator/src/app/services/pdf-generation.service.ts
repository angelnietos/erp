import { Injectable } from '@angular/core';

declare const html2pdf: any;
declare const marked: any;

interface DocumentData {
  title?: string;
  content?: string;
  date?: string;
  client?: string;
  type?: string;
  projectName?: string;
  totalAmount?: number;
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
}

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  /**
   * Genera PDF PROFESIONAL desde Markdown
   * El PDF es IDENTICO a la vista previa web
   */
  async generateMarkdownPdf(data: DocumentData): Promise<Blob> {
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
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>

        <div class="pdf-header">
          <h1>${data.title || 'Documento'}</h1>
          <div class="pdf-meta">
            <span>Fecha: ${data.date || new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        ${htmlContent}
      </body>
      </html>
    `;

    // Opciones de PDF profesionales - SIN PAGINA EN BLANCO
    const options = {
      margin: [20, 15, 20, 15],
      filename: `${data.title || 'documento'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: 'css',
        before: '.page-break-before',
        avoid: 'h1, h2, h3, pre, blockquote',
      },
    };

    // Generamos el PDF desde el HTML
    const worker = html2pdf().set(options);
    const pdfBlob = await worker.from(pdfTemplate).outputPdf('blob');
    return pdfBlob;
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

    if (data.systemOverview) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Resumen del Sistema</h3>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 1rem; border-left: 4px solid #3b82f6;">
            <p style="color: #1e40af; white-space: pre-wrap;">${data.systemOverview}</p>
          </div>
        </div>
      `;
    }

    if (data.architectureDiagram) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Diagrama de Arquitectura</h4>
          <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem;">
            <pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 4px; font-size: 9pt; font-family: monospace; white-space: pre-wrap;">${data.architectureDiagram}</pre>
          </div>
        </div>
      `;
    }

    if (data.dataFlow) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Diagrama de Flujo de Datos</h4>
          <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem;">
            <pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 4px; font-size: 9pt; font-family: monospace; white-space: pre-wrap;">${data.dataFlow}</pre>
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
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${data.components}</p>
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
                <p style="color: #7c3aed; white-space: pre-wrap; font-size: 11pt; font-weight: 600;">${data.technologies}</p>
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
            <p style="color: #9a3412; white-space: pre-wrap; font-size: 11pt;">${data.apis}</p>
          </div>
        </div>
      `;
    }

    return html;
  }

  private buildProposalHtml(data: DocumentData): string {
    let html = '';

    if (data.executiveSummary) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Resumen Ejecutivo</h3>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 1rem; border-left: 4px solid #3b82f6;">
            <p style="color: #1e40af; white-space: pre-wrap;">${data.executiveSummary}</p>
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
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${data.objectives}</p>
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
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${data.scope}</p>
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
                <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${data.deliverables}</p>
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
                  <p style="color: #7c3aed; font-weight: 600;">${data.timeline}</p>
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
                  <p style="color: #d97706; font-weight: 600;">${data.pricing}</p>
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
            <p style="color: #111827; white-space: pre-wrap; font-size: 11pt;">${data.terms}</p>
          </div>
        </div>
      `;
    }

    return html;
  }

  private buildQuoteHtml(data: DocumentData): string {
    return `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 18pt; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Presupuesto del Proyecto</h3>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <span style="font-weight: 600; color: #374151;">Proyecto:</span>
              <p style="color: #111827; margin-top: 0.25rem;">${data.projectName || ''}</p>
            </div>
            <div>
              <span style="font-weight: 600; color: #374151;">Monto Total:</span>
              <p style="color: #111827; margin-top: 0.25rem; font-size: 16pt; font-weight: 600; color: #16a34a;">
                ${data.totalAmount ? data.totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Descripción:</h4>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 1rem;">
          <p style="color: #111827; white-space: pre-wrap;">${data.description || ''}</p>
        </div>
      </div>
    `;
  }

  private async generatePdfFromHtml(
    htmlContent: string,
    data: DocumentData,
  ): Promise<Blob> {
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
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>

        <div class="pdf-header">
          <h1>${data.title || 'Documento'}</h1>
          <div class="pdf-meta">
            <span>Fecha: ${data.date || new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        ${htmlContent}
      </body>
      </html>
    `;

    const options = {
      margin: [20, 15, 20, 15],
      filename: `${data.title || 'documento'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: 'css',
        before: '.page-break-before',
        avoid: 'h1, h2, h3',
      },
    };

    const worker = html2pdf().set(options);
    const pdfBlob = await worker.from(pdfTemplate).outputPdf('blob');
    return pdfBlob;
  }

  downloadPdf(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
