export interface VerifactuWebhookEvent {
  id?: string;
  eventType: 'invoice.sent' | 'invoice.error' | 'invoice.cancelled';
  tenantId: string;
  invoiceId: string;
  payload: Record<string, unknown>;
}

export interface WebhookNotifierPort {
  notify(event: VerifactuWebhookEvent): Promise<void>;
}

export const WEBHOOK_NOTIFIER = Symbol('WEBHOOK_NOTIFIER');

