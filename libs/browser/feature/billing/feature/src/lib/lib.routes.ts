import { Route } from '@angular/router';
import { BillingListComponent } from './billing-list/billing-list.component';
import { BillingDetailComponent } from './billing-detail/billing-detail.component';

export const billingFeatureRoutes: Route[] = [
  { path: '', component: BillingListComponent },
  { path: ':id', component: BillingDetailComponent },
  { path: ':id/edit', component: BillingDetailComponent },
];

export * from './billing-list/billing-list.component';
