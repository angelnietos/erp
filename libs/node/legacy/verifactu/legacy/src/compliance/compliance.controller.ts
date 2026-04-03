import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ComplianceService } from './compliance.service';

@ApiTags('compliance')
@ApiBearerAuth()
@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Validar cumplimiento normativo SIF',
    description: 'Valida el cumplimiento según RD 1007/2023 y Orden HAC/1177/2024',
  })
  @ApiResponse({ status: 200, description: 'Validación completada' })
  async validateCompliance(@Body() invoiceData: any) {
    return this.complianceService.validateSIFCompliance(invoiceData);
  }

  @Get('report')
  @ApiOperation({
    summary: 'Generar informe de cumplimiento',
    description: 'Genera un informe de cumplimiento normativo',
  })
  @ApiResponse({ status: 200, description: 'Informe generado' })
  async getComplianceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Obtener facturas del período
    const invoices: any[] = [];
    return this.complianceService.generateComplianceReport(invoices);
  }
}
