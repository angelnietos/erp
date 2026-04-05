import { Route } from '@angular/router';

export const eventsFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/feature').then(
        (m) => m.Feature,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./feature/feature').then(
        (m) => m.Feature,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./feature/feature').then(
        (m) => m.Feature,
      ),
  },
];