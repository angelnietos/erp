import { Route } from '@angular/router';

/**
 * Rutas de apps/document-generator integradas en el ERP (:4200).
 * Se activan con canMatch cuando el tenant usa shell `document-generator` (p. ej. docs).
 * El redirect de `/` lo resuelve {@link redirectToTenantHomeGuard} en app.routes.
 */
export const documentGeneratorAppRoutes: Route[] = [
  {
    path: 'documents',
    loadChildren: () =>
      import('@josanz-erp/document-generator-feature').then(
        (m) => m.documentGeneratorRoutes,
      ),
  },
];
