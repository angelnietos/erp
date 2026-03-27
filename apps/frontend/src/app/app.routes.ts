import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('@josanz-erp/identity-shell').then(m => m.identityRoutes),
  },
  {
    path: 'login',
    loadComponent: () => import('@josanz-erp/identity-feature').then((m) => m.LoginComponent),
  },
  {
    path: 'budgets',
    loadChildren: () => import('@josanz-erp/budget-shell').then((m) => m.budgetRoutes),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
