import { CanMatchFn } from '@angular/router';
import { getErpTenantSlug } from '../utils/erp-tenant-theme';
import { getTenantUiShell } from '../utils/tenant-ui-shell';

/** Rutas / vistas de apps/josanz-web-app + josanz-ui. */
export const josanzFigmaShellCanMatch: CanMatchFn = () =>
  getTenantUiShell(getErpTenantSlug()) === 'josanz-figma';

/** Rutas del ERP clásico (shell gaming o Babooni). */
export const classicErpShellCanMatch: CanMatchFn = () =>
  getTenantUiShell(getErpTenantSlug()) !== 'josanz-figma';
