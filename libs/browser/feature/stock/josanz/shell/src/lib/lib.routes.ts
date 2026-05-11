import { Route } from '@angular/router';

export const josanzStockRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then(
        (m) => m.JosanzStockListComponent
      ),
  },
];
