import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { VerifactuFeatureModule } from '@josanz-erp/verifactu-adapters';
import { VerifactuAppService } from './application/services/verifactu-app.service';
import { VerifactuRuntimeFacade } from './infrastructure/services/verifactu-runtime.facade';
import { VerifactuController } from './presentation/controllers/verifactu.controller';

// App-level Verifactu module following backend structure (domain/application/infrastructure/presentation at app layer).
// The business logic lives in libs/verifactu/* and is wired here for the API runtime.
@Module({
  imports: [VerifactuFeatureModule],
  controllers: [VerifactuController],
  providers: [
    VerifactuRuntimeFacade,
    VerifactuAppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    },
  ],
  exports: [],
})
export class VerifactuModule {}

