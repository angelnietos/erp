import { Route } from '@angular/router';

export const servicesFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./services-list/services-list.component').then(
        (m) => m.ServicesListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./services-detail/services-detail.component').then(
        (m) => m.ServicesDetailComponent,
      ),
  },
];
