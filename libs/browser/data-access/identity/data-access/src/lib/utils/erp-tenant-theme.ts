import { ERP_TENANT_SLUG_SESSION_KEY } from '../services/auth.service';

/**
 * Slug del tenant ERP actual (`sessionStorage` tras login, o atributo en `<html>`).
 */
export function getErpTenantSlug(): string {
  if (typeof sessionStorage !== 'undefined') {
    const s = sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)?.trim();
    if (s) {
      return s.toLowerCase();
    }
  }
  if (typeof document !== 'undefined') {
    const a = document.documentElement.getAttribute('data-erp-tenant')?.trim();
    if (a) {
      return a.toLowerCase();
    }
  }
  return 'josanz';
}

/**
 * Marca el tenant ERP en `<html>` para estilos condicionales.
 * `babooni` → paleta Biosstel (referencia front-biosstel); el resto mantiene el look Josanz actual.
 */
export function syncErpTenantHtmlTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }
  let slug =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)
      : null;
  if (!slug?.trim()) {
    slug = 'josanz';
  }
  document.documentElement.setAttribute(
    'data-erp-tenant',
    slug.trim().toLowerCase(),
  );
}
