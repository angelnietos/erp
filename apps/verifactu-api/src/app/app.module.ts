import { Module } from '@nestjs/common';
import { VerifactuModule } from '../modules/verifactu/verifactu.module';

@Module({
  imports: [VerifactuModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
