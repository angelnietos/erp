import { Route } from '@angular/router';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const deliveryFeatureRoutes: Route[] = [
  { path: '', component: DeliveryListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export * from './delivery-list/delivery-list.component';
