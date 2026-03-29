import { Route } from '@angular/router';
import { RentalsListComponent } from '@josanz-erp/rentals-feature';

export const rentalsShellRoutes: Route[] = [
  { path: '', component: RentalsListComponent },
];

export { RentalsListComponent } from '@josanz-erp/rentals-feature';
