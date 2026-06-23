import type {
  ClaimedVerifactuJob,
  VerifactuLogRow,
  VerifactuQueueRow,
  VerifactuSeriesRow,
} from './verifactu.types';
import type { VerifactuSubmissionResult } from './verifactu-aeat.contract';

export const VERIFACTU_REPOSITORY = Symbol('VERIFACTU_REPOSITORY');

export interface VerifactuRepositoryPort {
  listQueue(tenantId: string): Promise<VerifactuQueueRow[]>;
  enqueuePendingInvoice(
    tenantId: string,
    invoiceId: string,
  ): Promise<{ id: string }>;
  listSeries(tenantId: string): Promise<VerifactuSeriesRow[]>;
  createSeries(
    tenantId: string,
    input: { code: string; description?: string },
  ): Promise<VerifactuSeriesRow>;
  listLogs(
    tenantId: string,
    query?: { invoiceId?: string; limit?: number },
  ): Promise<VerifactuLogRow[]>;

  /** Una fila PENDING → PROCESSING (SKIP LOCKED). */
  claimNextForProcessing(): Promise<ClaimedVerifactuJob | null>;

  completeWithSuccess(
    queueItemId: string,
    tenantId: string,
    log: { requestPayload: unknown; responsePayload: unknown },
  ): Promise<void>;

  /**
   * Actualiza la cabeza de cadena tras un envío exitoso si el resultado aporta huella/id (o CSV mapeable).
   */
  persistAeatChainHeadIfPresent(
    tenantId: string,
    result: VerifactuSubmissionResult,
  ): Promise<void>;

  completeWithFailure(
    queueItemId: string,
    tenantId: string,
    errorMessage: string,
    log: { requestPayload: unknown; responsePayload: unknown },
  ): Promise<void>;
}
