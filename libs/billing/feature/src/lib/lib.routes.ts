import { Route } from '@angular/router';
import { BillingListComponent } from './billing-list/billing-list.component';

export const billingFeatureRoutes: Route[] = [
  { path: '', component: BillingListComponent },
  { path: ':id', loadComponent: () => import('./billing-detail/billing-detail.component').then(m => m.BillingDetailComponent) },
];

export * from './billing-list/billing-list.component';
