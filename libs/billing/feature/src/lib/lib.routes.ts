import { Route } from '@angular/router';
import { BillingListComponent } from './billing-list/billing-list.component';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const billingFeatureRoutes: Route[] = [
  { path: '', component: BillingListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export * from './billing-list/billing-list.component';
