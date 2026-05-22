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
    path: 'new',
    loadComponent: () =>
      import('./services-detail/services-detail.component').then(
        (m) => m.ServicesDetailComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./services-detail/services-detail.component').then(
        (m) => m.ServicesDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./services-detail/services-detail.component').then(
        (m) => m.ServicesDetailComponent,
      ),
  },
];
