import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@generic-crm/shared-infrastructure';
import { VerifactuModule } from '@generic-crm/verifactu-backend';
import { InvoicingApplicationService } from './application/invoicing.application.service';
import { InvoicingController } from './presentation/invoicing.controller';

@Module({
  imports: [SharedInfrastructureModule, VerifactuModule],
  controllers: [InvoicingController],
  providers: [InvoicingApplicationService],
  exports: [InvoicingApplicationService],
})
export class InvoicingModule {}
