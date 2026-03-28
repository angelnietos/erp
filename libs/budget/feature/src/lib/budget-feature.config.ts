import { InjectionToken } from '@angular/core';

export interface BudgetFeatureConfig {
  defaultColumns: { key: string; header: string; width?: string }[];
  enableDownload: boolean;
  enableCreate: boolean;
}

export const defaultBudgetConfig: BudgetFeatureConfig = {
  defaultColumns: [
    { key: 'id', header: 'Referencia', width: '120px' },
    { key: 'createdAt', header: 'Fecha', width: '150px' },
    { key: 'startDate', header: 'Inicio', width: '120px' },
    { key: 'endDate', header: 'Fin', width: '120px' },
    { key: 'clientId', header: 'Cliente' },
    { key: 'total', header: 'Total', width: '150px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', width: '100px' },
  ],
  enableDownload: true,
  enableCreate: true,
};

export const BUDGET_FEATURE_CONFIG = new InjectionToken<BudgetFeatureConfig>(
  'BUDGET_FEATURE_CONFIG',
  {
    factory: () => defaultBudgetConfig,
    providedIn: 'root'
  }
);
