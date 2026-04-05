import { Route } from '@angular/router';

export const reportsShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/reports-feature').then(m => m.reportsFeatureRoutes),
  },
];
