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
  {
    path: 'budgets',
    loadComponent: () =>
      import('@josanz-erp/josanz-budgets-feature-list').then(
        (m) => m.JosanzBudgetsFeatureListComponent
      ),
  },
  {
    path: 'delivery-notes',
    loadComponent: () =>
      import('@josanz-erp/josanz-delivery-notes-feature-list').then(
        (m) => m.JosanzDeliveryNotesFeatureListComponent
      ),
  },
];
