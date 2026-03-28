import { Route } from '@angular/router';
import { RentalsListComponent } from './rentals-list/rentals-list.component';

export const rentalsFeatureRoutes: Route[] = [
  { path: '', component: RentalsListComponent },
];

export * from './rentals-list/rentals-list.component';
