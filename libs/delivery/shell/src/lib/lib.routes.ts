import { Route } from '@angular/router';

export const deliveryShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/delivery-feature').then(m => m.deliveryFeatureRoutes),
  },
];

export * from './delivery-shell/delivery-shell';
