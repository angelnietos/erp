import { Route } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const fleetFeatureRoutes: Route[] = [
  { path: '', component: FleetListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export * from './fleet-list/fleet-list.component';
