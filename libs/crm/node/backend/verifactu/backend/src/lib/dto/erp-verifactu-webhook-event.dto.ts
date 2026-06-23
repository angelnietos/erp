import { IsIn, IsObject, IsUUID } from 'class-validator';

export class ErpVerifactuWebhookEventDto {
  @IsIn(['invoice.sent', 'invoice.error'])
  eventType!: 'invoice.sent' | 'invoice.error';

  @IsUUID()
  tenantId!: string;

  @IsUUID()
  invoiceId!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
