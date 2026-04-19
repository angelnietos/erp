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
      import('./platform-shell.component').then((m) => m.PlatformShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./tenants-page.component').then((m) => m.TenantsPageComponent),
      },
      {
        path: 'metrics',
        loadComponent: () =>
          import('./metrics-page.component').then((m) => m.MetricsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
