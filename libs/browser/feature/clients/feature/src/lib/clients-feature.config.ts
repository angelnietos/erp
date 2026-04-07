import { InjectionToken } from '@angular/core';

export interface ClientsFeatureConfig {
  defaultColumns: { key: string; header: string; width?: string }[];
  enableDelete: boolean;
  enableExport: boolean;
}

export const defaultClientsConfig: ClientsFeatureConfig = {
  defaultColumns: [
    { key: 'name', header: 'Nombre' },
    { key: 'sector', header: 'Sector' },
    { key: 'contact', header: 'Contacto' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'createdAt', header: 'Fecha Alta' },
    { key: 'actions', header: '', width: '120px' },
  ],
  enableDelete: true,
  enableExport: true
};

export const CLIENTS_FEATURE_CONFIG = new InjectionToken<ClientsFeatureConfig>(
  'CLIENTS_FEATURE_CONFIG',
  {
    factory: () => defaultClientsConfig,
    providedIn: 'root'
  }
);
