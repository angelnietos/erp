import { Route } from '@angular/router';

export const auditFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/audit-trail.component').then(
        (m) => m.AuditTrailComponent,
      ),
  },
];
