import { Route } from '@angular/router';
import { BillingListComponent } from './billing-list/billing-list.component';

export const billingFeatureRoutes: Route[] = [
  { path: '', component: BillingListComponent },
  { path: ':id', loadComponent: () => import('@josanz-erp/shared-ui-kit').then(m => m.DetailPlaceholderComponent) },
];

export * from './billing-list/billing-list.component';
