import { Route } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';
import { FleetDetailComponent } from './fleet-detail/fleet-detail.component';

export const fleetFeatureRoutes: Route[] = [
  { path: '', component: FleetListComponent },
  { path: ':id', component: FleetDetailComponent },
  { path: ':id/edit', component: FleetDetailComponent },
];

export * from './fleet-list/fleet-list.component';
