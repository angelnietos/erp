import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import {
  BlockchainService,
  BlockchainRecord,
} from '../blockchain/blockchain.service';
import { XmlBuilderService } from '../xml/xml-builder.service';
import { AeatSoapService } from '../aeat/aeat-soap.service';
import { QrService } from '../qr/qr.service';
import { HashService } from '../hash/hash.service';
import { QueueRepository } from '../../database/services/queue.repository';
import { InvoiceRepository } from '../../database/services/invoice.repository';
import { InvoiceStatus } from '../dto/tipo-factura.enum';

/**
 * Queue item type for in-memory processing
 */
interface QueueItem {
  id: string;
  type: 'alta' | 'anulacion';
  data: CreateInvoiceDto | CancelInvoiceDto;
  status: 'pending' | 'processing' | 'sent' | 'error';
  response?: InvoiceResponseDto;
  record?: BlockchainRecord;
  createdAt: Date;
  processedAt?: Date;
}

/**
 * Seller queue state
 */
interface SellerQueueState {
  items: QueueItem[];
  lastProcessMoment: Date | null;
  currentWaitSeconds: number;
  processing: boolean;
}

/**
 * Invoice Queue Service - Manages the flow control for sending invoices to AEAT
 * Servicio de Cola de Facturas - Gestiona el control de flujo para enviar facturas a la AEAT
 */
@Injectable()
export class InvoiceQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InvoiceQueueService.name);
  private queues: Map<string, SellerQueueState> = new Map();
  private processingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private maxQueueSize: number;
  private defaultWaitSeconds: number;
  private useMongoDb: boolean = false;

  constructor(
    private configService: ConfigService,
    private blockchainService: BlockchainService,
    private xmlBuilderService: XmlBuilderService,
    private aeatSoapService: AeatSoapService,
    private qrService: QrService,
    private hashService: HashService,
    private queueRepository: QueueRepository,
    private invoiceRepository: InvoiceRepository,
  ) {
    this.maxQueueSize =
      this.configService.get<number>('verifactu.maxQueueSize') || 1000;
    this.defaultWaitSeconds =
      this.configService.get<number>('verifactu.waitSecondsBetweenCalls') || 60;
  }

  async onModuleInit() {
    this.isRunning = true;
    this.logger.log('Invoice queue service initialized');

    // Try to load pending items from MongoDB
    try {
      await this.loadPendingItemsFromDb();
      this.useMongoDb = true;
      this.logger.log('MongoDB persistence enabled');
    } catch (error) {
      const err = error as Error;
      this.logger.warn(
        `MongoDB not available, using in-memory queue: ${err.message}`,
      );
      this.useMongoDb = false;
    }
  }

  onModuleDestroy() {
    this.stopAllProcessing();
    this.logger.log('Invoice queue service destroyed');
  }

  /**
   * Load pending items from database on startup
   */
  private async loadPendingItemsFromDb(): Promise<void> {
    const pendingItems = await this.queueRepository.findPendingItems();

    for (const item of pendingItems) {
      const sellerNif = item.sellerNif;
      const sellerQueue = this.getSellerQueue(sellerNif);

      sellerQueue.items.push({
        id: item.queueId,
        type: 'alta', // Default to alta, could be stored in DB
        data: item.invoiceData as CreateInvoiceDto,
        status: 'pending',
        createdAt: item.createdAt,
        record: item.hash
          ? ({
              id: item.queueId,
              hash: item.hash,
              previousHash: item.previousHash || '',
              timestamp: item.createdAt.toISOString(),
              sellerNif: item.sellerNif,
              invoiceNumber: item.invoiceNumber,
              invoiceDate:
                item.invoiceData.issueDate?.toString() ||
                new Date().toISOString(),
              type: 'alta' as const,
              createdAt: item.createdAt,
            } as BlockchainRecord)
          : undefined,
      });
    }

    this.logger.log(
      `Loaded ${pendingItems.length} pending items from database`,
    );
  }

  /**
   * Get or create queue state for a seller
   */
  private getSellerQueue(sellerNif: string): SellerQueueState {
    if (!this.queues.has(sellerNif)) {
      this.queues.set(sellerNif, {
        items: [],
        lastProcessMoment: null,
        currentWaitSeconds: this.defaultWaitSeconds,
        processing: false,
      });
    }
    return this.queues.get(sellerNif)!;
  }

  /**
   * Add invoice registration to queue
   */
  async addInvoice(invoice: CreateInvoiceDto): Promise<string> {
    const sellerQueue = this.getSellerQueue(invoice.sellerID);

    // Create blockchain record
    const record = this.blockchainService.addRegistroAlta(invoice);

    const item: QueueItem = {
      id: uuidv4(),
      type: 'alta',
      data: invoice,
      status: 'pending',
      createdAt: new Date(),
      record,
    };

    sellerQueue.items.push(item);
    this.logger.log(
      `Added invoice ${invoice.invoiceNumber} to queue for ${invoice.sellerID}`,
    );

    // Persist to MongoDB if available
    if (this.useMongoDb) {
      try {
        await this.queueRepository.addToQueue(
          invoice as Record<string, any>,
          record.hash,
          record.previousHash,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to persist invoice to MongoDB: ${err.message}`,
        );
      }
    }

    // Start processing if not already running
    this.startProcessingIfNeeded(invoice.sellerID);

    return item.id;
  }

  /**
   * Add invoice cancellation to queue
   */
  async addCancellation(cancellation: CancelInvoiceDto): Promise<string> {
    const sellerQueue = this.getSellerQueue(cancellation.sellerID);

    // Create blockchain record
    const record = this.blockchainService.addRegistroAnulacion(cancellation);

    const item: QueueItem = {
      id: uuidv4(),
      type: 'anulacion',
      data: cancellation,
      status: 'pending',
      createdAt: new Date(),
      record,
    };

    sellerQueue.items.push(item);
    this.logger.log(
      `Added cancellation ${cancellation.invoiceNumber} to queue for ${cancellation.sellerID}`,
    );

    // Persist to MongoDB if available
    if (this.useMongoDb) {
      try {
        await this.queueRepository.addToQueue(
          cancellation as Record<string, any>,
          record.hash,
          record.previousHash,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to persist cancellation to MongoDB: ${err.message}`,
        );
      }
    }

    // Start processing if not already running
    this.startProcessingIfNeeded(cancellation.sellerID);

    return item.id;
  }

  /**
   * Start processing if needed
   */
  private startProcessingIfNeeded(sellerNif: string): void {
    const sellerQueue = this.getSellerQueue(sellerNif);

    if (sellerQueue.processing) {
      return;
    }

    // Check if we should start processing
    const pendingCount = sellerQueue.items.filter(
      (i) => i.status === 'pending',
    ).length;

    if (pendingCount >= this.maxQueueSize) {
      this.startProcessing(sellerNif);
    } else {
      // Check if wait time has elapsed
      if (this.canProcess(sellerNif)) {
        this.startProcessing(sellerNif);
      } else {
        // Schedule processing after wait time
        this.scheduleProcessing(sellerNif);
      }
    }
  }

  /**
   * Check if we can process now
   */
  private canProcess(sellerNif: string): boolean {
    const sellerQueue = this.getSellerQueue(sellerNif);

    if (!sellerQueue.lastProcessMoment) {
      return true;
    }

    const elapsed = Date.now() - sellerQueue.lastProcessMoment.getTime();
    return elapsed >= sellerQueue.currentWaitSeconds * 1000;
  }

  /**
   * Schedule processing after wait time
   */
  private scheduleProcessing(sellerNif: string): void {
    const sellerQueue = this.getSellerQueue(sellerNif);

    if (this.processingIntervals.has(sellerNif)) {
      return;
    }

    const waitMs = sellerQueue.currentWaitSeconds * 1000;

    const timeout = setTimeout(() => {
      this.processingIntervals.delete(sellerNif);
      if (
        this.isRunning &&
        sellerQueue.items.some((i) => i.status === 'pending')
      ) {
        this.startProcessing(sellerNif);
      }
    }, waitMs);

    this.processingIntervals.set(sellerNif, timeout);
    this.logger.log(
      `Scheduled processing for ${sellerNif} in ${sellerQueue.currentWaitSeconds} seconds`,
    );
  }

  /**
   * Start processing queue
   */
  private async startProcessing(sellerNif: string): Promise<void> {
    const sellerQueue = this.getSellerQueue(sellerNif);

    if (sellerQueue.processing) {
      return;
    }

    sellerQueue.processing = true;
    this.logger.log(`Starting processing for ${sellerNif}`);

    try {
      await this.processQueue(sellerNif);
    } finally {
      sellerQueue.processing = false;
      sellerQueue.lastProcessMoment = new Date();

      // Check if there are more pending items
      const pendingCount = sellerQueue.items.filter(
        (i) => i.status === 'pending',
      ).length;
      if (pendingCount > 0) {
        this.scheduleProcessing(sellerNif);
      }
    }
  }

  /**
   * Process queue items
   */
  private async processQueue(sellerNif: string): Promise<void> {
    const sellerQueue = this.getSellerQueue(sellerNif);
    const pendingItems = sellerQueue.items.filter(
      (i) => i.status === 'pending',
    );

    if (pendingItems.length === 0) {
      return;
    }

    // Take up to maxQueueSize items
    const itemsToProcess = pendingItems.slice(0, this.maxQueueSize);

    this.logger.log(
      `Processing ${itemsToProcess.length} items for ${sellerNif}`,
    );

    // Update blockchain for all items
    for (const item of itemsToProcess) {
      item.status = 'processing';
      if (!item.record) {
        if (item.type === 'alta') {
          item.record = this.blockchainService.addRegistroAlta(
            item.data as CreateInvoiceDto,
          );
        } else {
          item.record = this.blockchainService.addRegistroAnulacion(
            item.data as CancelInvoiceDto,
          );
        }
      }
    }

    // Build batch XML
    const records = itemsToProcess.map((item) => ({
      invoice: item.data,
      record: item.record!,
      type: item.type,
    }));

    const loteXml = this.xmlBuilderService.buildLoteRegistros(records);

    try {
      // Send to AEAT
      const aeatResponse =
        await this.aeatSoapService.sendLoteRegistros(loteXml);

      // Update items with response
      for (const item of itemsToProcess) {
        item.status = 'sent';
        item.processedAt = new Date();

        const invoice = item.data as CreateInvoiceDto;
        const totalAmount =
          invoice.totalAmount ||
          this.hashService.calculateTotalAmount(invoice.taxItems || []);

        item.response = {
          status: aeatResponse.status,
          csv: aeatResponse.csv,
          errorCode: aeatResponse.errorCode,
          errorDescription: aeatResponse.errorDescription,
          response: aeatResponse.rawResponse,
          invoiceNumber: (item.data as CreateInvoiceDto).invoiceNumber,
          hash: item.record?.hash,
          qrUrl: this.qrService.generateQrUrl({
            nif: sellerNif,
            invoiceNumber: (item.data as CreateInvoiceDto).invoiceNumber,
            invoiceDate: (item.data as CreateInvoiceDto).invoiceDate,
            totalAmount,
          }),
          timestamp: item.record?.timestamp,
          waitSeconds: aeatResponse.waitSeconds,
        };

        // Update MongoDB if available
        if (this.useMongoDb) {
          try {
            await this.queueRepository.markAsSent(
              item.id,
              aeatResponse.rawResponse || '',
              aeatResponse.csv,
            );
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Failed to update queue item in MongoDB: ${err.message}`,
            );
          }
        }
      }

      // Update wait time
      sellerQueue.currentWaitSeconds =
        aeatResponse.waitSeconds || this.defaultWaitSeconds;

      this.logger.log(
        `Processed ${itemsToProcess.length} items for ${sellerNif}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to process batch for ${sellerNif}: ${err.message}`,
      );

      // Mark items as error
      for (const item of itemsToProcess) {
        item.status = 'error';
        item.processedAt = new Date();
        item.response = {
          status: 'Error',
          errorDescription: err.message,
          invoiceNumber: (item.data as CreateInvoiceDto).invoiceNumber,
        };

        // Update MongoDB if available
        if (this.useMongoDb) {
          try {
            await this.queueRepository.markAsError(item.id, err.message);
          } catch (dbError) {
            const dbErr = dbError as Error;
            this.logger.error(
              `Failed to mark error in MongoDB: ${dbErr.message}`,
            );
          }
        }
      }
    }
  }

  /**
   * Get queue status for a seller
   */
  getQueueStatus(sellerNif: string): {
    pending: number;
    processing: number;
    sent: number;
    error: number;
    total: number;
  } {
    const sellerQueue = this.getSellerQueue(sellerNif);

    return {
      pending: sellerQueue.items.filter((i) => i.status === 'pending').length,
      processing: sellerQueue.items.filter((i) => i.status === 'processing')
        .length,
      sent: sellerQueue.items.filter((i) => i.status === 'sent').length,
      error: sellerQueue.items.filter((i) => i.status === 'error').length,
      total: sellerQueue.items.length,
    };
  }

  /**
   * Get item by ID
   */
  getItem(sellerNif: string, itemId: string): QueueItem | null {
    const sellerQueue = this.getSellerQueue(sellerNif);
    return sellerQueue.items.find((i) => i.id === itemId) || null;
  }

  /**
   * Get all items for a seller
   */
  getAllItems(sellerNif: string): QueueItem[] {
    const sellerQueue = this.getSellerQueue(sellerNif);
    return sellerQueue.items;
  }

  /**
   * Get recent responses from database
   */
  async getRecentResponses(sellerNif: string, limit: number): Promise<any[]> {
    // First try to get from database if MongoDB is available
    if (this.useMongoDb) {
      try {
        const result = await this.queueRepository.findAll(1, limit, {
          sellerNif,
        });
        return result.items
          .filter((i: any) => i.processedAt)
          .sort(
            (a: any, b: any) =>
              new Date(b.processedAt).getTime() -
              new Date(a.processedAt).getTime(),
          )
          .slice(0, limit);
      } catch (error) {
        this.logger.error('Error fetching recent responses from DB:', error);
      }
    }

    // Fall back to in-memory queue
    const sellerQueue = this.getSellerQueue(sellerNif);
    return sellerQueue.items
      .filter((i) => i.processedAt)
      .sort(
        (a, b) =>
          (b.processedAt?.getTime() || 0) - (a.processedAt?.getTime() || 0),
      )
      .slice(0, limit);
  }

  /**
   * Get today's statistics
   */
  async getTodayStats(sellerNif: string): Promise<{
    sentToday: number;
    accepted: number;
    rejected: number;
    avgResponseTime: number;
  }> {
    // First try to get from database if MongoDB is available
    if (this.useMongoDb) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const result = await this.queueRepository.findAll(1, 1000, {
          sellerNif,
        });
        const allItems = result.items;

        const todayItems = allItems.filter((item: any) => {
          const processedAt = item.processedAt;
          if (!processedAt) return false;
          const processedDate = new Date(processedAt);
          return (
            processedDate.getTime() >= today.getTime() &&
            processedDate.getTime() <= todayEnd.getTime()
          );
        });

        const sentToday = todayItems.length;
        const accepted = todayItems.filter(
          (i: any) =>
            i.status === 'sent' ||
            i.status === InvoiceStatus.ENVIADA ||
            i.status === InvoiceStatus.CONFIRMADA,
        ).length;
        const rejected = todayItems.filter(
          (i: any) =>
            i.status === 'error' || i.status === InvoiceStatus.RECHAZADA,
        ).length;

        let avgResponseTime = 0;
        if (todayItems.length > 0) {
          const totalTime = todayItems.reduce((sum: number, item: any) => {
            if (item.processedAt && item.createdAt) {
              return (
                sum +
                (new Date(item.processedAt).getTime() -
                  new Date(item.createdAt).getTime())
              );
            }
            return sum;
          }, 0);
          avgResponseTime = totalTime / todayItems.length / 1000;
        }

        return {
          sentToday,
          accepted,
          rejected,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        };
      } catch (error) {
        this.logger.error('Error fetching stats from DB:', error);
      }
    }

    // Fall back to in-memory queue
    const sellerQueue = this.getSellerQueue(sellerNif);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get items processed today
    const todayItems = sellerQueue.items.filter((item) => {
      const processedAt = item.processedAt;
      if (!processedAt) return false;
      return (
        processedAt.getTime() >= today.getTime() &&
        processedAt.getTime() <= todayEnd.getTime()
      );
    });

    const sentToday = todayItems.length;
    const accepted = todayItems.filter((i) => i.status === 'sent').length;
    const rejected = todayItems.filter((i) => i.status === 'error').length;

    // Calculate average response time
    let avgResponseTime = 0;
    if (todayItems.length > 0) {
      const totalTime = todayItems.reduce((sum, item) => {
        if (item.processedAt && item.createdAt) {
          return sum + (item.processedAt.getTime() - item.createdAt.getTime());
        }
        return sum;
      }, 0);
      avgResponseTime = totalTime / todayItems.length / 1000; // Convert to seconds
    }

    return {
      sentToday,
      accepted,
      rejected,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Clear processed items
   */
  clearProcessedItems(sellerNif: string): number {
    const sellerQueue = this.getSellerQueue(sellerNif);
    const initialLength = sellerQueue.items.length;

    sellerQueue.items = sellerQueue.items.filter(
      (i) => i.status !== 'sent' && i.status !== 'error',
    );

    return initialLength - sellerQueue.items.length;
  }

  /**
   * Stop all processing
   */
  stopAllProcessing(): void {
    this.isRunning = false;

    for (const [sellerNif, timeout] of this.processingIntervals) {
      clearTimeout(timeout);
      this.processingIntervals.delete(sellerNif);
    }

    this.logger.log('All processing stopped');
  }

  /**
   * Resume processing
   */
  resumeProcessing(): void {
    this.isRunning = true;

    for (const [sellerNif, sellerQueue] of this.queues) {
      if (sellerQueue.items.some((i) => i.status === 'pending')) {
        this.startProcessingIfNeeded(sellerNif);
      }
    }

    this.logger.log('Processing resumed');
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(sellerNif?: string): Promise<number> {
    let retryCount = 0;

    const queuesToProcess = sellerNif
      ? [sellerNif]
      : Array.from(this.queues.keys());

    for (const nif of queuesToProcess) {
      const sellerQueue = this.getSellerQueue(nif);
      const failedItems = sellerQueue.items.filter((i) => i.status === 'error');

      for (const item of failedItems) {
        item.status = 'pending';
        item.response = undefined;
        retryCount++;

        // Update MongoDB if available
        if (this.useMongoDb) {
          try {
            await this.queueRepository.updateStatus(
              item.id,
              InvoiceStatus.PENDIENTE_ENVIO,
            );
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Failed to update retry status in MongoDB: ${err.message}`,
            );
          }
        }
      }

      if (failedItems.length > 0) {
        this.startProcessingIfNeeded(nif);
      }
    }

    this.logger.log(`Retrying ${retryCount} failed items`);
    return retryCount;
  }

  /**
   * Retry a specific item by queue ID
   */
  async retryItem(queueId: string): Promise<boolean> {
    for (const [sellerNif, sellerQueue] of this.queues) {
      const item = sellerQueue.items.find((i) => i.id === queueId);
      if (item && item.status === 'error') {
        item.status = 'pending';
        item.response = undefined;

        // Update MongoDB if available
        if (this.useMongoDb) {
          try {
            await this.queueRepository.updateStatus(
              queueId,
              InvoiceStatus.PENDIENTE_ENVIO,
            );
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Failed to update retry status in MongoDB: ${err.message}`,
            );
          }
        }

        this.startProcessingIfNeeded(sellerNif);
        return true;
      }
    }
    return false;
  }

  /**
   * Get pending count from database
   */
  async getPendingCountFromDb(): Promise<number> {
    if (!this.useMongoDb) {
      return 0;
    }
    return this.queueRepository.countPending();
  }

  /**
   * Get all queued items from database
   */
  async getQueuedItemsFromDb(
    page = 1,
    limit = 10,
    filters?: {
      status?: InvoiceStatus;
      sellerNif?: string;
    },
  ): Promise<{ items: any[]; total: number }> {
    if (!this.useMongoDb) {
      return { items: [], total: 0 };
    }
    return this.queueRepository.findAll(page, limit, filters);
  }
}
