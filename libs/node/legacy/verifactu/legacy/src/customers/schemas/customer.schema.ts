import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Address {
  @Prop()
  street?: string;

  @Prop()
  number?: string;

  @Prop()
  floor?: string;

  @Prop()
  door?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  city?: string;

  @Prop()
  province?: string;

  @Prop({ default: 'ES' })
  country?: string;
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, enum: ['CLIENT', 'PROVIDER', 'BOTH'] })
  type: string;

  @Prop({ required: true, enum: ['NIF', 'NIE', 'PASSPORT', 'OTHER'] })
  idType: string;

  @Prop({ required: true, index: true })
  taxId: string;

  @Prop({ required: true, text: true })
  name: string;

  @Prop({ text: true })
  tradeName?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  web?: string;

  @Prop({ enum: ['GENERAL', 'SIMPLIFIED', 'EXEMPT'] })
  ivaRegime?: string;

  @Prop({ default: true })
  ivaIncluded: boolean;

  @Prop({ type: Number })
  retention?: number;

  @Prop()
  autonomousCommunity?: string;

  @Prop()
  province?: string;

  @Prop({ required: true, index: true })
  sellerNif: string;

  @Prop({ default: true })
  active: boolean;
}

export type CustomerDocument = Customer & Document;
export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Create text index for search
CustomerSchema.index({ name: 'text', tradeName: 'text', taxId: 'text' });
