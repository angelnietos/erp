import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { InvoiceAnalyticsService } from './services/invoice-analytics.service';
import { InvoiceExportService } from './services/export.service';
import {
  CreateInvoiceDto,
  CancelInvoiceDto,
  InvoiceResponseDto,
  InvoiceStatus,
} from '@josanz-erp/verifactu-api';
import { AeatSoapService } from '../aeat/aeat-soap.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * Invoice Controller - REST API endpoints for invoice operations
 * Controlador de Facturas - Endpoints REST API para operaciones de facturas
 */
@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MEDICO)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly analyticsService: InvoiceAnalyticsService,
    private readonly exportService: InvoiceExportService,
    private readonly aeatSoapService: AeatSoapService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Create and send invoice immediately
   * Crear y enviar factura inmediatamente
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create and send invoice to AEAT',
    description: 'Crea y envía una factura a la AEAT',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice processed successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createInvoice(
    @Body() invoice: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.createInvoice(invoice);
  }

  /**
   * Add invoice to queue for batch processing
   * Añadir factura a la cola para procesamiento por lotes
   */
  @Post('queue')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Add invoice to processing queue',
    description: 'Añade una factura a la cola de procesamiento',
  })
  @ApiResponse({ status: 202, description: 'Invoice added to queue' })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  async queueInvoice(
    @Body() invoice: CreateInvoiceDto,
  ): Promise<{ itemId: string; message: string }> {
    return await this.invoiceService.queueInvoice(invoice);
  }

  /**
   * Cancel an invoice
   * Anular una factura
   */
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel an invoice',
    description: 'Anula una factura previamente enviada',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid cancellation data' })
  async cancelInvoice(
    @Body() cancellation: CancelInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.cancelInvoice(cancellation);
  }

  /**
   * Add cancellation to queue
   * Añadir anulación a la cola
   */
  @Post('cancel/queue')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Add cancellation to processing queue',
    description: 'Añade una anulación a la cola de procesamiento',
  })
  @ApiResponse({ status: 202, description: 'Cancellation added to queue' })
  @ApiResponse({ status: 400, description: 'Invalid cancellation data' })
  async queueCancellation(
    @Body() cancellation: CancelInvoiceDto,
  ): Promise<{ itemId: string; message: string }> {
    return await this.invoiceService.queueCancellation(cancellation);
  }

  /**
   * Get queue status
   * Obtener estado de la cola
   */
  @Get('queue/status/:sellerNif')
  @ApiOperation({
    summary: 'Get queue status for a seller',
    description: 'Obtiene el estado de la cola para un vendedor',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiResponse({ status: 200, description: 'Queue status' })
  getQueueStatus(@Param('sellerNif') sellerNif: string) {
    return this.invoiceService.getQueueStatus(sellerNif);
  }

  /**
   * Get queued item status
   * Obtener estado de elemento en cola
   */
  @Get('queue/item/:sellerNif/:itemId')
  @ApiOperation({
    summary: 'Get queued item status',
    description: 'Obtiene el estado de un elemento en la cola',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Queue item ID',
    example: 'uuid-1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Item status',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  getQueuedItem(
    @Param('sellerNif') sellerNif: string,
    @Param('itemId') itemId: string,
  ): InvoiceResponseDto | null {
    return this.invoiceService.getQueuedItem(sellerNif, itemId);
  }

  /**
   * Get invoice record from blockchain
   * Obtener registro de factura de la blockchain
   */
  @Get('record/:sellerNif/:invoiceNumber')
  @ApiOperation({
    summary: 'Get invoice record from blockchain',
    description: 'Obtiene el registro de una factura de la blockchain',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiParam({
    name: 'invoiceNumber',
    description: 'Invoice number',
    example: 'GIT-EJ-0002',
  })
  @ApiResponse({ status: 200, description: 'Invoice record' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoiceRecord(
    @Param('sellerNif') sellerNif: string,
    @Param('invoiceNumber') invoiceNumber: string,
  ) {
    return this.invoiceService.getInvoiceRecord(sellerNif, invoiceNumber);
  }

  /**
   * Get all records for a seller
   * Obtener todos los registros de un vendedor
   */
  @Get('records/:sellerNif')
  @ApiOperation({
    summary: 'Get all records for a seller',
    description: 'Obtiene todos los registros de un vendedor',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiResponse({ status: 200, description: 'List of records' })
  getAllRecords(@Param('sellerNif') sellerNif: string) {
    return this.invoiceService.getAllRecords(sellerNif);
  }

  /**
   * Get invoices with advanced filtering, pagination, and search
   * Obtener facturas con filtrado avanzado, paginación y búsqueda
   */
  @Get('list')
  @ApiOperation({
    summary: 'Get invoices with filters, pagination, and search',
    description:
      'Obtiene facturas con filtros avanzados, paginación y búsqueda',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of invoices',
    schema: {
      type: 'object',
      properties: {
        invoices: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('sellerNif') sellerNif?: string,
    @Query('buyerNif') buyerNif?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const filters: {
      status?: InvoiceStatus;
      sellerNif?: string;
      buyerNif?: string;
      startDate?: Date;
      endDate?: Date;
      amountRange?: { min?: number; max?: number };
    } = {};

    if (status) filters.status = status as InvoiceStatus;
    if (sellerNif) filters.sellerNif = sellerNif;
    if (buyerNif) filters.buyerNif = buyerNif;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (minAmount || maxAmount) {
      filters.amountRange = {};
      if (minAmount) filters.amountRange.min = parseFloat(minAmount);
      if (maxAmount) filters.amountRange.max = parseFloat(maxAmount);
    }

    const result = await this.invoiceService.getInvoices(
      pageNum,
      limitNum,
      filters,
      search,
      sortBy,
      sortOrder || 'desc',
    );

    return {
      ...result,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.total / limitNum),
    };
  }

  /**
   * Get single invoice by MongoDB id (for vencimientos/cobros and email)
   */
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get invoice by id' })
  async getInvoiceById(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  /**
   * Update due date and payments (vencimientos y cobros)
   */
  @Patch('by-id/:id/vencimiento')
  @ApiOperation({ summary: 'Update due date and payments' })
  async updateVencimiento(
    @Param('id') id: string,
    @Body()
    body: {
      dueDate?: string;
      payments?: { date: string; amount: number; note?: string }[];
    },
  ) {
    return this.invoiceService.updateDueDateAndPayments(
      id,
      body.dueDate,
      body.payments,
    );
  }

  /**
   * Send invoice by email
   */
  @Post('by-id/:id/send-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send invoice by email' })
  async sendInvoiceEmail(
    @Param('id') id: string,
    @Body() body: { email: string },
  ) {
    return this.invoiceService.sendInvoiceByEmail(id, body.email);
  }

  /**
   * Verify blockchain integrity
   * Verificar integridad de la blockchain
   */
  @Get('blockchain/verify/:sellerNif')
  @ApiOperation({
    summary: 'Verify blockchain integrity',
    description: 'Verifica la integridad de la blockchain',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiResponse({ status: 200, description: 'Verification result' })
  verifyBlockchain(@Param('sellerNif') sellerNif: string): { valid: boolean } {
    const valid = this.invoiceService.verifyBlockchain(sellerNif);
    return { valid };
  }

  /**
   * Get blockchain statistics
   * Obtener estadísticas de la blockchain
   */
  @Get('blockchain/stats/:sellerNif')
  @ApiOperation({
    summary: 'Get blockchain statistics',
    description: 'Obtiene estadísticas de la blockchain',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiResponse({ status: 200, description: 'Blockchain statistics' })
  getBlockchainStats(@Param('sellerNif') sellerNif: string) {
    return this.invoiceService.getBlockchainStats(sellerNif);
  }

  /**
   * Generate QR code for invoice
   * Generar código QR para factura
   */
  @Post('qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate QR code for invoice',
    description: 'Genera el código QR para una factura',
  })
  @ApiResponse({ status: 200, description: 'QR code generated' })
  async generateQrCode(
    @Body() invoice: CreateInvoiceDto,
  ): Promise<{ qrUrl: string; qrBase64: string }> {
    return this.invoiceService.generateQrCode(invoice);
  }

  /**
   * Generate hash for invoice (without sending)
   * Generar hash para factura (sin enviar)
   */
  @Post('hash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate hash for invoice',
    description: 'Genera el hash para una factura sin enviarla',
  })
  @ApiResponse({ status: 200, description: 'Hash generated' })
  generateHash(
    @Body() invoice: CreateInvoiceDto,
  ): Promise<{ hash: string; timestamp: string; previousHash: string }> {
    return Promise.resolve(this.invoiceService.generateInvoiceHash(invoice));
  }

  /**
   * Check AEAT service status
   * Verificar estado del servicio AEAT
   */
  @Get('aeat/status')
  @ApiOperation({
    summary: 'Check AEAT service status',
    description: 'Verifica el estado del servicio de la AEAT',
  })
  @ApiResponse({
    status: 200,
    description: 'AEAT service status',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        endpoint: { type: 'string' },
        environment: { type: 'string' },
        lastChecked: { type: 'string', format: 'date-time' },
        message: { type: 'string' },
      },
    },
  })
  async checkAeatStatus() {
    return this.aeatSoapService.checkServiceStatus();
  }

  /**
   * Check database connection status
   * Verificar estado de la conexión a la base de datos
   */
  @Get('database/status')
  @ApiOperation({
    summary: 'Check database connection status',
    description: 'Verifica el estado de la conexión a la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Database connection status',
    schema: {
      type: 'object',
      properties: {
        connected: { type: 'boolean' },
        database: { type: 'string' },
        host: { type: 'string' },
        lastChecked: { type: 'string', format: 'date-time' },
        message: { type: 'string' },
      },
    },
  })
  checkDatabaseStatus() {
    const isConnected = (this.connection.readyState as number) === 1;
    let host = 'localhost';
    try {
      if (isConnected && this.connection.db) {
        host = this.connection.host || 'localhost';
      }
    } catch {
      // Ignore errors when getting host
    }
    return {
      connected: isConnected,
      database: isConnected
        ? this.connection.db?.databaseName || 'verifactu'
        : 'N/A',
      host,
      lastChecked: new Date().toISOString(),
      message: isConnected
        ? 'Database connected successfully'
        : 'Database connection failed',
    };
  }

  /**
   * Retry all failed items in queue
   * Reintentar todos los elementos fallidos en la cola
   */
  @Post('queue/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry all failed items in queue',
    description: 'Reintenta todos los elementos fallidos en la cola',
  })
  @ApiResponse({
    status: 200,
    description: 'Number of items retried',
    schema: {
      type: 'object',
      properties: {
        retriedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async retryFailedItems(): Promise<{ retriedCount: number; message: string }> {
    const retriedCount = await this.invoiceService.retryFailedItems();
    return {
      retriedCount,
      message: `Retrying ${retriedCount} failed items`,
    };
  }

  /**
   * Retry failed items for a specific seller
   * Reintentar elementos fallidos para un vendedor específico
   */
  @Post('queue/retry/:sellerNif')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry failed items for a specific seller',
    description: 'Reintenta elementos fallidos para un vendedor específico',
  })
  @ApiParam({
    name: 'sellerNif',
    description: 'Seller NIF',
    example: 'B72877814',
  })
  @ApiResponse({
    status: 200,
    description: 'Number of items retried',
  })
  async retryFailedItemsForSeller(
    @Param('sellerNif') sellerNif: string,
  ): Promise<{ retriedCount: number; message: string }> {
    const retriedCount = await this.invoiceService.retryFailedItems(sellerNif);
    return {
      retriedCount,
      message: `Retrying ${retriedCount} failed items for ${sellerNif}`,
    };
  }

  /**
   * Retry a specific queue item
   * Reintentar un elemento específico de la cola
   */
  @Post('queue/retry/item/:queueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry a specific queue item',
    description: 'Reintenta un elemento específico de la cola',
  })
  @ApiParam({
    name: 'queueId',
    description: 'Queue item ID',
    example: 'uuid-1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Item retried successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found or not in error state',
  })
  async retryQueueItem(
    @Param('queueId') queueId: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.invoiceService.retryQueueItem(queueId);
    return {
      success,
      message: success
        ? `Item ${queueId} queued for retry`
        : `Item ${queueId} not found or not in error state`,
    };
  }

  /**
   * Get all queued items from database
   * Obtener todos los elementos en cola de la base de datos
   */
  @Get('queue/items')
  @ApiOperation({
    summary: 'Get all queued items from database',
    description: 'Obtiene todos los elementos en cola de la base de datos',
  })
  @ApiResponse({ status: 200, description: 'List of queued items' })
  async getQueuedItems(
    @Param('page') page?: number,
    @Param('limit') limit?: number,
  ) {
    return this.invoiceService.getQueuedItemsFromDb(page || 1, limit || 10);
  }

  /**
   * Get pending count from database
   * Obtener conteo de pendientes de la base de datos
   */
  @Get('queue/pending-count')
  @ApiOperation({
    summary: 'Get pending count from database',
    description:
      'Obtiene el conteo de elementos pendientes de la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending count',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.invoiceService.getPendingCountFromDb();
    return { count };
  }

  /**
   * Get recent AEAT responses
   * Obtener últimas respuestas de la AEAT
   */
  @Get('responses/:sellerNif')
  @ApiOperation({
    summary: 'Get recent AEAT responses',
    description: 'Obtiene las últimas respuestas de la AEAT',
  })
  @ApiResponse({ status: 200, description: 'List of recent responses' })
  async getRecentResponses(@Param('sellerNif') sellerNif: string): Promise<
    {
      csv: string;
      invoiceNumber: string;
      success: boolean;
      timestamp: Date;
      message: string;
    }[]
  > {
    return this.invoiceService.getRecentResponses(sellerNif, 10);
  }

  /**
   * Get today's sending statistics
   * Obtener estadísticas de envío de hoy
   */
  @Get('queue/stats/:sellerNif')
  @ApiOperation({
    summary: "Get today's sending statistics",
    description: 'Obtiene las estadísticas de envío de hoy',
  })
  @ApiResponse({ status: 200, description: "Today's statistics" })
  async getTodayStats(@Param('sellerNif') sellerNif: string): Promise<{
    sentToday: number;
    accepted: number;
    rejected: number;
    avgResponseTime: number;
  }> {
    return this.invoiceService.getTodayStats(sellerNif);
  }

  /**
   * Get comprehensive invoice statistics
   * Obtener estadísticas completas de facturas
   */
  @Get('analytics/statistics')
  @ApiOperation({
    summary: 'Get comprehensive invoice statistics',
    description: 'Obtiene estadísticas completas de facturas',
  })
  @ApiResponse({ status: 200, description: 'Invoice statistics' })
  async getStatistics(
    @Query('sellerNif') sellerNif?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getStatistics(
      sellerNif,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Get invoice trends
   * Obtener tendencias de facturas
   */
  @Get('analytics/trends')
  @ApiOperation({
    summary: 'Get invoice trends over time',
    description: 'Obtiene tendencias de facturas en el tiempo',
  })
  @ApiResponse({ status: 200, description: 'Invoice trends' })
  async getTrends(
    @Query('sellerNif') sellerNif?: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(
      sellerNif,
      period || 'monthly',
      days ? parseInt(days, 10) : 30,
    );
  }

  /**
   * Get top sellers
   * Obtener top vendedores
   */
  @Get('analytics/top-sellers')
  @ApiOperation({
    summary: 'Get top sellers by invoice count and amount',
    description: 'Obtiene los principales vendedores por cantidad e importe',
  })
  @ApiResponse({ status: 200, description: 'Top sellers list' })
  async getTopSellers(@Query('limit') limit?: string) {
    return this.analyticsService.getTopSellers(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * Get performance metrics
   * Obtener métricas de rendimiento
   */
  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get performance metrics',
    description: 'Obtiene métricas de rendimiento del sistema',
  })
  @ApiResponse({ status: 200, description: 'Performance metrics' })
  async getPerformanceMetrics(
    @Query('sellerNif') sellerNif?: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getPerformanceMetrics(
      sellerNif,
      days ? parseInt(days, 10) : 30,
    );
  }

  /**
   * Export invoices to CSV
   * Exportar facturas a CSV
   */
  @Get('export/csv')
  @ApiOperation({
    summary: 'Export invoices to CSV',
    description: 'Exporta facturas a formato CSV',
  })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportToCSV(
    @Res() res: Response,
    @Query('sellerNif') sellerNif?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const filters: {
      status?: InvoiceStatus;
      sellerNif?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (status) filters.status = status as InvoiceStatus;
    if (sellerNif) filters.sellerNif = sellerNif;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const result = await this.invoiceService.getInvoices(1, 10000, filters);
    await this.exportService.exportToCSV(result.invoices, res, 'facturas');
  }

  /**
   * Export invoices to JSON
   * Exportar facturas a JSON
   */
  @Get('export/json')
  @ApiOperation({
    summary: 'Export invoices to JSON',
    description: 'Exporta facturas a formato JSON',
  })
  @ApiResponse({ status: 200, description: 'JSON file' })
  async exportToJSON(
    @Res() res: Response,
    @Query('sellerNif') sellerNif?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const filters: {
      status?: InvoiceStatus;
      sellerNif?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (status) filters.status = status as InvoiceStatus;
    if (sellerNif) filters.sellerNif = sellerNif;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const result = await this.invoiceService.getInvoices(1, 10000, filters);
    await this.exportService.exportToJSON(result.invoices, res, 'facturas');
  }
}
