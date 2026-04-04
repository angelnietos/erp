import { Routes } from '@angular/router';

export const identityRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.LoginComponent),
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
