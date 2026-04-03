import { Injectable, Logger } from '@nestjs/common';
import { InvoiceStatus } from '../../dto/tipo-factura.enum';
import { QueueRepository } from '../../../database/services/queue.repository';
import { InvoiceRepository } from '../../../database/services/invoice.repository';

export interface RetryStrategy {
  maxRetries: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
}

/**
 * Queue Retry Service
 * Servicio inteligente de reintentos para la cola de facturas
 */
@Injectable()
export class QueueRetryService {
  private readonly logger = new Logger(QueueRetryService.name);
  private readonly defaultStrategy: RetryStrategy = {
    maxRetries: 5,
    baseDelay: 60000, // 1 minute
    maxDelay: 3600000, // 1 hour
    backoffMultiplier: 2,
  };

  constructor(
    private queueRepository: QueueRepository,
    private invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Calculate retry delay using exponential backoff
   */
  calculateRetryDelay(
    retryCount: number,
    strategy: RetryStrategy = this.defaultStrategy,
  ): number {
    const delay =
      strategy.baseDelay * Math.pow(strategy.backoffMultiplier, retryCount);
    return Math.min(delay, strategy.maxDelay);
  }

  /**
   * Check if item should be retried
   */
  shouldRetry(
    retryCount: number,
    lastError?: string,
    strategy: RetryStrategy = this.defaultStrategy,
  ): boolean {
    if (retryCount >= strategy.maxRetries) {
      return false;
    }

    // Don't retry on certain permanent errors
    if (lastError) {
      const permanentErrors = [
        'certificate expired',
        'invalid certificate',
        'unauthorized',
        'forbidden',
        'invalid invoice format',
        'duplicate invoice',
      ];

      const errorLower = lastError.toLowerCase();
      if (permanentErrors.some((err) => errorLower.includes(err))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Retry failed items with intelligent scheduling
   */
  async retryFailedItems(sellerNif?: string): Promise<number> {
    try {
      const failedItems = await this.queueRepository.findFailedItems(sellerNif);
      let retriedCount = 0;

      for (const item of failedItems) {
        const retryCount = item.retryCount || 0;

        if (this.shouldRetry(retryCount, item.errorMessage)) {
          // Calculate next retry time
          const delay = this.calculateRetryDelay(retryCount);
          const nextRetryAt = new Date(Date.now() + delay);

          // Update item for retry
          await this.queueRepository.updateItemStatus(
            item.queueId,
            InvoiceStatus.PENDIENTE_ENVIO,
            {
              retryCount: retryCount + 1,
              nextRetryAt,
              errorMessage: undefined,
            },
          );

          retriedCount++;
          this.logger.log(
            `Scheduled retry for item ${item.queueId} (attempt ${retryCount + 1}/${this.defaultStrategy.maxRetries})`,
          );
        } else {
          // Mark as permanently failed
          await this.queueRepository.updateItemStatus(
            item.queueId,
            InvoiceStatus.ERROR,
            {
              errorMessage: `Max retries (${this.defaultStrategy.maxRetries}) exceeded`,
            },
          );

          // Update invoice status if exists
          if (item.invoiceNumber) {
            const invoice = await this.invoiceRepository.findByInvoiceNumber(
              item.invoiceNumber,
              item.sellerNif,
            );
            if (invoice) {
              await this.invoiceRepository.updateStatus(
                invoice._id.toString(),
                InvoiceStatus.ERROR,
                {
                  errorMessage: `Max retries exceeded: ${item.errorMessage}`,
                },
              );
            }
          }

          this.logger.warn(
            `Item ${item.queueId} marked as permanently failed after ${retryCount} retries`,
          );
        }
      }

      return retriedCount;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error retrying failed items: ${err.message}`);
      return 0;
    }
  }

  /**
   * Get retry statistics
   */
  async getRetryStatistics(sellerNif?: string): Promise<{
    totalFailed: number;
    retryable: number;
    permanentlyFailed: number;
    averageRetries: number;
  }> {
    try {
      const failedItems = await this.queueRepository.findFailedItems(sellerNif);

      let retryable = 0;
      let permanentlyFailed = 0;
      let totalRetries = 0;

      failedItems.forEach((item) => {
        const retryCount = item.retryCount || 0;
        totalRetries += retryCount;

        if (this.shouldRetry(retryCount, item.errorMessage)) {
          retryable++;
        } else {
          permanentlyFailed++;
        }
      });

      return {
        totalFailed: failedItems.length,
        retryable,
        permanentlyFailed,
        averageRetries:
          failedItems.length > 0
            ? totalRetries / failedItems.length
            : 0,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error getting retry statistics: ${err.message}`);
      return {
        totalFailed: 0,
        retryable: 0,
        permanentlyFailed: 0,
        averageRetries: 0,
      };
    }
  }

  /**
   * Clean up old failed items
   */
  async cleanupOldFailedItems(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deleted = await this.queueRepository.deleteOldFailedItems(
        cutoffDate,
      );

      this.logger.log(`Cleaned up ${deleted} old failed items`);
      return deleted;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error cleaning up old items: ${err.message}`);
      return 0;
    }
  }
}
