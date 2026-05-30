import { Body, Controller, Post, StreamableFile } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTenant } from '@josanz-erp/shared-infrastructure';
import { ExportDocumentPdfDto } from '../../application/dtos/export-document-pdf.dto';
import { HtmlPdfService } from '../../application/services/html-pdf.service';

@ApiTags('document-generator')
@PublicTenant()
@Controller('document-generator')
export class DocumentGeneratorPdfController {
  constructor(private readonly htmlPdf: HtmlPdfService) {}

  @Post('export/pdf')
  @ApiOperation({
    summary:
      'Generar PDF A4 desde HTML completo (mismo render que la vista previa del editor)',
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Mi documento',
        html: '<!DOCTYPE html><html><head><style>body{margin:0}</style></head><body><h1>Hola</h1></body></html>',
      },
    },
  })
  async exportPdf(@Body() dto: ExportDocumentPdfDto) {
    const bytes = await this.htmlPdf.renderHtmlToPdf(dto.html);
    const safeName = (dto.title || 'documento')
      .replace(/[^\w\s.-]/g, '')
      .trim()
      .slice(0, 80) || 'documento';

    return new StreamableFile(bytes, {
      type: 'application/pdf',
      disposition: `attachment; filename="${safeName}.pdf"`,
    });
  }
}
