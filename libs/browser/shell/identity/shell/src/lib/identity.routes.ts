import { Routes } from '@angular/router';

export const identityRoutes: Routes = [
  {
    path: '',
    redirectTo: 'tenant',
    pathMatch: 'full',
  },
  {
    path: 'tenant',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.TenantSelectComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.LoginComponent),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.ResetPasswordComponent),
  },
];

export const usersRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@josanz-erp/identity-feature').then(
        (m) => m.identityFeatureRoutes,
      ),
  },
];
