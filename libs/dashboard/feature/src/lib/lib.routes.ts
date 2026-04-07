import { Route } from '@angular/router';

export const dashboardFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
];
