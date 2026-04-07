// Shared types for Billing domain
export interface SubmitInvoiceCommand {
  tenantId: string;
  invoiceId: string;
}

export interface SubmitInvoiceResult {
  success: boolean;
  submittedAt: string;
}

// Stub
export function billingApi(): string {
  return 'billing-api';
}
