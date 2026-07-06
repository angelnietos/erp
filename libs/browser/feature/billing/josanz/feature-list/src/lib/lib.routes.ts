import { Route } from '@angular/router';
import { JosanzBillingListComponent } from './billing-list/josanz-billing-list';
import { JosanzBillingDetailComponent } from './billing-detail/josanz-billing-detail';

export const josanzBillingFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./billing-list/josanz-billing-list').then(
        (m) => m.JosanzBillingListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./billing-detail/josanz-billing-detail').then((m) => m.JosanzBillingDetailComponent),
  },
];
