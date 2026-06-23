import type {
  ClaimedVerifactuJob,
  VerifactuChainBlockRow,
  VerifactuChainVerificationView,
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
  /** Fila espejo en CRM cuando la cola real está en josanz_erp (verifactu-worker). */
  trackErpForwardedQueueItem(
    tenantId: string,
    invoiceId: string,
    erpQueueItemId: string,
  ): Promise<{ id: string }>;
  /** Actualiza el espejo CRM tras procesar verifactu-worker. */
  applyErpQueueStatus(
    tenantId: string,
    invoiceId: string,
    input: {
      status: 'COMPLETED' | 'FAILED';
      lastError?: string | null;
      responsePayload?: Record<string, unknown>;
    },
  ): Promise<void>;

  /** Registra anulación en el ledger inmutable (trazabilidad interna). */
  appendCancellationBlock(
    tenantId: string,
    invoiceId: string,
    input: { motivoAnulacion: string; additionalInfo?: string | null },
  ): Promise<void>;
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
    submissionResult?: VerifactuSubmissionResult,
  ): Promise<void>;

  /**
   * Actualiza la cabeza de cadena tras un envío exitoso si el resultado aporta huella/id (o CSV mapeable).
   * @deprecated Preferir completeWithSuccess con submissionResult (atómico con el bloque del ledger).
   */
  persistAeatChainHeadIfPresent(
    tenantId: string,
    result: VerifactuSubmissionResult,
  ): Promise<void>;

  listChainBlocks(
    tenantId: string,
    query?: { limit?: number; invoiceId?: string },
  ): Promise<VerifactuChainBlockRow[]>;

  verifyChainIntegrity(tenantId: string): Promise<VerifactuChainVerificationView>;

  completeWithFailure(
    queueItemId: string,
    tenantId: string,
    errorMessage: string,
    log: { requestPayload: unknown; responsePayload: unknown },
  ): Promise<void>;
}
