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

    const fontSize = 12;
    const titleFontSize = 18;
    const sectionFontSize = 14;
    let yPosition = height - 50;

    // Título
    page.drawText(data.title, {
      x: 50,
      y: yPosition,
      size: titleFontSize,
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
    yPosition -= 40;

    // Contenido
    const contentLines = this.splitTextIntoLines(
      data.content.replace(/<[^>]*>/g, ''),
      80,
    );
    for (const line of contentLines) {
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
