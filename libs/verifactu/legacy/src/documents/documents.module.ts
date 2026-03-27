import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { InvoiceModule } from '../invoice/invoice.module';
import { SeriesModule } from '../series/series.module';

@Module({
  imports: [InvoiceModule, SeriesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
