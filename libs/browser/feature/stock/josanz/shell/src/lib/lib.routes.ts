import { Route } from '@angular/router';

export const josanzStockRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockProductCreateComponent),
  },
  {
    path: 'warehouses/new',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockWarehouseCreateComponent),
  },
  {
    path: 'warehouses/:warehouseId',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockWarehouseDetailComponent),
  },
  {
    path: 'products/new',
    redirectTo: 'new',
    pathMatch: 'full',
  },
  {
    path: 'products/:productId',
    redirectTo: ':productId',
  },
  {
    path: ':productId',
    loadComponent: () =>
      import('@josanz-erp/josanz-stock-feature-list').then((m) => m.JosanzStockProductDetailComponent),
  },
];
