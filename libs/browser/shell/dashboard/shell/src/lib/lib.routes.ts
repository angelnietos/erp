import { Route } from '@angular/router';

export const dashboardShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@josanz-erp/dashboard-feature').then(
        (m) => m.dashboardFeatureRoutes,
      ),
  },
];
