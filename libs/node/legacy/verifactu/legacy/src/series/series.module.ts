import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceSeries, InvoiceSeriesSchema } from './schemas/series.schema';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvoiceSeries.name, schema: InvoiceSeriesSchema },
    ]),
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
