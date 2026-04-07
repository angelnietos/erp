import { Route } from '@angular/router';

export const receiptsFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/receipts-list.component').then(
        (m) => m.ReceiptsListComponent,
      ),
  },
];
