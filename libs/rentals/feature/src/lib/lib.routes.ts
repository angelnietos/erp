import { Route } from '@angular/router';
import { RentalsListComponent } from './rentals-list/rentals-list.component';
import { RentalsDetailComponent } from './rentals-detail/rentals-detail.component';

export const rentalsFeatureRoutes: Route[] = [
  { path: '', component: RentalsListComponent },
  { path: ':id', component: RentalsDetailComponent },
];

export * from './rentals-list/rentals-list.component';
export * from './rentals-detail/rentals-detail.component';
