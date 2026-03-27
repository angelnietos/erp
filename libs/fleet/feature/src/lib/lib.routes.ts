import { Route } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';

export const fleetFeatureRoutes: Route[] = [
  { path: '', component: FleetListComponent },
];

export * from './fleet-list/fleet-list.component';
