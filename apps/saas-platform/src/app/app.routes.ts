import { Route } from '@angular/router';
import { platformAuthGuard } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'login/callback',
    loadComponent: () =>
      import('./login-callback.component').then((m) => m.LoginCallbackComponent),
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
        path: 'tenants/:tenantId',
        loadComponent: () =>
          import('./tenant-detail-page.component').then(
            (m) => m.TenantDetailPageComponent,
          ),
      },
      {
        path: 'metrics',
        loadComponent: () =>
          import('./metrics-page.component').then((m) => m.MetricsPageComponent),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./permissions-policy-page.component').then(
            (m) => m.PermissionsPolicyPageComponent,
          ),
      },
      {
        path: 'platform-users',
        loadComponent: () =>
          import('./platform-users-page.component').then(
            (m) => m.PlatformUsersPageComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
