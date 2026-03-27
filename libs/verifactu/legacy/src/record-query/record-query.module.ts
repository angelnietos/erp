import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordQueryService } from './record-query.service';
import { RecordQueryController } from './record-query.controller';
import { VeriFactuModule } from '../verifactu.module';
import { Invoice, InvoiceSchema } from '../../database/schemas/invoice.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    VeriFactuModule,
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [RecordQueryService],
  controllers: [RecordQueryController],
  exports: [RecordQueryService],
})
export class RecordQueryModule {}
