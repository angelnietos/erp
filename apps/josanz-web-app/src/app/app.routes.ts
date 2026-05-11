import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'clients',
    pathMatch: 'full',
  },
  {
    path: 'clients',
    loadChildren: () =>
      import('@josanz-erp/shell').then((m) => m.josanzClientsRoutes),
  },
];
