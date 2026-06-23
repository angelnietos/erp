import { Route, CanMatchFn } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import {
  erpAuthGuard,
  josanzFigmaShellCanMatch,
  documentGeneratorShellCanMatch,
  classicErpShellCanMatch,
  redirectToTenantHomeGuard,
} from '@josanz-erp/identity-data-access';
import { josanzFigmaAppRoutes } from './josanz-figma.routes';
import { classicErpAppRoutes } from './classic-erp.routes';
import { documentGeneratorAppRoutes } from './document-generator.routes';

/** canMatch no es compatible con redirectTo en la misma ruta. */
function withShellMatch(routes: Route[], canMatch: CanMatchFn): Route[] {
  return routes.map((route) =>
    route.redirectTo != null ? route : { ...route, canMatch: [canMatch] },
  );
}

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [redirectToTenantHomeGuard],
    children: [],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@josanz-erp/identity-shell').then((m) => m.identityRoutes),
  },
  {
    path: '',
    component: MainAppShellComponent,
    canActivate: [erpAuthGuard],
    children: [
      ...withShellMatch(documentGeneratorAppRoutes, documentGeneratorShellCanMatch),
      ...withShellMatch(josanzFigmaAppRoutes, josanzFigmaShellCanMatch),
      ...withShellMatch(classicErpAppRoutes, classicErpShellCanMatch),
      {
        path: '**',
        canActivate: [redirectToTenantHomeGuard],
        children: [],
      },
    ],
  },
  {
    path: '**',
    canActivate: [redirectToTenantHomeGuard],
    children: [],
  },
];
