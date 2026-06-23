import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard, TenantGuard, PrismaService, PublicTenant } from '@generic-crm/shared-infrastructure';
import { requireRequestTenantId } from '@generic-crm/shared-infrastructure';
import { VerifactuApplicationService } from '../application/verifactu.application.service';
import { CreateVerifactuSeriesDto } from '../dto/create-verifactu-series.dto';
import { EnqueueInvoiceDto } from '../dto/enqueue-invoice.dto';
import { PatchVerifactuSettingsDto } from '../dto/patch-verifactu-settings.dto';
import { UpsertVerifactuCredentialsDto } from '../dto/upsert-verifactu-credentials.dto';

@ApiTags('verifactu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('verifactu')
export class VerifactuController {
  constructor(
    private readonly verifactu: VerifactuApplicationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('queue')
  @ApiOperation({ summary: 'Cola Verifactu del tenant' })
  queue(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.queueList(tenantId);
  }

  @Post('queue')
  @ApiOperation({ summary: 'Encolar factura para envío AEAT' })
  enqueue(@Req() req: Request, @Body() dto: EnqueueInvoiceDto) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.enqueue(tenantId, dto.invoiceId);
  }

  @PublicTenant()
  @Post('submit')
  @ApiOperation({ summary: 'Alias para encolar factura (ERP compatibility)' })
  async submit(@Req() req: Request, @Body() dto: { invoiceId: string; tenantId?: string; invoiceNumber?: string; total?: number }) {
    const tenantId = requireRequestTenantId(req);
    
    // Auto-provisión de la factura en la BD del CRM si no existe (necesario por FK)
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });

    if (!invoice) {
       await this.prisma.invoice.create({
         data: {
           id: dto.invoiceId,
           tenantId,
           number: dto.invoiceNumber || `EXT-${dto.invoiceId.slice(0, 8)}`,
           total: dto.total || 0,
           status: 'ISSUED',
           issuedAt: new Date(),
         }
       });
    }

    const result = await this.verifactu.enqueue(tenantId, dto.invoiceId);
    return {
      success: true,
      queueItemId: result.id,
    };

  }

  @Get('series')
  @ApiOperation({ summary: 'Series de facturación Verifactu' })
  series(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.seriesList(tenantId);
  }

  @Post('series')
  @ApiOperation({ summary: 'Crear serie de facturación' })
  createSeries(@Req() req: Request, @Body() dto: CreateVerifactuSeriesDto) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.seriesCreate(tenantId, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Historial de envíos Verifactu' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'Filas máximas (el servidor aplica tope 500; por defecto 100).',
  })
  @ApiQuery({ name: 'invoiceId', required: false })
  logs(
    @Req() req: Request,
    @Query('invoiceId') invoiceId?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = requireRequestTenantId(req);
    const n = limit ? Number.parseInt(limit, 10) : undefined;
    return this.verifactu.logsList(tenantId, {
      invoiceId: invoiceId?.trim() || undefined,
      limit: Number.isFinite(n) ? n : undefined,
    });
  }

  @Get('chain')
  @ApiOperation({ summary: 'Ledger inmutable Verifactu del tenant (bloques encadenados)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  chain(
    @Req() req: Request,
    @Query('invoiceId') invoiceId?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = requireRequestTenantId(req);
    const n = limit ? Number.parseInt(limit, 10) : undefined;
    return this.verifactu.chainList(tenantId, {
      invoiceId: invoiceId?.trim() || undefined,
      limit: Number.isFinite(n) ? n : undefined,
    });
  }

  @Get('chain/verify')
  @ApiOperation({ summary: 'Verifica integridad de la cadena fiscal del tenant' })
  chainVerify(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.chainVerify(tenantId);
  }

  @Get('integration')
  @ApiOperation({ summary: 'Resumen integración AEAT / despliegue' })
  integration() {
    return this.verifactu.integrationSummary();
  }

  @Get('settings')
  @ApiOperation({ summary: 'NIF emisor AEAT del tenant (emitter_tax_id)' })
  settings(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.tenantSettings(tenantId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Actualizar NIF emisor AEAT del tenant' })
  patchSettings(@Req() req: Request, @Body() dto: PatchVerifactuSettingsDto) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.patchTenantSettings(tenantId, dto);
  }

  @PublicTenant()
  @Get('invoices/:id')
  @ApiOperation({ summary: 'Detalle de factura Verifactu para ERP' })
  getInvoiceDetails(@Req() req: Request, @Param('id') id: string) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.getInvoiceDetail(tenantId, id);
  }

  @Get('credentials/status')
  @ApiOperation({ summary: 'Estado certificados mTLS por entorno (test/prod)' })
  credentialsStatus(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.credentialsStatus(tenantId);
  }

  @Put('credentials')
  @ApiOperation({ summary: 'Guardar PEM certificado/clave (cifrado)' })
  credentialsUpsert(
    @Req() req: Request,
    @Body() dto: UpsertVerifactuCredentialsDto,
  ) {
    const tenantId = requireRequestTenantId(req);
    return this.verifactu.credentialsUpsert(tenantId, dto);
  }

  @Delete('credentials')
  @ApiOperation({ summary: 'Eliminar certificado guardado por entorno' })
  credentialsDelete(
    @Req() req: Request,
    @Query('environment') environment?: string,
  ) {
    const tenantId = requireRequestTenantId(req);
    const e = (environment || '').toLowerCase().trim();
    if (e !== 'test' && e !== 'production') {
      throw new BadRequestException(
        'Query `environment` obligatorio: test o production',
      );
    }
    return this.verifactu.credentialsDelete(tenantId, e);
  }
}
