import { Route } from '@angular/router';

export const documentGeneratorShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@josanz-erp/document-generator-feature').then(
        (m) => m.documentGeneratorRoutes,
      ),
  },
];
