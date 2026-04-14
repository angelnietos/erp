import { Route } from '@angular/router';
import { UsersListComponent } from './users/users-list.component';
import { TechnicianAvailabilityComponent } from './users/technician-availability.component';
import { UserDetailComponent } from './users/user-detail.component';
import { UserEditComponent } from './users/user-edit.component';

/** Rutas bajo `/users`: lista en la raíz, detalle y edición por id. */
export const identityFeatureRoutes: Route[] = [
  { path: '', component: UsersListComponent },
  { path: 'availability', component: TechnicianAvailabilityComponent },
  /** Más específico primero: `…/edit` no debe capturarse como `:id`. */
  { path: ':id/edit', component: UserEditComponent },
  { path: ':id', component: UserDetailComponent },
];
