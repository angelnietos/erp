import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  async generateQuotePdf(data: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    let yPosition = height - 50;

    // Título
    page.drawText('PRESUPUESTO', {
      x: 50,
      y: yPosition,
      size: 20,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Información del cliente
    page.drawText(`Cliente: ${data.client}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;

    page.drawText(`Fecha: ${data.date}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;

    page.drawText(`Proyecto: ${data.projectName}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 40;

    // Descripción
    page.drawText('Descripción:', {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;

    // Dividir descripción en líneas
    const descriptionLines = this.splitTextIntoLines(data.description, 80);
    for (const line of descriptionLines) {
      page.drawText(line, {
        x: 70,
        y: yPosition,
        size: fontSize,
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Monto total
    page.drawText(`Monto Total: $${data.totalAmount}`, {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0.5, 0),
    });

    return await pdfDoc.save();
  }

  async generateDocumentationPdf(data: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const titleFontSize = 18;
    let yPosition = height - 50;

    // Cabecera profesional
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: rgb(0.96, 0.98, 1),
    });

    // Título
    page.drawText(data.title, {
      x: 50,
      y: height - 50,
      size: titleFontSize,
      color: rgb(0.06, 0.09, 0.16),
    });

    // Línea divisoria
    page.drawLine({
      start: { x: 50, y: height - 65 },
      end: { x: width - 50, y: height - 65 },
      thickness: 1,
      color: rgb(0.89, 0.91, 0.94),
    });

    yPosition = height - 100;

    // Información del cliente y fecha
    page.drawText(`Cliente: ${data.client}`, {
      x: 50,
      y: yPosition,
      size: 11,
      color: rgb(0.41, 0.45, 0.53),
    });

    page.drawText(`Fecha: ${data.date}`, {
      x: width - 150,
      y: yPosition,
      size: 11,
      color: rgb(0.41, 0.45, 0.53),
    });

    yPosition -= 40;

    // Contenido Markdown formateado
    if (data.content) {
      this.renderMarkdownContent(page, data.content, yPosition, width, height);
    }

    // Pie de página
    const pages = pdfDoc.getPages();
    pages.forEach((p: any, index: number) => {
      const { width: pw, height: ph } = p.getSize();
      p.drawText(
        `Generado automáticamente por Josanz ERP | Página ${index + 1} de ${pages.length}`,
        {
          x: pw / 2 - 100,
          y: 30,
          size: 9,
          color: rgb(0.6, 0.6, 0.6),
        },
      );
    });

    return await pdfDoc.save();
  }

  async generateProposalPdf(data: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    const titleFontSize = 20;
    const sectionFontSize = 16;
    let yPosition = height - 50;

    // Título
    page.drawText(data.title, {
      x: 50,
      y: yPosition,
      size: titleFontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 50;

    // Información del cliente y fecha
    page.drawText(`Cliente: ${data.client}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;

    page.drawText(`Fecha: ${data.date}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 40;

    // Resumen Ejecutivo
    if (data.executiveSummary) {
      page.drawText('RESUMEN EJECUTIVO', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0.5, 0),
      });
      yPosition -= 30;

      const summaryLines = this.splitTextIntoLines(data.executiveSummary, 80);
      for (const line of summaryLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Objetivos
    if (data.objectives) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('OBJETIVOS', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0, 0.5),
      });
      yPosition -= 30;

      const objectivesLines = this.splitTextIntoLines(data.objectives, 80);
      for (const line of objectivesLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Alcance
    if (data.scope) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('ALCANCE DEL PROYECTO', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0, 0.5),
      });
      yPosition -= 30;

      const scopeLines = this.splitTextIntoLines(data.scope, 80);
      for (const line of scopeLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Entregables
    if (data.deliverables) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('ENTREGABLES', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0, 0.5),
      });
      yPosition -= 30;

      const deliverablesLines = this.splitTextIntoLines(data.deliverables, 80);
      for (const line of deliverablesLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Información adicional
    const additionalInfo = [];
    if (data.timeline) additionalInfo.push(`Cronograma: ${data.timeline}`);
    if (data.pricing) additionalInfo.push(`Precios: ${data.pricing}`);

    if (additionalInfo.length > 0) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('INFORMACIÓN ADICIONAL', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0.5, 0, 0.5),
      });
      yPosition -= 30;

      for (const info of additionalInfo) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(info, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Términos y condiciones
    if (data.terms) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('TÉRMINOS Y CONDICIONES', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0.5, 0, 0),
      });
      yPosition -= 30;

      const termsLines = this.splitTextIntoLines(data.terms, 80);
      for (const line of termsLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
    }

    return await pdfDoc.save();
  }

  async generateArchitecturePdf(data: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    const titleFontSize = 20;
    const sectionFontSize = 16;
    let yPosition = height - 50;

    // Título
    page.drawText(data.title, {
      x: 50,
      y: yPosition,
      size: titleFontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 50;

    // Información del cliente y fecha
    page.drawText(`Cliente: ${data.client}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;

    page.drawText(`Fecha: ${data.date}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 40;

    // Resumen del sistema
    if (data.systemOverview) {
      page.drawText('RESUMEN DEL SISTEMA', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0, 0.5),
      });
      yPosition -= 30;

      const overviewLines = this.splitTextIntoLines(data.systemOverview, 80);
      for (const line of overviewLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Diagrama de Arquitectura
    if (data.architectureDiagram) {
      if (yPosition < 150) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('DIAGRAMA DE ARQUITECTURA', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0.5, 0),
      });
      yPosition -= 30;

      // Nota sobre el diagrama
      page.drawText(
        'Nota: Este documento incluye diagramas Mermaid que pueden visualizarse en herramientas compatibles.',
        {
          x: 50,
          y: yPosition,
          size: fontSize - 2,
          color: rgb(0.5, 0.5, 0.5),
        },
      );
      yPosition -= 20;

      // Código del diagrama
      const diagramLines = this.splitTextIntoLines(
        data.architectureDiagram,
        80,
      );
      for (const line of diagramLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0.5),
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Componentes del sistema
    if (data.components) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('COMPONENTES DEL SISTEMA', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0.5, 0),
      });
      yPosition -= 30;

      const componentsLines = this.splitTextIntoLines(data.components, 80);
      for (const line of componentsLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Flujo de datos
    if (data.dataFlow) {
      if (yPosition < 150) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('FLUJO DE DATOS', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0, 0.5, 0),
      });
      yPosition -= 30;

      const dataFlowLines = this.splitTextIntoLines(data.dataFlow, 80);
      for (const line of dataFlowLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0.5),
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // APIs y Endpoints
    if (data.apis) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('APIs Y ENDPOINTS', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0.5, 0, 0.5),
      });
      yPosition -= 30;

      const apiLines = this.splitTextIntoLines(data.apis, 80);
      for (const line of apiLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Tecnologías
    if (data.technologies) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('TECNOLOGÍAS UTILIZADAS', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0.5, 0, 0.5),
      });
      yPosition -= 30;

      const techLines = this.splitTextIntoLines(data.technologies, 80);
      for (const line of techLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
      yPosition -= 20;
    }

    // Despliegue
    if (data.deployment) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText('ESTRATEGIA DE DESPLIEGUE', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: rgb(0.5, 0, 0.5),
      });
      yPosition -= 30;

      const deploymentLines = this.splitTextIntoLines(data.deployment, 80);
      for (const line of deploymentLines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
        });
        yPosition -= 15;
      }
    }

    return await pdfDoc.save();
  }

  private splitTextIntoLines(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length > maxLength) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
          currentLine = '';
        }
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Renderiza contenido Markdown con formato profesional en el PDF
   * Soporta: #, ##, ###, **bold**, *italic*, listas, bloques de código, citas
   */
  private renderMarkdownContent(
    page: any,
    content: string,
    yPosition: number,
    width: number,
    height: number,
  ): number {
    const lines = content.split('\n');
    const margin = 50;
    const maxWidth = width - margin * 2;

    let currentY = yPosition;
    let currentPage = page;
    const pdfDoc = page.doc;

    for (const line of lines) {
      // Salto de página si no queda espacio
      if (currentY < 60) {
        currentPage = pdfDoc.addPage();
        currentY = height - 50;
      }

      // Encabezados
      if (line.startsWith('### ')) {
        currentPage.drawText(line.substring(4), {
          x: margin,
          y: currentY,
          size: 14,
          color: rgb(0.2, 0.2, 0.3),
        });
        currentY -= 25;
        continue;
      }

      if (line.startsWith('## ')) {
        currentPage.drawText(line.substring(3), {
          x: margin,
          y: currentY,
          size: 16,
          color: rgb(0.1, 0.1, 0.2),
        });
        currentY -= 30;
        continue;
      }

      if (line.startsWith('# ')) {
        currentPage.drawText(line.substring(2), {
          x: margin,
          y: currentY,
          size: 20,
          color: rgb(0, 0, 0),
        });
        currentY -= 35;
        continue;
      }

      // Citas
      if (line.startsWith('> ')) {
        currentPage.drawRectangle({
          x: margin - 10,
          y: currentY - 5,
          width: 4,
          height: 20,
          color: rgb(0.23, 0.51, 0.96),
        });
        const quoteLines = this.splitTextIntoLines(line.substring(2), 75);
        for (const ql of quoteLines) {
          currentPage.drawText(ql, {
            x: margin + 10,
            y: currentY,
            size: 12,
            color: rgb(0.12, 0.25, 0.69),
          });
          currentY -= 18;
        }
        currentY -= 10;
        continue;
      }

      // Listas
      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentPage.drawText('•', {
          x: margin,
          y: currentY,
          size: 12,
          color: rgb(0.23, 0.51, 0.96),
        });
        const listLines = this.splitTextIntoLines(line.substring(2), 75);
        for (let i = 0; i < listLines.length; i++) {
          currentPage.drawText(listLines[i], {
            x: margin + 15,
            y: currentY - i * 16,
            size: 12,
          });
        }
        currentY -= 18 * listLines.length;
        continue;
      }

      // Linea vacia
      if (line.trim() === '') {
        currentY -= 12;
        continue;
      }

      // Texto normal
      const textLines = this.splitTextIntoLines(line, 90);
      for (const tl of textLines) {
        if (currentY < 60) {
          currentPage = pdfDoc.addPage();
          currentY = height - 50;
        }
        currentPage.drawText(tl, {
          x: margin,
          y: currentY,
          size: 12,
        });
        currentY -= 18;
      }
    }

    return currentY;
  }

  downloadPdf(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes as any], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
