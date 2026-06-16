import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getErpTenantSlug } from '../utils/erp-tenant-theme';
import { isJosanzFigmaUiShell } from '../utils/tenant-ui-shell';

/** Rutas solo del ERP clásico que no existen en josanz-web-app. */
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

/**
 * Si el tenant usa shell Figma (alexis) y entra en una ruta clásica, vuelve al dashboard Figma.
 */
export const redirectFigmaShellFromClassicRoutes: CanActivateFn = (_route, state) => {
  if (!isJosanzFigmaUiShell(getErpTenantSlug())) {
    return true;
  }
  const url = state.url.split('?')[0] ?? '';
  const isClassicOnly = CLASSIC_ONLY_PREFIXES.some(
    (p) => url === p || url.startsWith(`${p}/`),
  );
  if (!isClassicOnly) {
    return true;
  }
  return inject(Router).createUrlTree(['/dashboard']);
};
