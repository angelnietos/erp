import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import {
  BlockchainService,
  BlockchainRecord,
} from '../blockchain/blockchain.service';
import { XmlBuilderService, SystemInfoType } from '../xml/xml-builder.service';
import { AeatSoapService, AeatResponse } from '../aeat/aeat-soap.service';
import { QrService } from '../qr/qr.service';
import { HashService } from '../hash/hash.service';
import { InvoiceQueueService } from '../queue/invoice-queue.service';
import { InvoiceStatus, Impuesto } from '../dto/tipo-factura.enum';
import { InvoiceRepository } from '../../database/services/invoice.repository';
import { InvoiceDocument } from '../../database/schemas/invoice.schema';
import { InvoiceValidationService } from './services/invoice-validation.service';
import { AdvancedValidationService } from './services/advanced-validation.service';
/**
 * Invoice Service - Main service for invoice operations
 * Servicio de Facturas - Servicio principal para operaciones de facturas
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly simulationMode: boolean;
  private readonly systemInfo: SystemInfoType;

  constructor(
    private configService: ConfigService,
    private blockchainService: BlockchainService,
    private xmlBuilderService: XmlBuilderService,
    private aeatSoapService: AeatSoapService,
    private qrService: QrService,
    private hashService: HashService,
    private invoiceQueueService: InvoiceQueueService,
    private invoiceRepository: InvoiceRepository,
    private validationService: InvoiceValidationService,
    private advancedValidationService: AdvancedValidationService,
  ) {
    // Enable simulation mode when AEAT is unavailable or for development
    this.simulationMode =
      this.configService.get<string>('verifactu.simulationMode') === 'true' ||
      this.configService.get<string>('AEAT_ENVIRONMENT') === 'test';

    // System information for XML generation
    this.systemInfo = {
      nombreRazon:
        this.configService.get<string>('verifactu.systemNombreRazon') ||
        'Sistema VeriFactu',
      nif: this.configService.get<string>('verifactu.systemNif') || '00000000A',
      nombreSistema:
        this.configService.get<string>('verifactu.systemNombre') || 'VeriFactu',
      idSistema: this.configService.get<string>('verifactu.systemId') || '01',
      version:
        this.configService.get<string>('verifactu.systemVersion') || '1.0',
      numeroInstalacion:
        this.configService.get<string>('verifactu.systemNumeroInstalacion') ||
        '001',
    };
  }

  /**
   * Create and send invoice immediately
   * Crear y enviar factura inmediatamente
   *
   * If AEAT submission fails, the invoice is added to the pending queue
   * for later retry instead of simulating success.
   */
  async createInvoice(invoice: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    this.logger.log(
      `Creating invoice ${invoice.invoiceNumber} for ${invoice.sellerID}`,
    );

    try {
      // Validate invoice before processing
      await this.validationService.validateInvoice(invoice);

      // Advanced validation with business rules
      const advancedValidation = await this.advancedValidationService.validateWithBusinessRules(invoice);
      if (!advancedValidation.valid) {
        const errorMessage = advancedValidation.errors.join('; ');
        this.logger.warn(`Advanced validation failed: ${errorMessage}`);
        throw new Error(`Validación avanzada fallida: ${errorMessage}`);
      }
      if (advancedValidation.warnings.length > 0) {
        this.logger.warn(`Validation warnings: ${advancedValidation.warnings.join('; ')}`);
      }

      // Add to blockchain
      const record = this.blockchainService.addRegistroAlta(invoice);

      // Persist to MongoDB
      try {
        await this.invoiceRepository.create({
          invoiceNumber: invoice.invoiceNumber,
          invoiceType: invoice.invoiceType,
          issueDate: new Date(invoice.invoiceDate),
          sellerNif: invoice.sellerID,
          sellerName: invoice.sellerName || '',
          buyerNif: invoice.buyerID,
          buyerName: invoice.buyerName,
          buyerCountry: invoice.buyerCountry,
          taxItems: invoice.taxItems.map((item) => ({
            impuesto: item.impuesto || Impuesto.IVA,
            tipoImpositivo: item.taxRate,
            baseImponible: item.taxBase,
            cuota: item.taxAmount,
          })),
          totalAmount: invoice.totalAmount || 0,
          description: invoice.text,
          status: InvoiceStatus.PENDIENTE_ENVIO,
          hash: record.hash,
          previousHash: record.previousHash,
          rawInvoiceData: invoice as any,
          queuedAt: new Date(),
        });
      } catch (dbError) {
        this.logger.error(`Failed to persist invoice to MongoDB: ${dbError}`);
      }

      // Calculate total amount
      const totalAmount =
        invoice.totalAmount ||
        this.hashService.calculateTotalAmount(invoice.taxItems);

      // Generate QR URL
      const qrUrl = this.qrService.generateQrUrl({
        nif: invoice.sellerID,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        totalAmount,
      });

      // Try to send to AEAT
      let aeatResponse: AeatResponse;
      let pendingSubmission = false;

      if (this.simulationMode) {
        this.logger.warn(
          'Simulation mode enabled - skipping actual AEAT submission',
        );
        aeatResponse = {
          status: 'Correcto',
          csv: `SIM-${Date.now()}-${invoice.invoiceNumber}`,
          rawResponse: 'Simulated AEAT response for development',
          waitSeconds: 0,
        };
      } else {
        try {
          // Build XML with system info
          const xml = this.xmlBuilderService.buildRegistroAlta(
            invoice,
            record,
            this.systemInfo,
          );
          // Send to AEAT
          aeatResponse = await this.aeatSoapService.sendRegistroAlta(xml);
        } catch (aeatError) {
          const aeatErr = aeatError as Error;
          this.logger.warn(
            `AEAT submission failed, adding to pending queue: ${aeatErr.message}`,
          );

          // Add to pending queue for later retry
          const queueItemId =
            await this.invoiceQueueService.addInvoice(invoice);
          pendingSubmission = true;

          // Return pending status (not simulated success)
          aeatResponse = {
            status: 'PendienteEnvio',
            csv: undefined,
            rawResponse: `Invoice queued for later submission (AEAT unavailable: ${aeatErr.message}). Queue ID: ${queueItemId}`,
            waitSeconds: 0,
          };
        }
      }

      // Generate QR base64 for immediate frontend display
      const qrImageBase64 = await this.qrService.generateQrBase64({
        nif: invoice.sellerID,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        totalAmount,
      });

      // Build response
      const response: InvoiceResponseDto = {
        status: aeatResponse.status,
        csv: aeatResponse.csv,
        errorCode: aeatResponse.errorCode,
        errorDescription: aeatResponse.errorDescription,
        response: aeatResponse.rawResponse,
        invoiceNumber: invoice.invoiceNumber,
        hash: record.hash,
        qrUrl,
        qrImageBase64,
        timestamp: record.timestamp,
        waitSeconds: aeatResponse.waitSeconds,
        pendingSubmission,
      };

      this.logger.log(
        `Invoice ${invoice.invoiceNumber} processed with status: ${response.status}`,
      );

      // Update MongoDB with result
      try {
        const invoiceDoc = await this.invoiceRepository.findByInvoiceNumber(
          invoice.invoiceNumber,
          invoice.sellerID,
        );
        if (invoiceDoc) {
          await this.invoiceRepository.updateAeatResponse(
            invoiceDoc._id.toString(),
            {
              aeatResponse: aeatResponse.rawResponse,
              aeatCsv: aeatResponse.csv,
              status:
                aeatResponse.status === 'Correcto'
                  ? InvoiceStatus.CONFIRMADA
                  : InvoiceStatus.PENDIENTE_ENVIO,
              qrUrl,
            },
          );
        }
      } catch (dbError) {
        this.logger.error(`Failed to update invoice in MongoDB: ${dbError}`);
      }

      return response;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create invoice: ${err.message}`);

      return {
        status: 'Error',
        errorDescription: err.message,
        invoiceNumber: invoice.invoiceNumber,
      };
    }
  }

  /**
   * Add invoice to queue for batch processing
   * Añadir factura a la cola para procesamiento por lotes
   */
  async queueInvoice(
    invoice: CreateInvoiceDto,
  ): Promise<{ itemId: string; message: string }> {
    // Validate invoice before queuing
    await this.validationService.validateInvoice(invoice);

    const itemId = await this.invoiceQueueService.addInvoice(invoice);

    return {
      itemId,
      message: `Invoice ${invoice.invoiceNumber} added to queue`,
    };
  }

  /**
   * Cancel invoice
   * Anular factura
   */
  async cancelInvoice(
    cancellation: CancelInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    this.logger.log(
      `Cancelling invoice ${cancellation.invoiceNumber} for ${cancellation.sellerID}`,
    );

    try {
      // Validate cancellation
      await this.validationService.validateCancellation(
        cancellation.invoiceNumber,
        cancellation.sellerID,
      );

      // Add to blockchain
      const record = this.blockchainService.addRegistroAnulacion(cancellation);

      // Build XML with system info
      const xml = this.xmlBuilderService.buildRegistroAnulacion(
        cancellation,
        record,
        this.systemInfo,
      );

      // Send to AEAT
      const aeatResponse =
        await this.aeatSoapService.sendRegistroAnulacion(xml);

      // Build response
      const response: InvoiceResponseDto = {
        status: aeatResponse.status,
        csv: aeatResponse.csv,
        errorCode: aeatResponse.errorCode,
        errorDescription: aeatResponse.errorDescription,
        response: aeatResponse.rawResponse,
        invoiceNumber: cancellation.invoiceNumber,
        hash: record.hash,
        timestamp: record.timestamp,
        waitSeconds: aeatResponse.waitSeconds,
      };

      this.logger.log(
        `Invoice cancellation ${cancellation.invoiceNumber} processed with status: ${response.status}`,
      );
      return response;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to cancel invoice: ${err.message}`);

      return {
        status: 'Error',
        errorDescription: err.message,
        invoiceNumber: cancellation.invoiceNumber,
      };
    }
  }

  /**
   * Add cancellation to queue for batch processing
   * Añadir anulación a la cola para procesamiento por lotes
   */
  async queueCancellation(cancellation: CancelInvoiceDto): Promise<{
    itemId: string;
    message: string;
  }> {
    const itemId = await this.invoiceQueueService.addCancellation(cancellation);

    return {
      itemId,
      message: `Cancellation ${cancellation.invoiceNumber} added to queue`,
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus(sellerNif: string) {
    return this.invoiceQueueService.getQueueStatus(sellerNif);
  }

  /**
   * Get queued item status
   */
  getQueuedItem(sellerNif: string, itemId: string): InvoiceResponseDto | null {
    const item = this.invoiceQueueService.getItem(sellerNif, itemId);

    if (!item) {
      return null;
    }

    if (item.response) {
      return item.response;
    }

    // Return pending status for items not yet processed
    return {
      status:
        item.status === 'pending'
          ? 'PendienteEnvio'
          : item.status === 'processing'
            ? 'Unknown'
            : 'Unknown',
      invoiceNumber: (item.data as CreateInvoiceDto).invoiceNumber,
      pendingSubmission: item.status === 'pending',
      queueItemId: itemId,
    };
  }

  /**
   * Get blockchain record for an invoice
   */
  async getInvoiceRecord(
    sellerNif: string,
    invoiceNumber: string,
  ): Promise<BlockchainRecord | null> {
    try {
      const doc = await this.invoiceRepository.findByInvoiceNumber(
        invoiceNumber,
        sellerNif,
      );
      if (doc) {
        return this.mapInvoiceToRecord(doc);
      }
    } catch (error) {
      this.logger.error(`Error fetching invoice record from DB: ${error}`);
    }

    return this.blockchainService.getRecordByInvoiceNumber(
      sellerNif,
      invoiceNumber,
    );
  }

  /**
   * Get all records for a seller
   */
  async getAllRecords(sellerNif: string): Promise<BlockchainRecord[]> {
    try {
      const res = await this.invoiceRepository.findAll(1, 1000, { sellerNif });
      if (res.invoices.length > 0) {
        return res.invoices.map((doc) => this.mapInvoiceToRecord(doc));
      }
    } catch (error) {
      this.logger.error(`Error fetching records from DB: ${error}`);
    }

    return this.blockchainService.getAllRecords(sellerNif);
  }

  private mapInvoiceToRecord(doc: InvoiceDocument): BlockchainRecord {
    return {
      id: doc._id.toString(),
      sellerNif: doc.sellerNif,
      invoiceNumber: doc.invoiceNumber,
      invoiceDate: doc.issueDate.toISOString(),
      type: 'alta',
      hash: doc.hash || '',
      previousHash: doc.previousHash || '',
      timestamp:
        (doc as any).createdAt?.toISOString() || new Date().toISOString(),
      invoiceData: doc.rawInvoiceData as any,
      createdAt: (doc as any).createdAt || new Date(),
    };
  }
  /**
   * Verify blockchain integrity
   */
  verifyBlockchain(sellerNif: string): boolean {
    return this.blockchainService.verifyBlockchain(sellerNif);
  }

  /**
   * Get blockchain statistics
   */
  getBlockchainStats(sellerNif: string) {
    return this.blockchainService.getChainStats(sellerNif);
  }

  /**
   * Generate QR code for an invoice and save it to the database
   */
  async generateQrCode(
    invoice: CreateInvoiceDto,
  ): Promise<{ qrUrl: string; qrBase64: string }> {
    const totalAmount =
      invoice.totalAmount ||
      this.hashService.calculateTotalAmount(invoice.taxItems);

    const qrUrl = this.qrService.generateQrUrl({
      nif: invoice.sellerID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      totalAmount,
    });

    const qrBase64 = await this.qrService.generateQrBase64({
      nif: invoice.sellerID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      totalAmount,
    });

    // Find and update the invoice with QR data
    const invoiceFound = await this.invoiceRepository.findByInvoiceNumber(
      invoice.invoiceNumber,
      invoice.sellerID,
    );

    if (invoiceFound) {
      // Update both qrUrl and qrCode fields
      invoiceFound.qrUrl = qrUrl;
      invoiceFound.qrCode = qrBase64;
      await invoiceFound.save();
      this.logger.log(`QR code saved for invoice ${invoice.invoiceNumber}`);
    } else {
      this.logger.warn(
        `Invoice not found: ${invoice.invoiceNumber} for seller ${invoice.sellerID}`,
      );
    }

    return { qrUrl, qrBase64 };
  }

  /**
   * Generate hash for invoice (without sending)
   */
  generateInvoiceHash(invoice: CreateInvoiceDto): {
    hash: string;
    timestamp: string;
    previousHash: string;
  } {
    const previousHash = this.blockchainService.getPreviousHash(
      invoice.sellerID,
    );
    const timestamp = this.hashService.generateTimestamp();

    const formattedDate = this.hashService.formatDateForHash(
      invoice.invoiceDate,
    );
    const cuotaTotal = this.hashService.calculateCuotaTotal(invoice.taxItems);
    const totalAmount =
      invoice.totalAmount ||
      this.hashService.calculateTotalAmount(invoice.taxItems);

    const hash = this.hashService.generateRegistroAltaHash({
      sellerNif: invoice.sellerID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formattedDate,
      invoiceType: invoice.invoiceType || 'F1',
      cuotaTotal,
      totalAmount,
      previousHash,
      timestamp,
    });

    return { hash, timestamp, previousHash };
  }

  /**
   * Retry all failed items in queue
   */
  async retryFailedItems(sellerNif?: string): Promise<number> {
    return this.invoiceQueueService.retryFailedItems(sellerNif);
  }

  /**
   * Retry a specific queue item
   */
  async retryQueueItem(queueId: string): Promise<boolean> {
    return this.invoiceQueueService.retryItem(queueId);
  }

  /**
   * Get queued items from database
   */
  async getQueuedItemsFromDb(
    page = 1,
    limit = 10,
    filters?: {
      status?: InvoiceStatus;
      sellerNif?: string;
    },
  ) {
    return this.invoiceQueueService.getQueuedItemsFromDb(page, limit, filters);
  }

  /**
   * Get pending count from database
   */
  async getPendingCountFromDb(): Promise<number> {
    return this.invoiceQueueService.getPendingCountFromDb();
  }

  /**
   * Get recent AEAT responses
   * Returns recent invoice responses from the queue
   */
  async getRecentResponses(
    sellerNif: string,
    limit = 10,
  ): Promise<
    {
      csv: string;
      invoiceNumber: string;
      success: boolean;
      timestamp: Date;
      message: string;
    }[]
  > {
    const items = await this.invoiceQueueService.getRecentResponses(
      sellerNif,
      limit,
    );
    return items.map((item: any) => ({
      csv: item.aeatCsv || '-',
      invoiceNumber: item.invoiceNumber,
      success:
        item.status === InvoiceStatus.ENVIADA ||
        item.status === InvoiceStatus.CONFIRMADA,
      timestamp: item.processedAt || item.updatedAt || item.createdAt,
      message:
        item.aeatResponse ||
        item.errorMessage ||
        (item.status === InvoiceStatus.CONFIRMADA
          ? 'Factura registrada correctamente'
          : 'Pendiente de envío'),
    }));
  }

  /**
   * Get today's sending statistics
   */
  async getTodayStats(sellerNif: string): Promise<{
    sentToday: number;
    accepted: number;
    rejected: number;
    avgResponseTime: number;
  }> {
    return this.invoiceQueueService.getTodayStats(sellerNif);
  }

  /**
   * Get invoices with advanced filtering, pagination, and search
   */
  async getInvoices(
    page = 1,
    limit = 10,
    filters?: {
      status?: InvoiceStatus;
      sellerNif?: string;
      buyerNif?: string;
      startDate?: Date;
      endDate?: Date;
      amountRange?: { min?: number; max?: number };
    },
    search?: string,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ invoices: InvoiceDocument[]; total: number }> {
    const searchFilters = { ...filters, search };
    return this.invoiceRepository.findAll(
      page,
      limit,
      searchFilters,
      sortBy,
      sortOrder,
    );
  }

  /**
   * Get invoice by MongoDB id
   */
  async getInvoiceById(id: string): Promise<InvoiceDocument | null> {
    return this.invoiceRepository.findById(id);
  }

  /**
   * Update due date and/or payments for an invoice (vencimientos y cobros)
   */
  async updateDueDateAndPayments(
    id: string,
    dueDate?: string,
    payments?: { date: string; amount: number; note?: string }[],
  ): Promise<InvoiceDocument | null> {
    const doc = await this.invoiceRepository.findById(id);
    if (!doc) return null;
    return this.invoiceRepository.updateDueDateAndPayments(id, {
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(payments && {
        payments: payments.map((p) => ({
          date: new Date(p.date),
          amount: p.amount,
          note: p.note,
        })),
      }),
    });
  }

  /**
   * Send invoice by email (placeholder: configure SMTP for real sending)
   */
  async sendInvoiceByEmail(
    id: string,
    toEmail: string,
  ): Promise<{ sent: boolean; message: string }> {
    const doc = await this.invoiceRepository.findById(id);
    if (!doc) {
      return { sent: false, message: 'Factura no encontrada' };
    }
    this.logger.log(
      `[Email] Would send invoice ${doc.invoiceNumber} to ${toEmail} (configure SMTP to enable)`,
    );
    return {
      sent: true,
      message: `Envío registrado a ${toEmail}. Configure SMTP para envío real.`,
    };
  }
}
