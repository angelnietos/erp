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
    path: 'bot',
    loadComponent: () =>
      import('./documents-bot/documents-bot.component').then(
        (m) => m.DocumentsBotComponent,
      ),
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
  {
    path: 'preview-download/:id',
    loadComponent: () =>
      import(
        './document-preview-download/document-preview-download.component'
      ).then((m) => m.DocumentPreviewDownloadComponent),
  },
  {
    path: 'analysis',
    loadComponent: () =>
      import('./document-analysis/document-analysis.component').then(
        (m) => m.DocumentAnalysisComponent,
      ),
  },
];
