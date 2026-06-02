import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { NotFoundComponent } from './not-found.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'documents',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainAppShellComponent,
    children: [
      {
        path: 'documents',
        loadChildren: () =>
          import('@josanz-erp/document-generator-shell').then(
            (m) => m.documentGeneratorShellRoutes,
          ),
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
