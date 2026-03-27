import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecordQueryService } from './record-query.service';

@ApiTags('record-query')
@ApiBearerAuth()
@Controller('record-query')
@UseGuards(JwtAuthGuard)
export class RecordQueryController {
  constructor(private readonly recordQueryService: RecordQueryService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar registros de facturación',
    description: 'Consulta registros enviados a la AEAT según Orden HAC/1177/2024',
  })
  @ApiResponse({ status: 200, description: 'Registros encontrados' })
  async queryRecords(
    @Query('nif') nif?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('invoiceNumber') invoiceNumber?: string,
    @Query('status') status?: string,
  ) {
    return this.recordQueryService.queryRecords({
      nif,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      invoiceNumber,
      status,
    });
  }

  @Get('status/:invoiceNumber')
  @ApiOperation({
    summary: 'Obtener estado de un registro',
    description: 'Consulta el estado de una factura específica en la AEAT',
  })
  @ApiResponse({ status: 200, description: 'Estado del registro' })
  async getRecordStatus(
    @Param('invoiceNumber') invoiceNumber: string,
    @Query('nif') nif: string,
  ) {
    return this.recordQueryService.getRecordStatus(invoiceNumber, nif);
  }

  @Get('verify/:invoiceNumber')
  @ApiOperation({
    summary: 'Verificar aceptación de factura',
    description: 'Verifica si una factura fue aceptada por la AEAT',
  })
  @ApiResponse({ status: 200, description: 'Estado de verificación' })
  async verifyInvoice(
    @Param('invoiceNumber') invoiceNumber: string,
    @Query('nif') nif: string,
  ) {
    const accepted = await this.recordQueryService.verifyInvoiceAccepted(
      invoiceNumber,
      nif,
    );
    return {
      invoiceNumber,
      nif,
      accepted,
      verifiedAt: new Date().toISOString(),
    };
  }
}
