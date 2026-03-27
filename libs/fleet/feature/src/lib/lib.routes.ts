import { Route } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';

export const fleetFeatureRoutes: Route[] = [
  { path: '', component: FleetListComponent },
  { path: ':id', loadComponent: () => import('./fleet-detail/fleet-detail.component').then(m => m.FleetDetailComponent) },
];

export * from './fleet-list/fleet-list.component';
