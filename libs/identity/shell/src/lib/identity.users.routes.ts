import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.UsersListComponent),
  },
];

