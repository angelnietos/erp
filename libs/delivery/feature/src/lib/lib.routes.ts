import { Route } from '@angular/router';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';

export const deliveryFeatureRoutes: Route[] = [
  { path: '', component: DeliveryListComponent },
  { path: ':id', loadComponent: () => import('./delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent) },
];

export * from './delivery-list/delivery-list.component';
