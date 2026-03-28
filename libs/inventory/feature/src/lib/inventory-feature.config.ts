import { InjectionToken } from '@angular/core';

export interface InventoryFeatureConfig {
  defaultColumns: { key: string; header: string; width?: string }[];
  enableCreate: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
}

export const defaultInventoryConfig: InventoryFeatureConfig = {
  defaultColumns: [
    { key: 'name', header: 'Producto' },
    { key: 'sku', header: 'SKU', width: '120px' },
    { key: 'category', header: 'Categoría', width: '120px' },
    { key: 'totalStock', header: 'Stock', width: '100px' },
    { key: 'dailyRate', header: 'Tarifa/Día', width: '120px' },
    { key: 'status', header: 'Estado', width: '130px' },
    { key: 'actions', header: '', width: '100px' },
  ],
  enableCreate: true,
  enableEdit: true,
  enableDelete: true,
};

export const INVENTORY_FEATURE_CONFIG = new InjectionToken<InventoryFeatureConfig>(
  'INVENTORY_FEATURE_CONFIG',
  {
    factory: () => defaultInventoryConfig,
    providedIn: 'root'
  }
);
