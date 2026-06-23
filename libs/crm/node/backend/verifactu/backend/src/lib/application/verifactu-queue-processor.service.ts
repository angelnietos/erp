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
      });
      try {
        await this.repo.persistAeatChainHeadIfPresent(job.tenantId, res);
      } catch (chainErr) {
        this.log.warn(
          `Encadenamiento: no se pudo persistir cabeza AEAT para tenant ${job.tenantId}: ${
            chainErr instanceof Error ? chainErr.message : String(chainErr)
          }`,
        );
      }
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
    };
  }
}
