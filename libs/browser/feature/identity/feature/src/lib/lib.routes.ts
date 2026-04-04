import { Route } from '@angular/router';
import { IdentityFeature } from './identity-feature/identity-feature';
import { UsersListComponent } from './users/users-list.component';

export const identityFeatureRoutes: Route[] = [
  { path: '', component: IdentityFeature },
  { path: 'users', component: UsersListComponent },
];
