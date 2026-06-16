import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { erpAuthGuard } from '@josanz-erp/identity-data-access';
import {
  josanzFigmaShellCanMatch,
  classicErpShellCanMatch,
} from '@josanz-erp/identity-data-access';
import { josanzFigmaAppRoutes } from './josanz-figma.routes';
import { classicErpAppRoutes } from './classic-erp.routes';

function withShellMatch(routes: Route[], canMatch: typeof josanzFigmaShellCanMatch): Route[] {
  return routes.map((route) => ({ ...route, canMatch: [canMatch] }));
}

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
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
      ...withShellMatch(josanzFigmaAppRoutes, josanzFigmaShellCanMatch),
      ...withShellMatch(classicErpAppRoutes, classicErpShellCanMatch),
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
