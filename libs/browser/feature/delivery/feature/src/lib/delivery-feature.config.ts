import { InjectionToken } from '@angular/core';

export interface DeliveryFeatureConfig {
  defaultColumns: { key: string; header: string; width?: string }[];
  enableDelete: boolean;
  enableCreate: boolean;
  enableSign: boolean;
}

export const defaultDeliveryConfig: DeliveryFeatureConfig = {
  defaultColumns: [
    { key: 'id', header: 'Referencia', width: '120px' },
    { key: 'budgetId', header: 'Presupuesto', width: '120px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'deliveryDate', header: 'Fecha Entrega', width: '120px' },
    { key: 'returnDate', header: 'Fecha Devolución', width: '120px' },
    { key: 'itemsCount', header: 'Items', width: '80px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', width: '140px' },
  ],
  enableDelete: true,
  enableCreate: true,
  enableSign: true,
};

export const DELIVERY_FEATURE_CONFIG = new InjectionToken<DeliveryFeatureConfig>(
  'DELIVERY_FEATURE_CONFIG',
  {
    factory: () => defaultDeliveryConfig,
    providedIn: 'root'
  }
);
