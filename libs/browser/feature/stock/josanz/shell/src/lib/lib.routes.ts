import { Route } from '@angular/router';

export const josanzStockRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockListComponent),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockProductCreateComponent),
  },
  {
    path: 'products/:productId',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockProductDetailComponent),
  },
  {
    path: 'warehouses/new',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockWarehouseCreateComponent),
  },
];
