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
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    let yPosition = height - 50;

    // Título
    page.drawText(data.title, {
      x: 50,
      y: yPosition,
      size: 18,
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
        // Agregar nueva página si es necesario
        const newPage = pdfDoc.addPage();
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
