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
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/feature-list').then(
        (m) => m.JosanzClientCreateComponent
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
