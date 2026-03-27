import { Route } from '@angular/router';

export const fleetShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/fleet-feature').then(m => m.fleetFeatureRoutes),
  },
];
