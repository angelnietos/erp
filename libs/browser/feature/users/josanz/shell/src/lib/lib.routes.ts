import { Route } from '@angular/router';
import { JosanzUsersShell } from './josanz-users-shell/josanz-users-shell';

export const josanzUsersRoutes: Route[] = [
  { path: '', component: JosanzUsersShell },
  { path: 'new', component: JosanzUsersShell },
  { path: ':id', component: JosanzUsersShell },
];
