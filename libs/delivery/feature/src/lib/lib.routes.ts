import { Route } from '@angular/router';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';

export const deliveryFeatureRoutes: Route[] = [
  { path: '', component: DeliveryListComponent },
  { path: ':id', loadComponent: () => import('@josanz-erp/shared-ui-kit').then(m => m.DetailPlaceholderComponent) },
];

export * from './delivery-list/delivery-list.component';
