import { Module } from '@nestjs/common';
import { BudgetService } from './application/services/budget.service';
import { BudgetController } from './presentation/controllers/budget.controller';
import { BUDGET_REPOSITORY } from '@josanz-erp/budget-core';
import { PrismaBudgetRepository } from './infrastructure/repositories/prisma-budget.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [BudgetController],
  providers: [
    BudgetService,
    {
      provide: BUDGET_REPOSITORY,
      useClass: PrismaBudgetRepository,
    },
  ],
  exports: [BudgetService],
})
export class BudgetBackendModule {}