import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateCommercialDocumentDto } from './dto/create-document.dto';
import { DocumentType, DocumentTypeValue } from '../../database/schemas/commercial-document.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const TYPE_MAP: Record<string, DocumentTypeValue> = {
  quotes: DocumentType.QUOTE,
  presupuestos: DocumentType.QUOTE,
  orders: DocumentType.ORDER,
  pedidos: DocumentType.ORDER,
  'delivery-notes': DocumentType.DELIVERY_NOTE,
  albaranes: DocumentType.DELIVERY_NOTE,
};

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':type')
  @ApiOperation({ summary: 'Create presupuesto, pedido or albarán' })
  create(
    @Param('type') type: string,
    @Body() dto: CreateCommercialDocumentDto,
  ) {
    const docType = TYPE_MAP[type.toLowerCase()];
    if (!docType) {
      throw new BadRequestException(
        'Type must be one of: quotes, presupuestos, orders, pedidos, delivery-notes, albaranes',
      );
    }
    return this.documentsService.create(docType, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents with optional filters' })
  findAll(
    @Query('type') type?: string,
    @Query('sellerNif') sellerNif?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const docType = type ? TYPE_MAP[type.toLowerCase()] : undefined;
    return this.documentsService.findAll(
      docType,
      sellerNif,
      status,
      parseInt(page ?? '1', 10),
      parseInt(limit ?? '20', 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one document by id' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCommercialDocumentDto>) {
    return this.documentsService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update document status (draft, sent, approved, rejected)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.documentsService.updateStatus(id, body.status);
  }

  @Post(':id/convert-to-invoice')
  @ApiOperation({ summary: 'Convert presupuesto/pedido/albarán to invoice' })
  convertToInvoice(
    @Param('id') id: string,
    @Body() body: { seriesId: string; sellerNif: string },
  ) {
    return this.documentsService.convertToInvoice(
      id,
      body.seriesId,
      body.sellerNif,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document (only if not converted)' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
