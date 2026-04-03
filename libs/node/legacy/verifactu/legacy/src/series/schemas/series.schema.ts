import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InvoiceSeries {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  prefix: string;

  @Prop({ required: true, default: 1 })
  nextNumber: number;

  @Prop({ required: true, default: 4 })
  padding: number;

  @Prop({
    required: true,
    enum: ['INVOICE', 'RECTIFICATION', 'CREDIT', 'DEBIT'],
  })
  type: string;

  @Prop({ required: true })
  year: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: true })
  automaticNumbering: boolean;

  @Prop({ default: false })
  resetYearly: boolean;

  @Prop({ required: true, index: true })
  sellerNif: string;
}

export type InvoiceSeriesDocument = InvoiceSeries & Document;
export const InvoiceSeriesSchema = SchemaFactory.createForClass(InvoiceSeries);

// Create compound index for unique series per seller/type/year
InvoiceSeriesSchema.index({ sellerNif: 1, type: 1, year: 1 }, { unique: true });
