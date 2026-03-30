import { Route } from '@angular/router';
import { RentalsListComponent } from '@josanz-erp/rentals-feature';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const rentalsShellRoutes: Route[] = [
  { path: '', component: RentalsListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export { RentalsListComponent } from '@josanz-erp/rentals-feature';
