import { Route } from '@angular/router';

export const josanzClientsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/feature-list').then(
        (m) => m.JosanzClientsListComponent
      ),
  },
];
