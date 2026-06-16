/**
 * Capa de presentación por tenant (mismo backend, distinto shell/login).
 *
 * - `classic` — layout gaming Josanz (`shared-ui-shell`)
 * - `babooni` — layout Biosstel (`babooni-ui`)
 * - `josanz-figma` — layout Figma / `josanz-ui` (apps/josanz-web-app)
 */
export type ErpTenantUiShell = 'classic' | 'babooni' | 'josanz-figma';

/** Slug → shell. Añade tenants aquí; no hace falta duplicar backend ni despliegue. */
export const TENANT_UI_SHELL_BY_SLUG: Readonly<Record<string, ErpTenantUiShell>> = {
  babooni: 'babooni',
  /** Solo el tenant demo Figma; el resto usa ERP clásico por defecto. */
  alexis: 'josanz-figma',
};

export function normalizeTenantSlug(slug: string | null | undefined): string {
  return (slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function getTenantUiShell(slug: string | null | undefined): ErpTenantUiShell {
  const key = normalizeTenantSlug(slug);
  return TENANT_UI_SHELL_BY_SLUG[key] ?? 'classic';
}

/** Login Figma de dos columnas (`Login.svg` / josanz-ui). */
export function usesJosanzFigmaLogin(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'josanz-figma';
}

export function isBabooniUiShell(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'babooni';
}

export function isJosanzFigmaUiShell(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'josanz-figma';
}
