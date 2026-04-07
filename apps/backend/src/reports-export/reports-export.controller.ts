import { Body, Controller, Post, StreamableFile } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import ExcelJS from 'exceljs';
import { PDFDocument, PDFFont, PDFPage, RGB, rgb, StandardFonts } from 'pdf-lib';

export class ReportExportXlsxDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  headers!: string[];

  @IsArray()
  @ArrayMaxSize(5000)
  rows!: (string | number | null)[][];
}

export class ReportPdfSectionDto {
  @IsString()
  @MaxLength(120)
  heading!: string;

  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  lines!: string[];
}

export class ReportPdfTableDto {
  @IsArray()
  @ArrayMaxSize(24)
  @IsString({ each: true })
  headers!: string[];

  @IsArray()
  @ArrayMaxSize(500)
  rows!: (string | number | null)[][];
}

export class ReportExportPdfDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  subtitle?: string;

  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  lines!: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ReportPdfSectionDto)
  sections?: ReportPdfSectionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ReportPdfTableDto)
  table?: ReportPdfTableDto;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const HEADER_BAND_H = 72;
const BRAND: RGB = rgb(0.12, 0.28, 0.48);
const TEXT_MUTED: RGB = rgb(0.35, 0.38, 0.44);
const TEXT_DARK: RGB = rgb(0.12, 0.14, 0.18);

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
    summary:
      'Generar PDF con cabecera de marca, secciones, tabla (pdf-lib) y cuerpo de líneas',
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Informe ejecutivo',
        subtitle: 'Periodo Q1',
        lines: ['Resumen en una línea'],
        sections: [{ heading: 'Detalle', lines: ['Punto 1', 'Punto 2'] }],
        table: {
          headers: ['Concepto', 'Valor'],
          rows: [
            ['A', 100],
            ['B', 200],
          ],
        },
      },
    },
  })
  async exportPdf(@Body() dto: ReportExportPdfDto) {
    const bytes = await this.buildRichPdf(dto);
    return new StreamableFile(Buffer.from(bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="josanz-informe.pdf"`,
    });
  }

  private async buildRichPdf(dto: ReportExportPdfDto): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const cursor = { page: pdf.addPage([PAGE_W, PAGE_H]), y: 0 as number };
    cursor.y = this.drawHeaderBand(
      cursor.page,
      dto.title,
      dto.subtitle,
      font,
      fontBold,
    );

    const needPage = (need: number) => {
      if (cursor.y - need < MARGIN + 36) {
        cursor.page = pdf.addPage([PAGE_W, PAGE_H]);
        cursor.y = this.drawHeaderBand(
          cursor.page,
          dto.title,
          dto.subtitle,
          font,
          fontBold,
        );
      }
    };

    cursor.y -= 8;
    for (const line of dto.lines.slice(0, 80)) {
      needPage(20);
      cursor.page.drawText(this.truncate(line, 90), {
        x: MARGIN,
        y: cursor.y,
        size: 10,
        font,
        color: TEXT_DARK,
      });
      cursor.y -= 14;
    }

    if (dto.sections?.length) {
      for (const sec of dto.sections.slice(0, 12)) {
        needPage(28);
        cursor.page.drawText(this.truncate(sec.heading, 70), {
          x: MARGIN,
          y: cursor.y,
          size: 12,
          font: fontBold,
          color: BRAND,
        });
        cursor.y -= 18;
        for (const ln of sec.lines.slice(0, 40)) {
          needPage(18);
          cursor.page.drawText(this.truncate(ln, 95), {
            x: MARGIN + 8,
            y: cursor.y,
            size: 9,
            font,
            color: TEXT_MUTED,
          });
          cursor.y -= 13;
        }
        cursor.y -= 6;
      }
    }

    if (dto.table?.headers?.length && dto.table.rows?.length) {
      this.drawTable(
        pdf,
        cursor,
        dto.table.headers.slice(0, 24),
        dto.table.rows.slice(0, 500),
        font,
        fontBold,
        dto,
      );
    }

    const pages = pdf.getPages();
    const total = pages.length;
    let i = 1;
    for (const p of pages) {
      this.drawFooter(p, font, i, total);
      i += 1;
    }

    return pdf.save();
  }

  private drawHeaderBand(
    page: PDFPage,
    title: string,
    subtitle: string | undefined,
    font: PDFFont,
    fontBold: PDFFont,
  ): number {
    page.drawRectangle({
      x: 0,
      y: PAGE_H - HEADER_BAND_H,
      width: PAGE_W,
      height: HEADER_BAND_H,
      color: BRAND,
    });
    page.drawText(this.truncate(title, 72), {
      x: MARGIN,
      y: PAGE_H - 38,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    if (subtitle?.trim()) {
      page.drawText(this.truncate(subtitle, 90), {
        x: MARGIN,
        y: PAGE_H - 58,
        size: 10,
        font,
        color: rgb(0.9, 0.92, 0.95),
      });
    }
    page.drawText('Josanz ERP', {
      x: PAGE_W - MARGIN - font.widthOfTextAtSize('Josanz ERP', 9),
      y: PAGE_H - 28,
      size: 9,
      font,
      color: rgb(0.85, 0.9, 0.95),
    });
    return PAGE_H - HEADER_BAND_H - 24;
  }

  private drawFooter(page: PDFPage, font: PDFFont, index: number, total: number) {
    const t = `Página ${index} / ${total} · Josanz ERP`;
    const w = font.widthOfTextAtSize(t, 8);
    page.drawText(t, {
      x: (PAGE_W - w) / 2,
      y: 28,
      size: 8,
      font,
      color: TEXT_MUTED,
    });
  }

  private drawTable(
    pdf: PDFDocument,
    cursor: { page: PDFPage; y: number },
    headers: string[],
    rows: (string | number | null)[][],
    font: PDFFont,
    fontBold: PDFFont,
    dto: ReportExportPdfDto,
  ): void {
    const innerW = PAGE_W - 2 * MARGIN;
    const colCount = headers.length;
    const colW = innerW / colCount;
    const rowH = 22;
    const headerH = 26;

    const needPage = (need: number) => {
      if (cursor.y - need < MARGIN + 36) {
        cursor.page = pdf.addPage([PAGE_W, PAGE_H]);
        cursor.y = this.drawHeaderBand(
          cursor.page,
          dto.title,
          dto.subtitle,
          font,
          fontBold,
        );
      }
    };

    needPage(40);
    cursor.page.drawText('Tabla de datos', {
      x: MARGIN,
      y: cursor.y,
      size: 11,
      font: fontBold,
      color: BRAND,
    });
    cursor.y -= 16;

    const drawHeaderRow = (pg: PDFPage, yy: number) => {
      pg.drawRectangle({
        x: MARGIN,
        y: yy - headerH + 4,
        width: innerW,
        height: headerH,
        color: rgb(0.93, 0.95, 0.98),
        borderColor: rgb(0.75, 0.78, 0.84),
        borderWidth: 0.5,
      });
      let x = MARGIN + 4;
      for (let c = 0; c < colCount; c++) {
        pg.drawText(this.truncate(String(headers[c] ?? ''), 24), {
          x,
          y: yy - 14,
          size: 8,
          font: fontBold,
          color: TEXT_DARK,
        });
        x += colW;
      }
    };

    needPage(headerH + 8);
    drawHeaderRow(cursor.page, cursor.y);
    cursor.y -= headerH;

    for (const row of rows) {
      needPage(rowH + 10);
      cursor.page.drawRectangle({
        x: MARGIN,
        y: cursor.y - rowH + 6,
        width: innerW,
        height: rowH,
        borderColor: rgb(0.82, 0.84, 0.88),
        borderWidth: 0.4,
      });
      let x = MARGIN + 4;
      for (let c = 0; c < colCount; c++) {
        const cell = row[c];
        const text =
          cell === null || cell === undefined ? '' : String(cell);
        cursor.page.drawText(this.truncate(text, 32), {
          x,
          y: cursor.y - 14,
          size: 8,
          font,
          color: TEXT_DARK,
        });
        x += colW;
      }
      cursor.y -= rowH;
    }
  }

  private truncate(s: string, max: number): string {
    const t = s.replace(/\s+/g, ' ').trim();
    return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
  }
}
