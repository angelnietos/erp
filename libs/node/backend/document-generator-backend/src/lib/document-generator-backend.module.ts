import { Module } from '@nestjs/common';
import { DocumentGeneratorPdfController } from './presentation/controllers/document-generator-pdf.controller';
import { HtmlPdfService } from './application/services/html-pdf.service';

@Module({
  controllers: [DocumentGeneratorPdfController],
  providers: [HtmlPdfService],
  exports: [HtmlPdfService],
})
export class DocumentGeneratorBackendModule {}
