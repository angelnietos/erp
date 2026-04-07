export interface VerifactuWebhookEvent {
  eventType: 'invoice.sent' | 'invoice.error';
  tenantId: string;
  invoiceId: string;
  payload: Record<string, unknown>;
}

export interface WebhookNotifierPort {
  notify(event: VerifactuWebhookEvent): Promise<void>;
}

export const WEBHOOK_NOTIFIER = Symbol('WEBHOOK_NOTIFIER');

