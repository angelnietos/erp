import { Body, Controller, Post, StreamableFile } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class ReportExportXlsxDto {
  @IsString()
  title!: string;

  @IsArray()
  @IsString({ each: true })
  headers!: string[];

  @IsArray()
  rows!: (string | number | null)[][];
}

export class ReportExportPdfDto {
  @IsString()
  title!: string;

  @IsArray()
  @IsString({ each: true })
  lines!: string[];
}

@ApiTags('reports-export')
@Controller('reports')
export class ReportsExportController {
  @Post('export/xlsx')
  @ApiOperation({
    summary: 'Generar informe Excel (.xlsx) en servidor (Fase 4)',
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Informe demo',
        headers: ['Columna A', 'Columna B'],
        rows: [
          ['a1', 'b1'],
          ['a2', 'b2'],
        ],
      },
    },
  })
  async exportXlsx(@Body() dto: ReportExportXlsxDto) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Josanz ERP';
    const ws = wb.addWorksheet('Informe');
    ws.addRow([dto.title]);
    ws.addRow([]);
    ws.addRow(dto.headers);
    for (const row of dto.rows) {
      ws.addRow(row);
    }
    const buf = await wb.xlsx.writeBuffer();
    const buffer = Buffer.from(buf);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="josanz-informe.xlsx"`,
    });
  }

  @Post('export/pdf')
  @ApiOperation({
    summary: 'Generar PDF simple en servidor (texto/líneas, Fase 4)',
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Informe ejecutivo',
        lines: ['Línea 1', 'Línea 2'],
      },
    },
  })
  async exportPdf(@Body() dto: ReportExportPdfDto) {
    const pdf = await PDFDocument.create();
    let page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let y = 780;
    page.drawText(dto.title.slice(0, 80), {
      x: 50,
      y,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.15),
    });
    y -= 28;
    for (const line of dto.lines.slice(0, 60)) {
      if (y < 60) {
        page = pdf.addPage([595.28, 841.89]);
        y = 780;
      }
      page.drawText(line.slice(0, 100), {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.25),
      });
      y -= 14;
    }
    const bytes = await pdf.save();
    return new StreamableFile(Buffer.from(bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="josanz-informe.pdf"`,
    });
  }
}
