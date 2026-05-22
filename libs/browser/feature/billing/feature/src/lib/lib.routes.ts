import { Route } from '@angular/router';
import { BillingListComponent } from './billing-list/billing-list.component';
import { BillingDetailComponent } from './billing-detail/billing-detail.component';
import { BillingEditComponent } from './billing-edit/billing-edit.component';

export const billingFeatureRoutes: Route[] = [
  { path: '', component: BillingListComponent },
  { path: 'new', component: BillingEditComponent },
  { path: ':id/edit', component: BillingEditComponent },
  { path: ':id', component: BillingDetailComponent },
];

export * from './billing-list/billing-list.component';
export * from './billing-edit/billing-edit.component';
