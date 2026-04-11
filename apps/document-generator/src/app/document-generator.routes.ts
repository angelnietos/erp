import { Route } from '@angular/router';

export const documentGeneratorRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./document-list/document-list.component').then(
        (m) => m.DocumentListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./document-create/document-create.component').then(
        (m) => m.DocumentCreateComponent,
      ),
  },
  {
    path: 'preview/:id',
    loadComponent: () =>
      import('./document-preview/document-preview.component').then(
        (m) => m.DocumentPreviewComponent,
      ),
  },
];
