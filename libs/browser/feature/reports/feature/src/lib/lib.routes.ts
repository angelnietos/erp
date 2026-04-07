import { Route } from '@angular/router';

export const reportsFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/reports.component').then((m) => m.ReportsComponent),
  },
];
