import { Route } from '@angular/router';

export const billingShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/billing-feature').then(m => m.billingFeatureRoutes),
  },
];
