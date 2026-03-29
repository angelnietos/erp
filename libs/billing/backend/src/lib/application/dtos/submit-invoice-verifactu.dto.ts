import { IsNotEmpty, IsString } from 'class-validator';

// Re-export from shared API
export { SubmitInvoiceCommand } from '@josanz-erp/billing-api';

// Backend-specific validators
export class SubmitInvoiceVerifactuDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

