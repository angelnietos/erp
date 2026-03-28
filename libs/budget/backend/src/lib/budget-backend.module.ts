import { DynamicModule, Module } from '@nestjs/common';
import { BudgetService } from './application/services/budget.service';
import { BudgetController } from './presentation/controllers/budget.controller';
import { BUDGET_REPOSITORY } from '@josanz-erp/budget-core';
import { PrismaBudgetRepository } from './infrastructure/repositories/prisma-budget.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

export interface BudgetConfig {
  enableApprovalFlow: boolean;
}

@Module({})
export class BudgetBackendModule {
  static forRoot(options?: BudgetConfig): DynamicModule {
    return {
      module: BudgetBackendModule,
      imports: [SharedInfrastructureModule],
      controllers: [BudgetController],
      providers: [
        BudgetService,
        {
          provide: BUDGET_REPOSITORY,
          useClass: PrismaBudgetRepository,
        },
        {
          provide: 'BUDGET_CONFIG',
          useValue: options || { enableApprovalFlow: false },
        },
      ],
      exports: [BudgetService],
    };
  }
}