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
  {
    path: 'users',
    loadChildren: () =>
      import('@josanz-erp/josanz-users-shell').then((m) => m.josanzUsersRoutes),
  },
  {
    path: 'stock',
    loadChildren: () =>
      import('@josanz-erp/josanz-stock-shell').then((m) => m.josanzStockRoutes),
  },
];
