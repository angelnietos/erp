import { Route } from '@angular/router';

export const josanzUsersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-users-feature-list').then(
        (m) => m.JosanzUsersListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-users-feature-list').then(
        (m) => m.JosanzUserCreateComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-users-feature-list').then(
        (m) => m.JosanzUserDetailComponent,
      ),
  },
];
