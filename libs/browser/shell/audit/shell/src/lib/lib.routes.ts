import { Route } from '@angular/router';

export const auditShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/audit-feature').then(m => m.auditFeatureRoutes),
  },
];
