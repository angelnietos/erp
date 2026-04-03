import { Route } from '@angular/router';

export const clientsShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/clients-feature').then(m => m.clientsFeatureRoutes),
  },
];
