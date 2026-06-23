import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isCrmQueueProcessorEnabled } from '../config/verifactu-worker-mode';
import { VerifactuQueueProcessorService } from './verifactu-queue-processor.service';

/**
 * Procesador de cola CRM (generic_crm). Deshabilitado por defecto:
 * en el monorepo la cola canónica vive en josanz_erp y la procesa verifactu-worker.
 */
@Injectable()
export class VerifactuCrmQueueSchedulerService implements OnModuleInit {
  private readonly log = new Logger(VerifactuCrmQueueSchedulerService.name);
  private draining = false;

  constructor(private readonly processor: VerifactuQueueProcessorService) {}

  onModuleInit(): void {
    if (isCrmQueueProcessorEnabled()) {
      this.log.warn(
        'VERIFACTU_CRM_QUEUE_PROCESSOR_ENABLED=true — cola CRM local activa. No usar junto con verifactu-worker.',
      );
      return;
    }
    this.log.log(
      'Cola CRM en modo lectura; encolado vía ERP (VERIFACTU_USE_ERP_WORKER). Procesador: verifactu-worker.',
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async drainQueue(): Promise<void> {
    if (!isCrmQueueProcessorEnabled() || this.draining) {
      return;
    }
    this.draining = true;
    try {
      let hadWork = true;
      while (hadWork) {
        hadWork = await this.processor.runOnce();
      }
    } finally {
      this.draining = false;
    }
  }
}
