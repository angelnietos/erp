import { Route } from '@angular/router';

export const eventsShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/events-feature').then(m => m.eventsFeatureRoutes),
  },
];