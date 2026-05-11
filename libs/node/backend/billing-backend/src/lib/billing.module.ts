import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { BillingController } from './infrastructure/http/billing.controller';
import { SubmitInvoiceToVerifactuUseCase } from './application/use-cases/submit-invoice-to-verifactu.use-case';
import { VERIFACTU_SUBMISSION_PORT } from './application/ports/verifactu-submission.port';
import { VerifactuSubmissionAdapter } from './infrastructure/adapters/verifactu/verifactu-submission.adapter';
import { VerifactuErpAdapterModule } from '@josanz-erp/verifactu-adapters';
import { InvoiceService } from './application/services/invoice.service';

export interface BillingConfig {
  _isBillingConfig?: boolean;
}
 
@Module({})
export class BillingModule {
  static forRoot(options?: BillingConfig): DynamicModule {
    return {
      module: BillingModule,
      imports: [PrismaModule, VerifactuErpAdapterModule],
      controllers: [BillingController],
      providers: [
        SubmitInvoiceToVerifactuUseCase,
        InvoiceService,
        {
          provide: VERIFACTU_SUBMISSION_PORT,
          useClass: VerifactuSubmissionAdapter,
        },
        {
          provide: 'BILLING_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

