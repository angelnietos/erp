import { Route } from '@angular/router';

export const inventoryShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/inventory-feature').then(m => m.inventoryFeatureRoutes),
  },
];
