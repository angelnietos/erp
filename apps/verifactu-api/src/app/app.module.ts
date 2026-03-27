import { Module } from '@nestjs/common';
import { VerifactuFeatureModule } from '@josanz-erp/verifactu-adapters';

@Module({
  imports: [VerifactuFeatureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
