import { Route } from '@angular/router';

export const receiptsShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/receipts-feature').then(m => m.receiptsFeatureRoutes),
  },
];
