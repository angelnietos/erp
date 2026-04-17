import { Route } from '@angular/router';
import { platformAuthGuard } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [platformAuthGuard],
    loadComponent: () =>
      import('./tenants-page.component').then((m) => m.TenantsPageComponent),
  },
  { path: '**', redirectTo: '' },
];
