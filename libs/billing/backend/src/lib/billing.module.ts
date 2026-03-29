import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { BillingController } from './infrastructure/http/billing.controller';
import { SubmitInvoiceToVerifactuUseCase } from './application/use-cases/submit-invoice-to-verifactu.use-case';
import { VERIFACTU_SUBMISSION_PORT } from './application/ports/verifactu-submission.port';
import { VerifactuSubmissionAdapter } from './infrastructure/adapters/verifactu/verifactu-submission.adapter';
import { VerifactuErpAdapterModule } from '@josanz-erp/verifactu-adapters';

export interface BillingConfig {
  _isBillingConfig?: boolean;
}

export interface InventoryConfig {
  _isInventoryConfig?: boolean;
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

