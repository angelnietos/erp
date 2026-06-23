import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { NotFoundComponent } from './not-found.component';
import { docsAppAuthGuard } from './docs-auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'documents',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@josanz-erp/identity-shell').then((m) => m.identityRoutes),
  },
  {
    path: '',
    component: MainAppShellComponent,
    canActivate: [docsAppAuthGuard],
    children: [
      {
        path: 'documents',
        loadChildren: () =>
          import('@josanz-erp/document-generator-feature').then(
            (m) => m.documentGeneratorRoutes,
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
