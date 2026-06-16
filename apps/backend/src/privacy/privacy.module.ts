import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';
import { PrivacyRequestService } from './privacy-request.service';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [PrivacyController],
  providers: [PrivacyService, PrivacyRequestService],
})
export class PrivacyModule {}
