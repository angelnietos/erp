import { Route } from '@angular/router';
import { UsersListComponent } from './users/users-list.component';
import { TechnicianAvailabilityComponent } from './users/technician-availability.component';

/** Rutas bajo `/users`: lista en la raíz (antes había un placeholder «IdentityFeature works»). */
export const identityFeatureRoutes: Route[] = [
  { path: '', component: UsersListComponent },
  { path: 'availability', component: TechnicianAvailabilityComponent },
];
