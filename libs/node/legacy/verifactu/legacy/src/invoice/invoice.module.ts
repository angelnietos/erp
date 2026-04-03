import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceValidationService } from './services/invoice-validation.service';
import { InvoiceAnalyticsService } from './services/invoice-analytics.service';
import { AdvancedValidationService } from './services/advanced-validation.service';
import { InvoiceExportService } from './services/export.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { XmlBuilderService } from '../xml/xml-builder.service';
import { AeatSoapService } from '../aeat/aeat-soap.service';
import { QrService } from '../qr/qr.service';
import { HashService } from '../hash/hash.service';
import { InvoiceQueueService } from '../queue/invoice-queue.service';
import { QueueRetryService } from '../queue/services/queue-retry.service';
import { CertificateService } from '../certificate/certificate.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceValidationService,
    InvoiceAnalyticsService,
    AdvancedValidationService,
    InvoiceExportService,
    BlockchainService,
    XmlBuilderService,
    AeatSoapService,
    QrService,
    HashService,
    InvoiceQueueService,
    QueueRetryService,
    CertificateService,
  ],
  exports: [InvoiceService, InvoiceValidationService, InvoiceAnalyticsService],
})
export class InvoiceModule {}
