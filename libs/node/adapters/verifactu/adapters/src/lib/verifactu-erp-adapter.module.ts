import { Module } from '@nestjs/common';
import { VerifactuSubmissionHttpClient } from './http/verifactu-submission-http.client';

@Module({
  providers: [VerifactuSubmissionHttpClient],
  exports: [VerifactuSubmissionHttpClient],
})
export class VerifactuErpAdapterModule {}

