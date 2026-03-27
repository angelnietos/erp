import { Module } from '@nestjs/common';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomersModule } from './customers/customers.module';
import { SeriesModule } from './series/series.module';
import { DataMigratorModule } from './data-migrator/data-migrator.module';
import { DocumentsModule } from './documents/documents.module';
import { BlockchainService } from './blockchain/blockchain.service';
import { XmlBuilderService } from './xml/xml-builder.service';
import { AeatSoapService } from './aeat/aeat-soap.service';
import { QrService } from './qr/qr.service';
import { HashService } from './hash/hash.service';
import { InvoiceQueueService } from './queue/invoice-queue.service';
import { CertificateService } from './certificate/certificate.service';

/**
 * VeriFactu Module
 * Módulo principal para la funcionalidad AEAT de facturación electrónica
 *
 * Incluye:
 * - Gestión de facturas
 * - Comunicación con AEAT (SOAP)
 * - Blockchain para registro inmutable
 * - Certificados digitales
 * - Generación de QR
 * - Cola de procesamiento de facturas
 * - Construcción de XML
 * - Hash para integridad
 */
@Module({
  imports: [InvoiceModule, CustomersModule, SeriesModule, DataMigratorModule, DocumentsModule],
  providers: [
    BlockchainService,
    XmlBuilderService,
    AeatSoapService,
    QrService,
    HashService,
    InvoiceQueueService,
    CertificateService,
  ],
  exports: [
    InvoiceModule,
    BlockchainService,
    XmlBuilderService,
    AeatSoapService,
    QrService,
    HashService,
    InvoiceQueueService,
    CertificateService,
  ],
})
export class VeriFactuModule {}
