import { Module } from '@nestjs/common';
import { VerifactuFeatureModule } from '@josanz-erp/verifactu-adapters';

// App-level Verifactu module following backend structure (domain/application/infrastructure/presentation at app layer).
// The business logic lives in libs/verifactu/* and is wired here for the API runtime.
@Module({
  imports: [VerifactuFeatureModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class VerifactuModule {}

