import { Route } from '@angular/router';

export const servicesShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/services-feature').then(m => m.servicesFeatureRoutes),
  },
];
