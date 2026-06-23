import { Route } from '@angular/router';
import { sessionRequiredGuard } from './guards/session-required.guard';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/verifactu-login.component').then(
        (m) => m.VerifactuLoginComponent,
      ),
  },
  {
    path: 'login/callback',
    loadComponent: () =>
      import('./auth/verifactu-login-callback.component').then(
        (m) => m.VerifactuLoginCallbackComponent,
      ),
  },
  {
    path: 'identity',
    loadChildren: () =>
      import('@generic-crm/identity-shell').then((m) => m.identityShellRoutes),
  },
  {
    path: 'clients',
    canActivate: [sessionRequiredGuard],
    loadChildren: () =>
      import('@generic-crm/clients-shell').then((m) => m.clientsShellRoutes),
  },
  {
    path: 'verifactu',
    canActivate: [sessionRequiredGuard],
    loadChildren: () =>
      import('@generic-crm/verifactu-shell').then(
        (m) => m.verifactuShellRoutes,
      ),
  },
];
