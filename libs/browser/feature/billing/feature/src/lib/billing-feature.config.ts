import { InjectionToken } from '@angular/core';

export interface BillingFeatureConfig {
  defaultColumns: { key: string; header: string; width?: string }[];
  enableCreate: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableVerifactu: boolean;
}

export const defaultBillingConfig: BillingFeatureConfig = {
  defaultColumns: [
    { key: 'invoiceNumber', header: 'Factura', width: '120px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'type', header: 'Tipo', width: '120px' },
    { key: 'total', header: 'Importe', width: '120px' },
    { key: 'issueDate', header: 'Fecha Emisión', width: '120px' },
    { key: 'dueDate', header: 'Vencimiento', width: '120px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'verifactuStatus', header: 'Verifactu', width: '120px' },
    { key: 'actions', header: '', width: '160px' },
  ],
  enableCreate: true,
  enableEdit: true,
  enableDelete: true,
  enableVerifactu: true, // Specific tenant parameter
};

export const BILLING_FEATURE_CONFIG = new InjectionToken<BillingFeatureConfig>(
  'BILLING_FEATURE_CONFIG',
  {
    factory: () => defaultBillingConfig,
    providedIn: 'root'
  }
);
