import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getErpTenantSlug } from '../utils/erp-tenant-theme';
import {
  ErpTenantUiShell,
  getTenantUiShell,
  isJosanzFigmaUiShell,
} from '../utils/tenant-ui-shell';

/** Rutas solo del ERP clásico que no existen en shells alternativos. */
const CLASSIC_ONLY_PREFIXES = [
  '/services',
  '/projects',
  '/reports',
  '/audit',
  '/receipts',
  '/inventory',
  '/delivery',
  '/fleet',
  '/verifactu',
  '/rentals',
  '/ai-insights',
  '/not-found',
];

function homeRouteForShell(shell: ErpTenantUiShell): string | null {
  if (shell === 'josanz-figma') {
    return '/dashboard';
  }
  if (shell === 'document-generator') {
    return '/documents/list';
  }
  return null;
}

/**
 * Si el tenant usa shell alternativo (Figma, docs…) y entra en una ruta clásica, redirige al home del shell.
 */
export const redirectAlternateShellFromClassicRoutes: CanActivateFn = (_route, state) => {
  const slug = getErpTenantSlug();
  const shell = getTenantUiShell(slug);
  const home = homeRouteForShell(shell);
  if (!home) {
    return true;
  }
  const url = state.url.split('?')[0] ?? '';
  const isClassicOnly = CLASSIC_ONLY_PREFIXES.some(
    (p) => url === p || url.startsWith(`${p}/`),
  );
  if (!isClassicOnly) {
    return true;
  }
  return inject(Router).createUrlTree([home]);
};

/** @deprecated Usar {@link redirectAlternateShellFromClassicRoutes}. */
export const redirectFigmaShellFromClassicRoutes: CanActivateFn = (_route, state) => {
  if (!isJosanzFigmaUiShell(getErpTenantSlug())) {
    return true;
  }
  return redirectAlternateShellFromClassicRoutes(_route, state);
};
