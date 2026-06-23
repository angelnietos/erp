import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  ClaimedVerifactuJob,
  VerifactuRepositoryPort,
  VerifactuSubmissionPayload,
  VerifactuSubmissionPort,
} from '@generic-crm/verifactu-core';
import {
  VERIFACTU_REPOSITORY,
  VERIFACTU_SUBMISSION,
} from '@generic-crm/verifactu-core';
import { isCrmQueueProcessorEnabled } from '../config/verifactu-worker-mode';

@Injectable()
export class VerifactuQueueProcessorService {
  private readonly log = new Logger(VerifactuQueueProcessorService.name);

  constructor(
    @Inject(VERIFACTU_REPOSITORY)
    private readonly repo: VerifactuRepositoryPort,
    @Inject(VERIFACTU_SUBMISSION)
    private readonly submission: VerifactuSubmissionPort,
  ) {}

  /** Procesa un único trabajo de cola; devuelve si había trabajo. */
  async runOnce(): Promise<boolean> {
    if (!isCrmQueueProcessorEnabled()) {
      return false;
    }
    const job = await this.repo.claimNextForProcessing();
    if (!job) {
      return false;
    }
    this.log.debug(
      `Verifactu: procesando cola ${job.queueItemId} factura ${job.invoiceId} tenant ${job.tenantId}`,
    );
    const payload = this.toPayload(job);
    try {
      const res = await this.submission.submit(payload);
      await this.repo.completeWithSuccess(job.queueItemId, job.tenantId, {
        requestPayload: payload,
        responsePayload: res,
      }, res);
      this.log.log(
        `Verifactu: envío correcto (cola ${job.queueItemId}, factura ${job.invoiceId}, tenant ${job.tenantId})`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.log.warn(
        `Verifactu: fallo envío (cola ${job.queueItemId}, factura ${job.invoiceId}, tenant ${job.tenantId}): ${message}`,
      );
      await this.repo.completeWithFailure(
        job.queueItemId,
        job.tenantId,
        message,
        {
          requestPayload: payload,
          responsePayload: { error: message },
        },
      );
    }
    return true;
  }

  private toPayload(job: ClaimedVerifactuJob): VerifactuSubmissionPayload {
    const issuedOn = job.invoice.issuedAt
      ? job.invoice.issuedAt.toISOString().slice(0, 10)
      : null;
    const rectifies = job.invoice.rectifiesInvoice;
    return {
      tenantId: job.tenantId,
      invoiceId: job.invoiceId,
      invoiceNumber: job.invoice.number,
      total: job.invoice.total,
      currency: job.invoice.currency,
      customerTaxId: job.invoice.client?.taxId ?? null,
      customerName: job.invoice.client?.name ?? null,
      issuedOn,
      emitterTaxId: job.emitterTaxId,
      previousRegistry: job.previousRegistry,
      invoiceKind:
        job.invoice.invoiceKind === 'RECTIFICATIVE' ? 'RECTIFICATIVE' : 'NORMAL',
      rectificationType:
        job.invoice.rectificationType === 'S' ||
        job.invoice.rectificationType === 'I'
          ? job.invoice.rectificationType
          : null,
      rectificationReason: job.invoice.rectificationReason,
      rectifiesInvoice: rectifies
        ? {
            id: rectifies.id,
            number: rectifies.number,
            issuedOn: rectifies.issuedAt
              ? rectifies.issuedAt.toISOString().slice(0, 10)
              : null,
          }
        : null,
    };
  }
}
