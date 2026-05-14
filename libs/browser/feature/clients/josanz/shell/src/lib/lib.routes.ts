import { Route } from '@angular/router';

export const josanzClientsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/feature-list').then(
        (m) => m.JosanzClientsListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/feature-list').then(
        (m) => m.JosanzClientDetailComponent
      ),
  },
];
