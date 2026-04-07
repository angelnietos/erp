import { Route } from '@angular/router';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';

export const deliveryFeatureRoutes: Route[] = [
  { path: '', component: DeliveryListComponent },
  { path: ':id', component: DeliveryDetailComponent },
];

export * from './delivery-list/delivery-list.component';
