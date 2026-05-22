import { Route } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';
import { FleetDetailComponent } from './fleet-detail/fleet-detail.component';
import { FleetEditComponent } from './fleet-edit/fleet-edit.component';

export const fleetFeatureRoutes: Route[] = [
  { path: '', component: FleetListComponent },
  { path: 'new', component: FleetEditComponent },
  { path: ':id/edit', component: FleetEditComponent },
  { path: ':id', component: FleetDetailComponent },
];

export * from './fleet-list/fleet-list.component';
